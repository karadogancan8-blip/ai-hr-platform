import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { isGeminiConfigured } from "@/lib/gemini";
import type { InterviewGuide } from "@/lib/interview";
import { createServerSupabase } from "@/lib/supabase/server";

export const maxDuration = 60;

const questionSchema = z.object({
  question: z.string(),
  expectedAnswer: z.string(),
});

const interviewSchema = z.object({
  technicalQuestions: z.array(questionSchema).min(5),
  cultureQuestions: z.array(questionSchema).min(3),
  strengths: z.array(z.string()).min(2),
  probeAreas: z.array(z.string()).min(2),
});

function fail(error: unknown, clientMessage: string, status = 502) {
  console.error("[generate-interview]", error);
  return NextResponse.json({ error: clientMessage }, { status });
}

function stripMarkdownFences(text: string) {
  return text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();
}

function extractJsonObject(text: string) {
  const cleaned = stripMarkdownFences(text);
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Yanıtta JSON nesnesi bulunamadı.");
  }
  return cleaned.slice(start, end + 1);
}

function parseInterviewJson(text: string) {
  const payload = extractJsonObject(text);
  let raw: unknown;
  try {
    raw = JSON.parse(payload);
  } catch (error) {
    console.error("[generate-interview] JSON.parse başarısız:", error, payload.slice(0, 500));
    throw new Error("Gemini yanıtı geçerli JSON değil.");
  }
  return interviewSchema.parse(raw);
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

    let body: {
      candidateName?: string;
      role?: string;
      jobTitle?: string;
      summary?: string;
      skills?: string[];
      strengths?: string[];
      weaknesses?: string[];
    };
    try {
      body = (await request.json()) as typeof body;
    } catch (error) {
      return fail(error, "İstek gövdesi okunamadı.", 400);
    }

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
      "Sen RecruiterAgent adlı kıdemli bir mülakat koçusun. Türkçe, somut ve pozisyona özel sorular yaz. CV'de olmayan deneyimi uydurma. Yalnızca JSON döndür. Markdown kullanma.";
    const prompt = `Aday: ${body.candidateName || "Aday"}
Pozisyon: ${jobTitle}
CV özeti: ${summary || profileBits}
Beceriler: ${(body.skills ?? []).join(", ") || "belirtilmedi"}
Güçlü yönler: ${(body.strengths ?? []).join("; ") || "belirtilmedi"}
Gelişim alanları: ${(body.weaknesses ?? []).join("; ") || "belirtilmedi"}

Şu JSON şemasını doldur:
{
  "technicalQuestions": [{ "question": "...", "expectedAnswer": "..." }],
  "cultureQuestions": [{ "question": "...", "expectedAnswer": "..." }],
  "strengths": ["..."],
  "probeAreas": ["..."]
}
technicalQuestions tam 5, cultureQuestions tam 3 öğe içermeli.`;

    let text: string;
    try {
      const result = await generateText({
        model: google("gemini-1.5-flash"),
        system,
        prompt,
        maxRetries: 2,
      });
      text = result.text;
    } catch (error) {
      return fail(error, "Gemini mülakat rehberi üretemedi. Lütfen tekrar deneyin.");
    }

    let parsed: z.infer<typeof interviewSchema>;
    try {
      parsed = parseInterviewJson(text);
    } catch (error) {
      return fail(error, "Gemini yanıtı JSON olarak okunamadı. Lütfen tekrar deneyin.");
    }

    const guide = toGuide(parsed);
    if (guide.technicalQuestions.length < 5 || guide.cultureQuestions.length < 3) {
      console.error("[generate-interview] eksik rehber", guide);
      return NextResponse.json({ error: "Rehber eksik üretildi, tekrar deneyin." }, { status: 502 });
    }

    return NextResponse.json({ guide });
  } catch (error) {
    return fail(error, "Mülakat rehberi üretilemedi.");
  }
}
