import { generateObject, generateText } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { isGeminiConfigured, toClientError, withGeminiModel } from "@/lib/gemini";
import { insertResume } from "@/lib/resumes";
import { createServerSupabase } from "@/lib/supabase/server";

export const maxDuration = 60;

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

const systemPrompt =
  "Sen RecruiterAgent adlı kıdemli bir işe alım uzmanısın. CV'leri Türkçe, objektif ve profesyonel değerlendir. Uydurma sertifika veya deneyim ekleme; metinde yoksa belirt.";

function analysisPrompt(jobTitle: string, jobDescription: string, cvText: string) {
  return `Açık pozisyon: ${jobTitle}\nPozisyon açıklaması: ${jobDescription}\n\nAday CV / metin:\n${cvText.slice(0, 12000)}`;
}

function parseJsonObject(text: string) {
  const fenced = text.match(/\{[\s\S]*\}/);
  if (!fenced) throw new Error("Gemini geçerli bir analiz JSON'u döndürmedi.");
  return cvAnalysisSchema.parse(JSON.parse(fenced[0]));
}

async function analyzeCv(jobTitle: string, jobDescription: string, cvText: string) {
  const prompt = analysisPrompt(jobTitle, jobDescription, cvText);
  try {
    const { object } = await withGeminiModel((model) =>
      generateObject({
        model,
        schema: cvAnalysisSchema,
        system: systemPrompt,
        prompt,
        maxRetries: 2,
      }),
    );
    return object;
  } catch {
    try {
      const { text } = await withGeminiModel((model) =>
        generateText({
          model,
          system: `${systemPrompt} Yalnızca JSON nesnesi döndür. Anahtarlar: name, role, experience, location, matchScore, skills, strengths, weaknesses, summary.`,
          prompt,
          maxRetries: 2,
        }),
      );
      return parseJsonObject(text);
    } catch (error) {
      throw new Error(toClientError(error, "CV analizi tamamlanamadı. Lütfen tekrar deneyin."));
    }
  }
}

export async function POST(request: Request) {
  try {
    if (!isGeminiConfigured()) {
      return NextResponse.json(
        {
          error:
            "GOOGLE_GENERATIVE_AI_API_KEY tanımlı değil. Ücretsiz Gemini anahtarını .env.local dosyasına ekleyin.",
        },
        { status: 500 },
      );
    }

    const body = (await request.json()) as {
      cvText?: string;
      jobTitle?: string;
      jobDescription?: string;
    };

    const cvText = body.cvText?.trim() ?? "";
    if (cvText.length < 40) {
      return NextResponse.json(
        { error: "Analiz için en az birkaç satır CV veya aday metni girin." },
        { status: 400 },
      );
    }

    const jobTitle = body.jobTitle?.trim() || "Genel açık pozisyon";
    const jobDescription = body.jobDescription?.trim() || "Kurumsal İK işe alım kriterleri";
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
    }

    const object = await analyzeCv(jobTitle, jobDescription, cvText);

    const saved = await insertResume(
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

    return NextResponse.json({
      ...object,
      id: saved.id,
      createdAt: saved.createdAt,
      saved,
    });
  } catch (error) {
    return NextResponse.json({ error: toClientError(error, "CV analizi tamamlanamadı.") }, { status: 502 });
  }
}
