import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { isGeminiConfigured } from "@/lib/gemini";
import type { InterviewGuide } from "@/lib/interview";
import { createServerSupabase } from "@/lib/supabase/server";

export const maxDuration = 60;

const questionSchema = z.object({
  question: z.string().min(1),
  expectedAnswer: z.string().min(1),
});

const interviewSchema = z.object({
  technicalQuestions: z.array(questionSchema).min(5),
  cultureQuestions: z.array(questionSchema).min(3),
  strengths: z.array(z.string()).min(1).optional(),
  probeAreas: z.array(z.string()).min(1).optional(),
});

function fallbackGuide(jobTitle: string, candidateName: string, summary: string): InterviewGuide {
  const role = jobTitle || "açık pozisyon";
  const name = candidateName || "Aday";
  const context = summary ? ` CV özetinde belirtilen deneyimi` : " önceki deneyimini";

  return {
    technicalQuestions: [
      {
        id: "tech-1",
        kind: "technical",
        question: `${role} rolünde üstlendiğiniz en karmaşık işi anlatın. Hangi kısıtlar vardı ve sonucu nasıl ölçtünüz?`,
        expectedAnswer: `Somut kapsam, kısıt, kendi katkısı ve ölçülebilir sonuç. ${name} için${context} bağlayın.`,
      },
      {
        id: "tech-2",
        kind: "technical",
        question: `Bu pozisyonda kullandığınız temel araç / yöntem / süreç hangileri? Neden bunları tercih ediyorsunuz?`,
        expectedAnswer: "Güncel araç bilgisi, tercih gerekçesi ve alternatiflerle kıyaslama.",
      },
      {
        id: "tech-3",
        kind: "technical",
        question: `${role} işinde kaliteyi ve riski nasıl kontrol edersiniz? Bir hata veya regresyon örneği verin.`,
        expectedAnswer: "Kalite kapısı, gözden geçirme, izleme ve öğrenilen ders.",
      },
      {
        id: "tech-4",
        kind: "technical",
        question: "Belirsiz veya eksik gereksinimle nasıl ilerlersiniz? Paydaşları nasıl hizalarsınız?",
        expectedAnswer: "Varsayımları yazma, erken prototip/örnek, paydaş teyidi ve kapsamı küçültme.",
      },
      {
        id: "tech-5",
        kind: "technical",
        question: `${role} tarafında ölçek, performans veya süreç darboğazı yaşadığınız bir durumu adım adım anlatın.`,
        expectedAnswer: "Kök neden, seçilen çözüm, trade-off ve sonrası metrik.",
      },
    ],
    cultureQuestions: [
      {
        id: "culture-1",
        kind: "culture",
        question: "Zor bir geri bildirim aldığınız veya verdiğiniz bir örneği anlatın. Sonuç ne oldu?",
        expectedAnswer: "Açık iletişim, empati ve davranış değişikliği.",
      },
      {
        id: "culture-2",
        kind: "culture",
        question: "Ekip içinde görüş ayrılığı olduğunda nasıl hizalama sağlarsınız?",
        expectedAnswer: "Veriye dayanma, dinleme, ortak hedef ve net karar.",
      },
      {
        id: "culture-3",
        kind: "culture",
        question: "Yoğun dönemde öncelikleri nasıl belirler ve ekibe nasıl görünür kılarsınız?",
        expectedAnswer: "Etki/acil matrisi, şeffaf iletişim ve teslim taahhüdü.",
      },
    ],
    strengths: [
      "Somut teslimat ve sonuç odaklı anlatım beklenir",
      `${role} süreçlerine hâkimiyet bu turda doğrulanacak`,
    ],
    probeAreas: [
      "Derinlemesine teknik gerekçe ve trade-off",
      "Belirsizlik altında karar kalitesi",
      "Ekip içi iletişim ve sahiplik",
    ],
  };
}

function toGuide(
  parsed: z.infer<typeof interviewSchema>,
  fallback: InterviewGuide,
): InterviewGuide {
  const technical = parsed.technicalQuestions.slice(0, 5).map((item, index) => ({
    id: `tech-${index + 1}` as const,
    kind: "technical" as const,
    question: item.question,
    expectedAnswer: item.expectedAnswer,
  }));
  const culture = parsed.cultureQuestions.slice(0, 3).map((item, index) => ({
    id: `culture-${index + 1}` as const,
    kind: "culture" as const,
    question: item.question,
    expectedAnswer: item.expectedAnswer,
  }));

  return {
    technicalQuestions: technical.length >= 5 ? technical : fallback.technicalQuestions,
    cultureQuestions: culture.length >= 3 ? culture : fallback.cultureQuestions,
    strengths: parsed.strengths?.length ? parsed.strengths.slice(0, 5) : fallback.strengths,
    probeAreas: parsed.probeAreas?.length ? parsed.probeAreas.slice(0, 5) : fallback.probeAreas,
  };
}

