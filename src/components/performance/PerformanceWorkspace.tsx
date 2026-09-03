"use client";

import { FormEvent, useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import {
  fetchPerformanceReviews,
  type StoredPerformanceReview,
} from "@/lib/performance";
import { mergeById, readSessionList, writeSessionList } from "@/lib/session-store";
import { isSupabaseConfigured } from "@/lib/supabase";

const SESSION_KEY = "nexus-performance-reviews";

function scoreBadge(score: number) {
  if (score >= 4) return "bg-emerald-50 text-emerald-800";
  if (score === 3) return "bg-sky-50 text-sky-800";
  return "bg-amber-50 text-amber-800";
}

export function PerformanceWorkspace() {
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
  }, []);

  async function generate(event: FormEvent) {
    event.preventDefault();
    if (!employeeName.trim() || notes.trim().length < 12) {
      setNotice("Çalışan adı ve dönem notları (en az birkaç cümle) gerekli.");
      return;
    }
    setGenerating(true);
    setNotice("");
    try {
      const response = await fetch("/api/generate-performance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeName, period, notes }),
      });
      const payload = (await response.json()) as {
        saved?: StoredPerformanceReview;
        review?: StoredPerformanceReview;
      };
      const row = payload.saved ?? payload.review;
      if (!row) throw new Error("Rapor üretilemedi.");
      remember([row, ...reviews.filter((item) => item.id !== row.id)], row);
      setNotice(`${row.employeeName} için performans incelemesi hazır.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Rapor üretilemedi.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">PerformanceAgent</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#0b1f3a]">Otomatik performans değerlendirme</h1>
        <p className="mt-1 text-sm text-slate-500">
          Dönem notlarından güçlü yönler, gelişim alanları, skor önerisi ve gelecek çeyrek hedefleri üretilir.
        </p>
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
            <span className="mb-1 block font-medium text-slate-700">Çalışan</span>
            <input
              value={employeeName}
              onChange={(event) => setEmployeeName(event.target.value)}
              placeholder="Mert Demir"
              className="w-full rounded-xl border border-slate-200 bg-[#f8fbff] px-3 py-2.5 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Dönem</span>
            <input
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-[#f8fbff] px-3 py-2.5 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
            />
          </label>
        </div>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Dönem içi başarılar / yönetici notları</span>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={5}
            placeholder="Teslimatlar, geri bildirimler, ölçülebilir sonuçlar…"
            className="w-full rounded-xl border border-slate-200 bg-[#f8fbff] px-3 py-2.5 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
          />
        </label>
        <button
          type="submit"
          disabled={generating}
          className="inline-flex items-center gap-2 rounded-xl bg-[#123056] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#0f2744] disabled:opacity-50"
        >
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Performans inceleme raporu üret
        </button>
      </form>

      {latest ? (
        <section className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-[#0b1f3a]">{latest.employeeName}</h2>
                <p className="text-xs text-slate-500">{latest.period}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-sm font-semibold ${scoreBadge(latest.score)}`}>
                Skor önerisi {latest.score}/5
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{latest.summary}</p>
          </article>
          <article className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Güçlü yönler</h3>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-700">
              {latest.strengths.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article className="rounded-2xl border border-amber-100 bg-amber-50/60 p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-800">Gelişim alanları</h3>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-700">
              {latest.improvements.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-indigo-800">Gelecek çeyrek hedefleri</h3>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-700">
              {latest.goals.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </section>
      ) : null}

      <section>
        <h2 className="mb-3 text-base font-semibold text-[#0b1f3a]">Kayıtlı incelemeler</h2>
        {loading ? <p className="text-sm text-slate-400">Yükleniyor…</p> : null}
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
