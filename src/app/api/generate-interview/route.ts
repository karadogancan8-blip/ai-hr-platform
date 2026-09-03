import { generateObject, generateText } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { isGeminiConfigured, toClientError, withGeminiModel } from "@/lib/gemini";
import type { InterviewGuide } from "@/lib/interview";
import { createServerSupabase } from "@/lib/supabase/server";

export const maxDuration = 60;

const questionSchema = z.object({
  question: z.string().describe("Mülakat sorusu, Türkçe ve net"),
  expectedAnswer: z.string().describe("Adaydan beklenen kilit yanıt / değerlendirme ipucu"),
});

const interviewSchema = z.object({
  technicalQuestions: z.array(questionSchema).min(5).max(8),
  cultureQuestions: z.array(questionSchema).min(3).max(6),
  strengths: z.array(z.string()).min(2).max(6),
  probeAreas: z.array(z.string()).min(2).max(6).describe("Mülakatta sıkıştırılacak gelişim alanları"),
});

function parseJsonGuide(text: string) {
  const fenced = text.match(/\{[\s\S]*\}/);
  if (!fenced) throw new Error("Gemini geçerli bir mülakat JSON'u döndürmedi.");
  return interviewSchema.parse(JSON.parse(fenced[0]));
}

function toGuide(parsed: z.infer<typeof interviewSchema>): InterviewGuide {
  return {
    technicalQuestions: parsed.technicalQuestions.slice(0, 5).map((item, index) => ({
      id: `tech-${index + 1}`,
      kind: "technical",
      question: item.question,
      expectedAnswer: item.expectedAnswer,
    })),
    cultureQuestions: parsed.cultureQuestions.slice(0, 3).map((item, index) => ({
      id: `culture-${index + 1}`,
      kind: "culture",
      question: item.question,
      expectedAnswer: item.expectedAnswer,
    })),
    strengths: parsed.strengths.slice(0, 5),
    probeAreas: parsed.probeAreas.slice(0, 5),
  };
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
    }

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
      candidateName?: string;
      role?: string;
      jobTitle?: string;
      summary?: string;
      skills?: string[];
      strengths?: string[];
      weaknesses?: string[];
    };

    const summary = body.summary?.trim() ?? "";
    const jobTitle = body.jobTitle?.trim() || body.role?.trim() || "Açık pozisyon";
    const profileBits = [
      summary,
      (body.skills ?? []).join(", "),
      (body.strengths ?? []).join("; "),
      (body.weaknesses ?? []).join("; "),
    ]
      .filter(Boolean)
      .join("\n");
    if (profileBits.length < 20) {
      return NextResponse.json(
        { error: "Mülakat rehberi için adayın CV özeti veya beceri bilgisi gerekli." },
        { status: 400 },
      );
    }

    const system =
      "Sen RecruiterAgent adlı kıdemli bir mülakat koçusun. Türkçe, somut ve pozisyona özel sorular yaz. CV'de olmayan deneyimi uydurma.";
    const prompt = `Aday: ${body.candidateName || "Aday"}
Pozisyon: ${jobTitle}
CV özeti: ${summary || profileBits}
Beceriler: ${(body.skills ?? []).join(", ") || "belirtilmedi"}
Güçlü yönler: ${(body.strengths ?? []).join("; ") || "belirtilmedi"}
Gelişim alanları: ${(body.weaknesses ?? []).join("; ") || "belirtilmedi"}

5 teknik soru (beklenen kilit yanıtlarla) ve 3 kültürel uyum / yetkinlik sorusu üret.
probeAreas: mülakatta sıkıştırılacak gelişim alanları olsun.`;

    let parsed: z.infer<typeof interviewSchema>;
    try {
      const { object } = await withGeminiModel((model) =>
        generateObject({
          model,
          schema: interviewSchema,
          system,
          prompt,
          maxRetries: 2,
        }),
      );
      parsed = object;
    } catch {
      try {
        const { text } = await withGeminiModel((model) =>
          generateText({
            model,
            system: `${system} Yalnızca JSON döndür: technicalQuestions, cultureQuestions, strengths, probeAreas.`,
            prompt,
            maxRetries: 2,
          }),
        );
        parsed = parseJsonGuide(text);
      } catch (error) {
        return NextResponse.json(
          { error: toClientError(error, "Mülakat rehberi üretilemedi. Lütfen tekrar deneyin.") },
          { status: 502 },
        );
      }
    }

    const guide = toGuide(parsed);
    if (guide.technicalQuestions.length < 5 || guide.cultureQuestions.length < 3) {
      return NextResponse.json({ error: "Rehber eksik üretildi, tekrar deneyin." }, { status: 502 });
    }

    return NextResponse.json({ guide });
  } catch (error) {
    return NextResponse.json({ error: toClientError(error, "Mülakat rehberi üretilemedi.") }, { status: 502 });
  }
}
