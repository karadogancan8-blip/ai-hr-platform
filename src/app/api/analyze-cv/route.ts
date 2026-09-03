import { generateObject, generateText } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { parseRequestLocale, replyInLocaleInstruction } from "@/lib/ai-locale";
import { isGeminiConfigured, toClientError, withGeminiModel } from "@/lib/gemini";
import { sanitizeCvText } from "@/lib/cv-text";
import { insertResume, type StoredResume } from "@/lib/resumes";
import { createServerSupabase } from "@/lib/supabase/server";

export const maxDuration = 60;

const GEMINI_TIMEOUT_MS = 22_000;

const cvAnalysisSchema = z.object({
  name: z.string().describe("Adayın adı soyadı; yoksa CV'den makul bir etiket"),
  role: z.string().describe("Hedef veya mevcut unvan"),
  experience: z.string().describe("Kısa deneyim özeti, örn. 5 yıl"),
  location: z.string().describe("Şehir veya ülke; yoksa belirsiz"),
  matchScore: z.number().min(0).max(100).describe("Pozisyona yüzde eşleşme"),
  skills: z.array(z.string()).describe("Öne çıkan beceriler"),
  strengths: z.array(z.string()).describe("Güçlü yönler"),
  weaknesses: z.array(z.string()).describe("Gelişim alanları veya zayıf yönler"),
  summary: z.string().describe("İK uzmanı dilinde 2-3 cümlelik özet"),
});

export type CvAnalysis = z.infer<typeof cvAnalysisSchema>;

const systemPromptTr =
  "Sen RecruiterAgent adlı kıdemli bir işe alım uzmanısın. CV'leri Türkçe, objektif ve profesyonel değerlendir. Uydurma sertifika veya deneyim ekleme; metinde yoksa belirt.";
const systemPromptEn =
  "You are RecruiterAgent, a senior talent-acquisition specialist. Evaluate CVs objectively and professionally. Do not invent certificates or experience; if they are missing from the text, say so.";

const SKILL_LEXICON = [
  "React",
  "Next.js",
  "TypeScript",
  "JavaScript",
  "Node.js",
  "Python",
  "SQL",
  "PostgreSQL",
  "Supabase",
  "Tailwind",
  "Java",
  "Spring",
  "C#",
  ".NET",
  "AWS",
  "Azure",
  "Docker",
  "Kubernetes",
  "Git",
  "HR",
  "İK",
  "SAP",
  "Excel",
  "Salesforce",
];

function analysisPrompt(jobTitle: string, jobDescription: string, cvText: string) {
  return `Açık pozisyon: ${jobTitle}\nPozisyon açıklaması: ${jobDescription}\n\nAday CV / metin:\n${cvText}`;
}

function withTimeout<T>(promise: Promise<T>, ms: number) {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Gemini isteği zaman aşımına uğradı.")), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function parseJsonObject(text: string) {
  const cleaned = text.replace(/```json|```/gi, "").trim();
  const fenced = cleaned.match(/\{[\s\S]*\}/);
  if (!fenced) throw new Error("Gemini geçerli bir analiz JSON'u döndürmedi.");
  return cvAnalysisSchema.parse(JSON.parse(fenced[0]));
}

