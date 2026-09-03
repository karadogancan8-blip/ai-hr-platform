"use client";

import { useEffect, useMemo, useState } from "react";
import { FileDown, Loader2, Star, X } from "lucide-react";
import { useCompanyBranding } from "@/components/branding/BrandingProvider";
import { PrintReportModal } from "@/components/reports/PrintReportModal";
import {
  allQuestions,
  interviewFinalScore,
  type InterviewGuide,
  type InterviewRating,
} from "@/lib/interview";
import type { StoredResume } from "@/lib/resumes";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { HelpTip } from "@/components/ui/HelpTip";

type InterviewModalProps = {
  open: boolean;
  mode: "guide" | "live";
  resume: StoredResume | null;
  guide: InterviewGuide | null;
  loading: boolean;
  error: string;
  saving: boolean;
  onClose: () => void;
  onSave: (payload: { score: number; notes: string; ratings: InterviewRating[] }) => Promise<void>;
};

export function InterviewModal({
  open,
  mode,
  resume,
  guide,
  loading,
  error,
  saving,
  onClose,
  onSave,
}: InterviewModalProps) {
  const questions = useMemo(() => (guide ? allQuestions(guide) : []), [guide]);
  const [ratings, setRatings] = useState<InterviewRating[]>([]);
  const [printOpen, setPrintOpen] = useState(false);
  const branding = useCompanyBranding();

  useEffect(() => {
    if (!open || !guide) return;
    setRatings(
      allQuestions(guide).map((question) => ({
        questionId: question.id,
        rating: 0,
        note: "",
      })),
    );
  }, [open, guide]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !saving) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, saving, onClose]);

  if (!open || !resume) return null;

  const score = interviewFinalScore(ratings);
  const unanswered = ratings.filter((item) => item.rating < 1).length;
  const live = mode === "live";

  function patch(questionId: string, next: Partial<InterviewRating>) {
    setRatings((prev) =>
      prev.map((item) => (item.questionId === questionId ? { ...item, ...next } : item)),
    );
  }

  return (
    <>
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/45 p-3 backdrop-blur-[2px] sm:items-center sm:p-6">
      <button type="button" className="absolute inset-0" aria-label="Kapat" onClick={onClose} disabled={saving} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="interview-title"
        className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-sky-100 bg-[#f7fbff] shadow-[0_24px_80px_rgba(15,55,95,0.22)]"
      >
        <header className="flex items-start justify-between gap-3 border-b border-sky-100 bg-white px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">
              {live ? "Canlı mülakat değerlendirmesi" : "AI mülakat rehberi"}
            </p>
            <h2 id="interview-title" className="mt-1 text-lg font-semibold text-[#0b1f3a]">
              {resume.name} · {resume.role}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {live
                ? "Her soruyu 1–5 yıldızla puanlayın, not alın ve nihai skoru kaydedin."
                : "Pozisyona özel sorular, beklenen yanıtlar ve sıkıştırılacak alanlar."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-700"
            aria-label="Kapat"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="flex items-center gap-2 py-12 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Gemini mülakat rehberi hazırlıyor…
            </div>
          ) : null}
          {error ? (
            <p className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>
          ) : null}

          {guide && !loading ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <section className="rounded-2xl border border-emerald-100 bg-white p-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Güçlü yönler</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-600">
                    {guide.strengths.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>
                <section className="rounded-2xl border border-amber-100 bg-white p-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                    Sıkıştırılacak alanlar
                  </h3>
                  <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-600">
                    {guide.probeAreas.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>
              </div>

              <p className="text-xs font-semibold uppercase tracking-wide text-sky-800">Teknik sorular</p>
              {questions
                .filter((item) => item.kind === "technical")
                .map((question, index) => {
                  const rating = ratings.find((item) => item.questionId === question.id);
                  return (
                    <QuestionCard
                      key={question.id}
                      index={index + 1}
                      kindLabel="Teknik"
                      question={question.question}
                      expectedAnswer={question.expectedAnswer}
                      rating={rating?.rating ?? 0}
                      note={rating?.note ?? ""}
                      onRate={(value) => patch(question.id, { rating: value })}
                      onNote={(value) => patch(question.id, { note: value })}
                    />
                  );
                })}

              <p className="pt-2 text-xs font-semibold uppercase tracking-wide text-indigo-800">
                Kültürel uyum / yetkinlik
              </p>
              {questions
                .filter((item) => item.kind === "culture")
                .map((question, index) => {
                  const rating = ratings.find((item) => item.questionId === question.id);
                  return (
                    <QuestionCard
                      key={question.id}
                      index={index + 1}
                      kindLabel="Yetkinlik"
                      question={question.question}
                      expectedAnswer={question.expectedAnswer}
                      rating={rating?.rating ?? 0}
                      note={rating?.note ?? ""}
                      onRate={(value) => patch(question.id, { rating: value })}
                      onNote={(value) => patch(question.id, { note: value })}
                    />
                  );
                })}
            </>
          ) : null}
          {guide && !loading ? <AiDisclaimer className="mt-2" /> : null}
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-sky-100 bg-white px-5 py-4">
          <div className="text-sm text-slate-600">
            Nihai mülakat skoru{" "}
            <span className="font-semibold text-[#0b1f3a]">{score}</span>
            {unanswered ? (
              <span className="ml-2 text-xs text-amber-700">{unanswered} soru puanlanmadı</span>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => setPrintOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-2.5 text-sm font-medium text-sky-900 hover:bg-sky-100 disabled:opacity-50"
            >
              <FileDown className="h-4 w-4" />
              Executive PDF Raporu İndir
            </button>
            <HelpTip text="Aday özeti ve mülakat puanlarını yazdırılabilir yönetici PDF’ine aktarır." />
            <button
              type="button"
              disabled={saving || loading || !guide || unanswered > 0}
              onClick={() =>
                void onSave({
                  score,
                  ratings,
                  notes: ratings
                    .map((item) => {
                      const q = questions.find((question) => question.id === item.questionId);
                      return `${q?.question ?? item.questionId}: ${item.rating}/5 — ${item.note}`;
                    })
                    .join("\n"),
                })
              }
              className="rounded-xl bg-[#123056] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#0f2744] disabled:opacity-50"
            >
              {saving ? "Kaydediliyor…" : "Mülakat Değerlendirmesini Kaydet"}
            </button>
          </div>
        </footer>
      </div>
    </div>
    {printOpen ? (
      <PrintReportModal
        open
        resume={{ ...resume, interviewScore: resume.interviewScore ?? score }}
        branding={branding}
        guide={guide}
        ratings={ratings}
        onClose={() => setPrintOpen(false)}
      />
    ) : null}
    </>
  );
}

function QuestionCard({
  index,
  kindLabel,
  question,
  expectedAnswer,
  rating,
  note,
  onRate,
  onNote,
}: {
  index: number;
  kindLabel: string;
  question: string;
  expectedAnswer: string;
  rating: number;
  note: string;
  onRate: (value: number) => void;
  onNote: (value: string) => void;
}) {
  return (
    <article className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-800">
          {kindLabel} {index}
        </span>
      </div>
      <p className="mt-2 text-sm font-medium leading-6 text-[#0b1f3a]">{question}</p>
      <p className="mt-2 rounded-xl bg-[#f8fbff] px-3 py-2 text-xs leading-5 text-slate-600">
        <span className="font-semibold text-sky-800">Beklenen kilit yanıt: </span>
        {expectedAnswer}
      </p>
      <div className="mt-3 flex items-center gap-1" aria-label="Puan">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => onRate(value)}
            className="rounded-md p-0.5 text-amber-400 hover:text-amber-500"
            aria-label={`${value} yıldız`}
          >
            <Star className={`h-5 w-5 ${rating >= value ? "fill-amber-400" : "fill-transparent text-slate-300"}`} />
          </button>
        ))}
        <span className="ml-2 text-xs text-slate-500">{rating ? `${rating}/5` : "Puan yok"}</span>
      </div>
      <textarea
        value={note}
        onChange={(event) => onNote(event.target.value)}
        rows={2}
        placeholder="Mülakat notu…"
        className="mt-2 w-full rounded-xl border border-slate-200 bg-[#f8fbff] px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
      />
    </article>
  );
}
