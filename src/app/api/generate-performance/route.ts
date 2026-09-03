import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { isGeminiConfigured } from "@/lib/gemini";
import { fallbackPerformanceReview, insertPerformanceReview } from "@/lib/performance";
import { createServerSupabase } from "@/lib/supabase/server";

export const maxDuration = 60;

const schema = z.object({
  summary: z.string(),
  strengths: z.array(z.string()).min(2),
  improvements: z.array(z.string()).min(2),
  goals: z.array(z.string()).min(2),
  score: z.number().min(1).max(5),
});

export async function POST(request: Request) {
  let employeeName = "Çalışan";
  let period = "Bu çeyrek";
  let notes = "";

  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      console.error("[generate-performance] oturum yok");
      const review = fallbackPerformanceReview({ employeeName, period, notes });
      return NextResponse.json({ review, fallback: true });
    }

    try {
      const body = (await request.json()) as {
        employeeName?: string;
        period?: string;
        notes?: string;
      };
      employeeName = body.employeeName?.trim() || employeeName;
      period = body.period?.trim() || period;
      notes = body.notes?.trim() || "";
    } catch (error) {
      console.error("[generate-performance] gövde hatası:", error);
    }

    const fallback = fallbackPerformanceReview({ employeeName, period, notes });

    async function persist(review: typeof fallback, fallbackFlag: boolean) {
      try {
        const saved = await insertPerformanceReview(review, supabase);
        return NextResponse.json({ review: saved, fallback: fallbackFlag, saved });
      } catch (error) {
        console.error("[generate-performance] kayıt hatası:", error);
        return NextResponse.json({ review, fallback: fallbackFlag });
      }
    }

    if (!isGeminiConfigured()) {
      console.error("[generate-performance] API anahtarı yok");
      return persist(fallback, true);
    }

    let text = "";
    try {
      const result = await generateText({
        model: google("gemini-1.5-flash"),
        system:
          "Sen PerformanceAgent adlı İK performans koçusun. Türkçe, adil ve somut yaz. Yalnızca JSON döndür.",
        prompt: `Çalışan: ${employeeName}
Dönem: ${period}
Yönetici notları / başarılar: ${notes || "belirtilmedi"}

JSON:
{
  "summary": "...",
  "strengths": ["..."],
  "improvements": ["..."],
  "goals": ["..."],
  "score": 3
}
score 1-5 tam sayı. goals gelecek çeyrek için 3 madde olsun.`,
        maxRetries: 2,
      });
      text = result.text ?? "";
    } catch (error) {
      console.error("[generate-performance] Gemini hatası:", error);
      return persist(fallback, true);
    }

    try {
      const cleanedText = text.replace(/```json|```/g, "").trim();
      const start = cleanedText.indexOf("{");
      const end = cleanedText.lastIndexOf("}");
      const parsed = schema.parse(JSON.parse(cleanedText.slice(start, end + 1)));
      return persist(
        {
          employeeName,
          period,
          notes,
          summary: parsed.summary,
          strengths: parsed.strengths.slice(0, 5),
          improvements: parsed.improvements.slice(0, 5),
          goals: parsed.goals.slice(0, 5),
          score: Math.round(parsed.score),
        },
        false,
      );
    } catch (error) {
      console.error("[generate-performance] JSON parse hatası:", error);
      return persist(fallback, true);
    }
  } catch (error) {
    console.error("[generate-performance] beklenmeyen hata:", error);
    return NextResponse.json({
      review: fallbackPerformanceReview({ employeeName, period, notes }),
      fallback: true,
    });
  }
}