function guessName(cvText: string) {
  const line = cvText.split("\n").map((item) => item.trim()).find((item) => item.length >= 4 && item.length <= 48);
  if (!line) return "Aday";
  if (/^(cv|özgeçmiş|ozgecmis|resume|curriculum)/i.test(line)) return "Aday";
  return line.replace(/[^A-Za-zÇĞİÖŞÜçğıöşü\s.'-]/g, "").trim() || "Aday";
}

function extractSkills(cvText: string) {
  const lower = cvText.toLocaleLowerCase("tr-TR");
  const found = SKILL_LEXICON.filter((skill) => lower.includes(skill.toLocaleLowerCase("tr-TR")));
  return found.slice(0, 8);
}

function fallbackCvAnalysis(jobTitle: string, cvText: string): CvAnalysis {
  const skills = extractSkills(cvText);
  const titleTokens = jobTitle
    .toLocaleLowerCase("tr-TR")
    .split(/[\s/,-]+/)
    .filter((token) => token.length > 2);
  const haystack = cvText.toLocaleLowerCase("tr-TR");
  const hits = titleTokens.filter((token) => haystack.includes(token)).length;
  const skillBoost = Math.min(18, skills.length * 4);
  const matchScore = Math.min(92, Math.max(58, 62 + hits * 6 + skillBoost));
  const name = guessName(cvText);
  const role = jobTitle || "Açık pozisyon";

  return {
    name,
    role,
    experience: haystack.includes("yıl") || haystack.includes("year") ? "CV’de belirtilen deneyim" : "Belirtilmedi",
    location: /istanbul|ankara|izmir|remote|uzaktan/i.test(cvText) ? "CV’de geçen lokasyon" : "Belirtilmedi",
    matchScore,
    skills: skills.length ? skills : ["İletişim", "Problem çözme", "Takım çalışması"],
    strengths: [
      `${role} ilanıyla örtüşen anahtar kelimeler CV metninde tarandı.`,
      "Somut teslimatlar mülakatta doğrulanmalı.",
    ],
    weaknesses: [
      "Gemini yanıtı alınamadığı için bu ön analiz kural tabanlıdır.",
      "Eksik kanıtlanan yetkinlikler canlı mülakatta sıkıştırılmalı.",
    ],
    summary: `${name} için “${role}” ilanına kural tabanlı ön eşleşme üretildi (yaklaşık %${matchScore}). Nihai karar insan yöneticidedir; Gemini erişilemediğinde yedek analiz kullanılır.`,
  };
}

function toStoredResume(analysis: CvAnalysis, saved?: StoredResume | null): StoredResume {
  if (saved) return saved;
  return {
    id: crypto.randomUUID(),
    name: analysis.name,
    role: analysis.role,
    matchScore: Math.round(analysis.matchScore),
    interviewScore: null,
    interviewNotes: "",
    summary: analysis.summary,
    skills: analysis.skills,
    strengths: analysis.strengths,
    weaknesses: analysis.weaknesses,
    createdAt: new Date().toISOString(),
  };
}

async function analyzeCv(
  jobTitle: string,
  jobDescription: string,
  cvText: string,
  locale = parseRequestLocale("tr"),
): Promise<{ object: CvAnalysis; fallback: boolean; warning?: string }> {
  const prompt = analysisPrompt(jobTitle, jobDescription, cvText);
  const base = locale === "en" ? systemPromptEn : systemPromptTr;
  const system = `${base} ${replyInLocaleInstruction(locale)} Put JSON string values in that language.`;

  try {
    const { object } = await withTimeout(
      withGeminiModel((model) =>
        generateObject({
          model,
          schema: cvAnalysisSchema,
          system,
          prompt,
          maxRetries: 1,
          abortSignal: AbortSignal.timeout(GEMINI_TIMEOUT_MS),
        }),
      ),
      GEMINI_TIMEOUT_MS,
    );
    return { object };
  } catch (first) {
    try {
      const { text } = await withTimeout(
        withGeminiModel((model) =>
          generateText({
            model,
            system: `${system} Yalnızca JSON nesnesi döndür.`,
            prompt,
            maxRetries: 1,
            abortSignal: AbortSignal.timeout(GEMINI_TIMEOUT_MS),
          }),
        ),
        GEMINI_TIMEOUT_MS,
      );
      return { object: parseJsonObject(text) };
    } catch (second) {
      console.error("[analyze-cv] gemini", first, second);
      return {
        object: fallbackCvAnalysis(jobTitle, cvText),
        fallback: true,
        warning: toClientError(second, "Gemini yanıt vermedi; yedek analiz kullanıldı."),
      };
    }
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      cvText?: string;
      jobTitle?: string;
      jobDescription?: string;
      locale?: string;
    };

    const cvText = sanitizeCvText(body.cvText ?? "");
    if (cvText.length < 40) {
      return NextResponse.json(
        { error: "Analiz için en az birkaç satır CV veya aday metni girin." },
        { status: 400 },
      );
    }

    const jobTitle = body.jobTitle?.trim() || "Genel açık pozisyon";
    const jobDescription = sanitizeCvText(body.jobDescription?.trim() || "Kurumsal İK işe alım kriterleri").slice(0, 2_000);

    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
    }

    let object: CvAnalysis;
    let geminiFallback = !isGeminiConfigured();
    let warning = "";

    if (geminiFallback) {
      object = fallbackCvAnalysis(jobTitle, cvText);
      warning = "Gemini API anahtarı tanımlı değil; kural tabanlı ön analiz üretildi.";
    } else {
      const result = await analyzeCv(jobTitle, jobDescription, cvText, parseRequestLocale(body.locale));
      object = result.object;
      geminiFallback = result.fallback;
      warning = result.warning ?? "";
    }

    let saved: StoredResume | null = null;
    try {
      saved = await insertResume(
        {
          name: object.name,
          role: object.role,
          matchScore: Math.round(object.matchScore),
          summary: object.summary,
          skills: object.skills,
          strengths: object.strengths,
          weaknesses: object.weaknesses,
        },
        supabase,
      );
    } catch (error) {
      console.error("[analyze-cv] insert", error);
    }

    const record = toStoredResume(object, saved);
    if (!saved) {
      warning = warning
        ? `${warning} Kayıt veritabanına yazılamadı; sonuç oturumda tutuluyor.`
        : "Analiz üretildi, veritabanı kaydı atlandı; sonuç listede gösteriliyor.";
    }

    return NextResponse.json({
      ...object,
      id: record.id,
      createdAt: record.createdAt,
      saved: record,
      fallback: geminiFallback || !saved,
      warning: warning || undefined,
    });
  } catch (error) {
    const fallback = fallbackCvAnalysis("Genel açık pozisyon", "Aday metni analiz için yetersiz kaldı, yedek özet üretildi. Deneyim ve yetkinlikler mülakatta doğrulanmalıdır.");
    const record = toStoredResume(fallback);
    return NextResponse.json({
      ...fallback,
      id: record.id,
      createdAt: record.createdAt,
      saved: record,
      fallback: true,
      warning: toClientError(error, "CV analizi Gemini üzerinden tamamlanamadı; yedek analiz gösteriliyor."),
    });
  }
}
