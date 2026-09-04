"use client";

import { useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { useI18n } from "@/components/i18n/LocaleProvider";
import type { StoredPerformanceReview } from "@/lib/performance";
import { readLocalJson, writeLocalJson } from "@/lib/session-store";
import { SKILL_GAP_STORAGE_KEY, type SkillGapPlan } from "@/lib/skill-gap";

type SkillGapPlanPanelProps = {
  review: StoredPerformanceReview | null;
};

export function SkillGapPlanPanel({ review }: SkillGapPlanPanelProps) {
  const { t, locale } = useI18n();
  const [plan, setPlan] = useState<SkillGapPlan | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!review) {
      setPlan(null);
      return;
    }
    const map = readLocalJson<Record<string, SkillGapPlan>>(SKILL_GAP_STORAGE_KEY, {});
    setPlan(map[review.id] ?? null);
    setError("");
  }, [review?.id]);

  async function generate() {
    if (!review) return;
    setGenerating(true);
    setError("");
    try {
      const response = await fetch("/api/generate-skill-gap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewId: review.id,
          employeeName: review.employeeName,
          period: review.period,
          gaps: review.improvements,
          locale,
        }),
      });
      const payload = (await response.json()) as { plan?: SkillGapPlan };
      if (!payload.plan) throw new Error(t("perf.skillGap.fail"));
      const map = readLocalJson<Record<string, SkillGapPlan>>(SKILL_GAP_STORAGE_KEY, {});
      map[review.id] = payload.plan;
      writeLocalJson(SKILL_GAP_STORAGE_KEY, map);
      setPlan(payload.plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("perf.skillGap.fail"));
    } finally {
      setGenerating(false);
    }
  }

  return (
    <section className="min-h-[320px] w-full rounded-2xl border border-violet-100 bg-white p-5 transition-none">
      <div className="flex min-h-[4.5rem] flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-700">{t("perf.skillGap.kicker")}</p>
          <h2 className="mt-1 text-base font-semibold text-[#0b1f3a]">{t("perf.skillGap.title")}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">{t("perf.skillGap.lead")}</p>
        </div>
        <button
          type="button"
          disabled={!review || generating}
          onClick={() => void generate()}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#123056] px-4 text-center text-sm font-medium leading-tight text-white hover:bg-[#0f2744] disabled:opacity-50"
        >
          {generating ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" /> : <Sparkles className="h-4 w-4 shrink-0" />}
          <span className="max-w-[16rem] whitespace-normal sm:whitespace-nowrap">{t("perf.skillGap.generate")}</span>
        </button>
      </div>

      <div className="mt-4 min-h-10">
        {!review ? <p className="text-sm text-slate-400">{t("perf.skillGap.needReview")}</p> : null}
        {review && review.score >= 4 && !plan ? (
          <p className="text-sm text-slate-500">{t("perf.skillGap.highScore")}</p>
        ) : null}
        {error ? <p className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p> : null}
      </div>

      <div className="mt-2 min-h-[220px]">
        {plan ? (
          <div className="space-y-4">
            <p className="text-sm leading-6 text-slate-600">{plan.overview}</p>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {plan.weeks.map((week) => (
                <article
                  key={week.week}
                  className="flex min-h-[220px] flex-col rounded-2xl border border-violet-100 bg-violet-50/50 p-4"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-violet-700">
                    {t("perf.skillGap.week", { week: week.week })}
                  </p>
                  <h3 className="mt-1 text-sm font-semibold text-[#0b1f3a]">{week.focus}</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-5 text-slate-600">
                    {week.actions.map((action) => (
                      <li key={action}>{action}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
            <AiDisclaimer />
          </div>
        ) : (
          <div className="flex min-h-[220px] items-center rounded-2xl border border-dashed border-violet-100 bg-violet-50/30 px-4">
            <p className="text-sm text-slate-400">{t("perf.skillGap.empty")}</p>
          </div>
        )}
      </div>
    </section>
  );
}
