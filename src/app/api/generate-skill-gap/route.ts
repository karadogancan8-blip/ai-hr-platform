import { generateObject, generateText } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { parseRequestLocale, replyInLocaleInstruction } from "@/lib/ai-locale";
import { isGeminiConfigured, withGeminiModel } from "@/lib/gemini";
import { fallbackSkillGapPlan } from "@/lib/skill-gap";

export const maxDuration = 60;

const weekSchema = z.object({
  week: z.number().min(1).max(4),
  focus: z.string(),
  actions: z.array(z.string()).min(2).max(4),
});

const schema = z.object({
  overview: z.string(),
  weeks: z.array(weekSchema).min(4).max(4),
});

export async function POST(request: Request) {
  let employeeName = "Çalışan";
  let period = "Bu çeyrek";
  let reviewId = "";
  let gaps: string[] = [];
  let outputLocale = parseRequestLocale("tr");

  try {
    const body = (await request.json()) as {
      employeeName?: string;
      period?: string;
      reviewId?: string;
      gaps?: string[];
      locale?: string;
    };
    employeeName = body.employeeName?.trim() || employeeName;
    period = body.period?.trim() || period;
    reviewId = body.reviewId?.trim() || crypto.randomUUID();
    gaps = Array.isArray(body.gaps) ? body.gaps.map((item) => String(item).trim()).filter(Boolean) : [];
    outputLocale = parseRequestLocale(body.locale);
  } catch {
    // varsayılan gövde
  }

  const fallback = fallbackSkillGapPlan({
    reviewId,
    employeeName,
    period,
    gaps,
    locale: outputLocale,
  });

  if (!isGeminiConfigured()) {
    return NextResponse.json({ plan: fallback, fallback: true });
  }

  const gapList = gaps.length ? gaps.join("; ") : outputLocale === "en" ? "unspecified development areas" : "belirtilmemiş gelişim alanları";
  const system = `You are PerformanceAgent, an enterprise L&D coach. Return only JSON for a practical 4-week individual development plan. ${replyInLocaleInstruction(outputLocale)}`;
  const prompt = `Employee: ${employeeName}
Period: ${period}
Low-scoring competencies / skill gaps: ${gapList}

JSON:
{
  "overview": "2-3 sentences",
  "weeks": [
    { "week": 1, "focus": "...", "actions": ["...", "...", "..."] },
    { "week": 2, "focus": "...", "actions": ["...", "...", "..."] },
    { "week": 3, "focus": "...", "actions": ["...", "...", "..."] },
    { "week": 4, "focus": "...", "actions": ["...", "...", "..."] }
  ]
}
Each week must have 3 concrete workplace actions. No generic slogans.`;

  try {
    const { object } = await withGeminiModel((model) =>
      generateObject({
        model,
        schema,
        system,
        prompt,
        maxRetries: 1,
      }),
    );
    return NextResponse.json({
      plan: {
        ...fallback,
        id: crypto.randomUUID(),
        overview: object.overview,
        weeks: object.weeks
          .slice()
          .sort((a, b) => a.week - b.week)
          .map((week) => ({
            week: week.week,
            focus: week.focus,
            actions: week.actions.slice(0, 4),
          })),
        createdAt: new Date().toISOString(),
      },
      fallback: false,
    });
  } catch (first) {
    console.error("[generate-skill-gap] generateObject:", first);
    try {
      const { text } = await withGeminiModel((model) =>
        generateText({
          model,
          system: `${system} Return a JSON object only.`,
          prompt,
          maxRetries: 1,
        }),
      );
      const cleaned = (text ?? "").replace(/```json|```/g, "").trim();
      const start = cleaned.indexOf("{");
      const end = cleaned.lastIndexOf("}");
      const parsed = schema.parse(JSON.parse(cleaned.slice(start, end + 1)));
      return NextResponse.json({
        plan: {
          ...fallback,
          id: crypto.randomUUID(),
          overview: parsed.overview,
          weeks: parsed.weeks.slice().sort((a, b) => a.week - b.week),
          createdAt: new Date().toISOString(),
        },
        fallback: false,
      });
    } catch (second) {
      console.error("[generate-skill-gap] fallback:", second);
      return NextResponse.json({ plan: fallback, fallback: true });
    }
  }
}
