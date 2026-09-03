"use client";

import { FormEvent, useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import {
  fetchPerformanceReviews,
  type StoredPerformanceReview,
} from "@/lib/performance";
import { DEMO_PERFORMANCE_KEY, DEMO_SEEDED_EVENT } from "@/lib/seed-data";
import { mergeById, readSessionList, writeSessionList } from "@/lib/session-store";
import { isSupabaseConfigured } from "@/lib/supabase";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { HelpTip, HelpTitle } from "@/components/ui/HelpTip";
import { HrDocsAndAppeal } from "@/components/hr-docs/HrDocsAndAppeal";
import { useI18n } from "@/components/i18n/LocaleProvider";

const SESSION_KEY = DEMO_PERFORMANCE_KEY;

function scoreBadge(score: number) {
  if (score >= 4) return "bg-emerald-50 text-emerald-800";
  if (score === 3) return "bg-sky-50 text-sky-800";
  return "bg-amber-50 text-amber-800";
}

export function PerformanceWorkspace() {
  const { t, locale } = useI18n();
  const [reviews, setReviews] = useState<StoredPerformanceReview[]>([]);
  const [employeeName, setEmployeeName] = useState("");
  const [period, setPeriod] = useState("2026 Q3");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [latest, setLatest] = useState<StoredPerformanceReview | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  function remember(next: StoredPerformanceReview[], current?: StoredPerformanceReview | null) {
    setReviews(next);
    writeSessionList(SESSION_KEY, next);
    if (current) setLatest(current);
  }

  async function load() {
    const session = readSessionList<StoredPerformanceReview>(SESSION_KEY);
    if (session.length) {
      setReviews(session);
      setLatest(session[0]);
    }
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }
    try {
      const rows = await fetchPerformanceReviews();
      const merged = mergeById(session, rows);
      remember(merged, merged[0] ?? null);
    } catch (err) {
      console.error("[performans] liste:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    function onSeed() {
      void load();
    }
    window.addEventListener(DEMO_SEEDED_EVENT, onSeed);
    return () => window.removeEventListener(DEMO_SEEDED_EVENT, onSeed);
  }, []);

  async function generate(event: FormEvent) {
    event.preventDefault();
    if (!employeeName.trim() || notes.trim().length < 12) {
      setNotice(t("perf.needInput"));
      return;
    }
    setGenerating(true);
    setNotice("");
    try {
      const response = await fetch("/api/generate-performance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeName, period, notes, locale }),
      });
      const payload = (await response.json()) as {
        saved?: StoredPerformanceReview;
        review?: StoredPerformanceReview;
      };
      const row = payload.saved ?? payload.review;
      if (!row) throw new Error(t("perf.fail"));
      remember([row, ...reviews.filter((item) => item.id !== row.id)], row);
      setNotice(t("perf.ready", { name: row.employeeName }));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("perf.fail"));
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">{t("perf.kicker")}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#0b1f3a]">
          <HelpTitle hint={t("perf.hint")}>{t("perf.title")}</HelpTitle>
        </h1>
        <p className="mt-1 text-sm text-slate-500">{t("perf.lead")}</p>
      </div>

      {error ? (
        <p className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>
      ) : null}
      {notice ? (
        <p className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</p>
      ) : null}

      <form onSubmit={generate} className="space-y-4 rounded-2xl border border-sky-100 bg-white p-5 shadow-[0_8px_30px_rgba(15,55,95,0.06)]">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">{t("perf.employee")}</span>
            <input
              value={employeeName}
              onChange={(event) => setEmployeeName(event.target.value)}
              placeholder="Mert Demir"
              className="w-full rounded-xl border border-slate-200 bg-[#f8fbff] px-3 py-2.5 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">{t("perf.period")}</span>
            <input
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-[#f8fbff] px-3 py-2.5 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
            />
          </label>
        </div>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">{t("perf.notes")}</span>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={5}
            placeholder={t("perf.notesPlaceholder")}
            className="w-full rounded-xl border border-slate-200 bg-[#f8fbff] px-3 py-2.5 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
          />
        </label>
        <div className="flex min-w-0 flex-wrap items-center gap-2 overflow-visible">
          <HelpTip text={t("perf.generateHint")} side="top" align="start" sideOffset={8} />
          <button
            type="submit"
            disabled={generating}
            className="inline-flex min-w-0 items-center justify-center gap-2 rounded-xl bg-[#123056] px-4 py-2.5 text-center text-sm font-medium leading-tight text-white hover:bg-[#0f2744] disabled:opacity-50"
          >
            {generating ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" /> : <Sparkles className="h-4 w-4 shrink-0" />}
            <span className="min-w-0">{t("perf.generate")}</span>
          </button>
        </div>
      </form>

      <HrDocsAndAppeal
        storageKey="nexus-docs-performance"
        subjectLabel={latest?.employeeName ?? "performans"}
        showDocs={false}
        appealButtonKey="appeal.button.performance"
        appealTitleKey="appeal.title.performance"
        appealLeadKey="appeal.lead.performance"
      />

      {latest ? (
        <section className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-[#0b1f3a]">{latest.employeeName}</h2>
                <p className="text-xs text-slate-500">{latest.period}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-sm font-semibold ${scoreBadge(latest.score)}`}>
                {t("perf.score", { score: latest.score })}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{latest.summary}</p>
            <AiDisclaimer className="mt-4" />
          </article>
          <article className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-emerald-800">{t("perf.strengths")}</h3>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-700">
              {latest.strengths.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article className="rounded-2xl border border-amber-100 bg-amber-50/60 p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-800">{t("perf.gaps")}</h3>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-700">
              {latest.improvements.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-indigo-800">{t("perf.goals")}</h3>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-700">
              {latest.goals.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </section>
      ) : null}

      <section>
        <h2 className="mb-3 text-base font-semibold text-[#0b1f3a]">{t("perf.saved")}</h2>
        {loading ? <p className="text-sm text-slate-400">{t("perf.loading")}</p> : null}
        <div className="grid gap-3 md:grid-cols-2">
          {reviews.map((review) => (
            <button
              type="button"
              key={review.id}
              onClick={() => setLatest(review)}
              className="rounded-2xl border border-sky-100 bg-white p-4 text-left shadow-sm hover:border-sky-200"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-[#0b1f3a]">{review.employeeName}</p>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${scoreBadge(review.score)}`}>
                  {review.score}/5
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">{review.period}</p>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