function parseGuideFromText(text: string, fallback: InterviewGuide): InterviewGuide {
  const cleanedText = text.replace(/```json|```/g, "").trim();
  const start = cleanedText.indexOf("{");
  const end = cleanedText.lastIndexOf("}");
  if (start === -1 || end <= start) {
    throw new Error("Temizlenmiş yanıtta JSON nesnesi yok.");
  }

  let raw: unknown;
  try {
    raw = JSON.parse(cleanedText.slice(start, end + 1));
  } catch (error) {
    console.error("[generate-interview] JSON.parse hatası:", error);
    console.error("[generate-interview] cleanedText:", cleanedText.slice(0, 800));
    throw error;
  }

  const parsed = interviewSchema.parse(raw);
  return toGuide(parsed, fallback);
}

export async function POST(request: Request) {
  let jobTitle = "Açık pozisyon";
  let candidateName = "Aday";
  let summary = "";

  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      console.error("[generate-interview] oturum yok");
      return NextResponse.json({
        guide: fallbackGuide(jobTitle, candidateName, summary),
        fallback: true,
      });
    }

    let body: {
      candidateName?: string;
      role?: string;
      jobTitle?: string;
      summary?: string;
      skills?: string[];
      strengths?: string[];
      weaknesses?: string[];
    } = {};

    try {
      body = (await request.json()) as typeof body;
    } catch (error) {
      console.error("[generate-interview] istek gövdesi okunamadı:", error);
      return NextResponse.json({
        guide: fallbackGuide(jobTitle, candidateName, summary),
        fallback: true,
      });
    }

    candidateName = body.candidateName?.trim() || "Aday";
    jobTitle = body.jobTitle?.trim() || body.role?.trim() || "Açık pozisyon";
    summary = body.summary?.trim() ?? "";
    const fallback = fallbackGuide(jobTitle, candidateName, summary);

    if (!isGeminiConfigured()) {
      console.error("[generate-interview] GOOGLE_GENERATIVE_AI_API_KEY tanımlı değil");
      return NextResponse.json({ guide: fallback, fallback: true });
    }

    const profileBits = [
      summary,
      (body.skills ?? []).join(", "),
      (body.strengths ?? []).join("; "),
      (body.weaknesses ?? []).join("; "),
    ]
      .filter(Boolean)
      .join("\n");

    const system =
      "Sen RecruiterAgent adlı kıdemli bir mülakat koçusun. Türkçe yaz. Yalnızca JSON döndür.";
    const prompt = `Aday: ${candidateName}
Pozisyon: ${jobTitle}
CV özeti: ${summary || profileBits || "belirtilmedi"}
Beceriler: ${(body.skills ?? []).join(", ") || "belirtilmedi"}
Güçlü yönler: ${(body.strengths ?? []).join("; ") || "belirtilmedi"}
Gelişim alanları: ${(body.weaknesses ?? []).join("; ") || "belirtilmedi"}

JSON:
{
  "technicalQuestions": [{ "question": "...", "expectedAnswer": "..." }],
  "cultureQuestions": [{ "question": "...", "expectedAnswer": "..." }],
  "strengths": ["..."],
  "probeAreas": ["..."]
}
technicalQuestions 5, cultureQuestions 3 öğe olsun.`;

    let text = "";
    try {
      const result = await generateText({
        model: google("gemini-1.5-flash"),
        system,
        prompt,
        maxRetries: 2,
      });
      text = result.text ?? "";
    } catch (error) {
      console.error("[generate-interview] Gemini API hatası:", error);
      return NextResponse.json({ guide: fallback, fallback: true });
    }

    try {
      const guide = parseGuideFromText(text, fallback);
      return NextResponse.json({ guide, fallback: false });
    } catch (error) {
      console.error("[generate-interview] JSON sanitization / parse hatası:", error);
      return NextResponse.json({ guide: fallback, fallback: true });
    }
  } catch (error) {
    console.error("[generate-interview] beklenmeyen hata:", error);
    return NextResponse.json({
      guide: fallbackGuide(jobTitle, candidateName, summary),
      fallback: true,
    });
  }
}
