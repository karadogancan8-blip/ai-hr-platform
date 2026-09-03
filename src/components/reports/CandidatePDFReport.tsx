"use client";

import { allQuestions, type InterviewGuide, type InterviewRating } from "@/lib/interview";
import type { CompanyBranding } from "@/lib/branding";
import type { StoredResume } from "@/lib/resumes";

export type CandidatePDFReportProps = {
  resume: StoredResume;
  branding: CompanyBranding;
  guide: InterviewGuide | null;
  ratings?: InterviewRating[];
  generatedAt?: Date;
};

export function CandidatePDFReport({
  resume,
  branding,
  guide,
  ratings = [],
  generatedAt = new Date(),
}: CandidatePDFReportProps) {
  const questions = guide ? allQuestions(guide) : [];
  const accent = branding.primaryColor;
  const dateLabel = generatedAt.toLocaleString("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <article
      className="box-border w-[794px] bg-white text-slate-800"
      style={{ fontFamily: "Segoe UI, Arial, sans-serif" }}
    >
      <header className="flex items-center justify-between px-10 py-7 text-white" style={{ backgroundColor: accent }}>
        <div className="flex items-center gap-4">
          {branding.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={branding.logoUrl}
              alt={branding.companyName}
              crossOrigin="anonymous"
              className="h-14 w-14 rounded-xl bg-white object-contain p-1"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/15 text-lg font-bold">
              {branding.companyName.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">Executive rapor</p>
            <h1 className="text-xl font-semibold">{branding.companyName}</h1>
            <p className="text-sm text-white/80">İşe alım değerlendirme özeti</p>
          </div>
        </div>
        <p className="text-right text-xs text-white/75">{dateLabel}</p>
      </header>

      <section className="grid grid-cols-3 gap-4 px-10 py-6">
        <div className="col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Aday</p>
          <p className="mt-1 text-2xl font-semibold" style={{ color: accent }}>
            {resume.name}
          </p>
          <p className="mt-1 text-sm text-slate-600">{resume.role}</p>
          {resume.skills.length ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {resume.skills.slice(0, 8).map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-medium text-slate-700 ring-1 ring-slate-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        <div className="space-y-3">
          <ScoreTile label="Eşleşme skoru" value={resume.matchScore} accent={accent} />
          <ScoreTile
            label="Mülakat skoru"
            value={resume.interviewScore}
            accent={accent}
          />
        </div>
      </section>

      <section className="px-10 pb-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: accent }}>
          AI CV özeti
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-700">{resume.summary || "Özet henüz üretilmedi."}</p>
      </section>

      <section className="grid grid-cols-2 gap-4 px-10 pb-6">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Güçlü yönler</h3>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-700">
            {(guide?.strengths.length ? guide.strengths : resume.strengths).slice(0, 6).map((item) => (
              <li key={item}>{item}</li>
            ))}
            {!resume.strengths.length && !guide?.strengths.length ? <li>Belirtilmedi</li> : null}
          </ul>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-800">Gelişime açık yönler</h3>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-700">
            {(guide?.probeAreas.length ? guide.probeAreas : resume.weaknesses).slice(0, 6).map((item) => (
              <li key={item}>{item}</li>
            ))}
            {!resume.weaknesses.length && !guide?.probeAreas.length ? <li>Belirtilmedi</li> : null}
          </ul>
        </div>
      </section>

      <section className="px-10 pb-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: accent }}>
          AI mülakat soruları ve değerlendirme notları
        </h2>
        {questions.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">
            Bu rapor için henüz mülakat rehberi üretilmedi.
            {resume.interviewNotes ? ` Kayıtlı not: ${resume.interviewNotes}` : ""}
          </p>
        ) : (
          <div className="mt-3 space-y-3">
            {questions.map((question, index) => {
              const rating = ratings.find((item) => item.questionId === question.id);
              return (
                <div key={question.id} className="rounded-xl border border-slate-200 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    {question.kind === "technical" ? "Teknik" : "Kültürel uyum"} · Soru {index + 1}
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{question.question}</p>
                  <p className="mt-2 text-xs leading-5 text-slate-600">
                    <span className="font-semibold">Beklenen yanıt: </span>
                    {question.expectedAnswer}
                  </p>
                  <p className="mt-2 text-xs text-slate-700">
                    <span className="font-semibold">Puan: </span>
                    {rating?.rating ? `${rating.rating}/5` : "Puanlanmadı"}
                    {rating?.note ? ` — ${rating.note}` : ""}
                  </p>
                </div>
              );
            })}
          </div>
        )}
        {resume.interviewNotes && questions.length > 0 ? (
          <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-600">
            <span className="font-semibold">Kayıtlı mülakat notları: </span>
            {resume.interviewNotes}
          </p>
        ) : null}
      </section>

      <footer className="flex items-center justify-between border-t border-slate-200 px-10 py-4 text-[11px] text-slate-500">
        <span>{branding.companyName} · Gizli / İç kullanım</span>
        <span>Nexus HR Executive Report</span>
      </footer>
    </article>
  );
}

function ScoreTile({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | null;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold" style={{ color: accent }}>
        {value == null ? "—" : value}
      </p>
    </div>
  );
}
