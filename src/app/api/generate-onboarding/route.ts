import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { isGeminiConfigured } from "@/lib/gemini";
import {
  fallbackOnboardingPlan,
  insertOnboardingPlan,
  type OnboardingPlanPayload,
  type OnboardingTask,
  type OnboardingWeek,
} from "@/lib/onboarding";
import { createServerSupabase } from "@/lib/supabase/server";

export const maxDuration = 60;

const schema = z.object({
  summary: z.string(),
  weeks: z
    .array(
      z.object({
        week: z.number(),
        title: z.string(),
        focus: z.string(),
      }),
    )
    .min(4),
  tasks: z
    .array(
      z.object({
        week: z.number(),
        day: z.number(),
        title: z.string(),
      }),
    )
    .min(8),
});

function ok(payload: OnboardingPlanPayload, fallback = false, saved?: unknown) {
  return NextResponse.json({ plan: payload, fallback, saved });
}

export async function POST(request: Request) {
  let employeeName = "Yeni çalışan";
  let role = "Pozisyon";
  let department = "Departman";

  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      console.error("[generate-onboarding] oturum yok");
      return ok(fallbackOnboardingPlan({ employeeName, role, department }), true);
    }

    try {
      const body = (await request.json()) as {
        employeeName?: string;
        role?: string;
        department?: string;
      };
      employeeName = body.employeeName?.trim() || employeeName;
      role = body.role?.trim() || role;
      department = body.department?.trim() || department;
    } catch (error) {
      console.error("[generate-onboarding] gövde hatası:", error);
    }

    const fallback = fallbackOnboardingPlan({ employeeName, role, department });

    async function persist(payload: OnboardingPlanPayload, fallbackFlag: boolean) {
      try {
        const saved = await insertOnboardingPlan({ employeeName, role, department, payload }, supabase);
        return NextResponse.json({ plan: payload, fallback: fallbackFlag, saved });
      } catch (error) {
        console.error("[generate-onboarding] kayıt hatası:", error);
        return ok(payload, fallbackFlag);
      }
    }

    if (!isGeminiConfigured()) {
      console.error("[generate-onboarding] API anahtarı yok");
      return persist(fallback, true);
    }

    let text = "";
    try {
      const result = await generateText({
        model: google("gemini-1.5-flash"),
        system:
          "Sen OnboardingAgent adlı İK oryantasyon koçusun. Türkçe yaz. Yalnızca JSON döndür. Markdown kullanma.",
        prompt: `Çalışan: ${employeeName}
Pozisyon: ${role}
Departman: ${department}

30 günlük uyum planı JSON:
{
  "summary": "...",
  "weeks": [{ "week": 1, "title": "...", "focus": "..." }],
  "tasks": [{ "week": 1, "day": 1, "title": "..." }]
}
4 hafta ve en az 10 görev üret. Görevler gün 1–30 aralığında olsun.`,
        maxRetries: 2,
      });
      text = result.text ?? "";
    } catch (error) {
      console.error("[generate-onboarding] Gemini hatası:", error);
      return persist(fallback, true);
    }

    try {
      const cleanedText = text.replace(/```json|```/g, "").trim();
      const start = cleanedText.indexOf("{");
      const end = cleanedText.lastIndexOf("}");
      const parsed = schema.parse(JSON.parse(cleanedText.slice(start, end + 1)));
      const weeks: OnboardingWeek[] = parsed.weeks.slice(0, 4).map((week) => ({
        week: week.week,
        title: week.title,
        focus: week.focus,
      }));
      const tasks: OnboardingTask[] = parsed.tasks.slice(0, 16).map((task, index) => ({
        id: `t${index + 1}`,
        week: task.week,
        day: task.day,
        title: task.title,
        done: false,
      }));
      return persist({ summary: parsed.summary, weeks, tasks }, false);
    } catch (error) {
      console.error("[generate-onboarding] JSON parse hatası:", error);
      return persist(fallback, true);
    }
  } catch (error) {
    console.error("[generate-onboarding] beklenmeyen hata:", error);
    return ok(fallbackOnboardingPlan({ employeeName, role, department }), true);
  }
}
