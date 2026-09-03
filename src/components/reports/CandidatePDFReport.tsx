"use client";

import { useState } from "react";
import { allQuestions, type InterviewGuide, type InterviewRating } from "@/lib/interview";
import type { CompanyBranding } from "@/lib/branding";
import type { StoredResume } from "@/lib/resumes";
import { AI_DISCLAIMER_TEXT } from "@/components/ai-disclaimer";

export type CandidatePDFReportProps = {
  resume: StoredResume;
  branding: CompanyBranding;
  guide: InterviewGuide | null;
  ratings?: InterviewRating[];
  generatedAt?: Date;
};

const ink = "#1e293b";
const muted = "#64748b";
const line = "#e2e8f0";
const paper = "#ffffff";
const soft = "#f8fafc";
const greenBg = "#ecfdf5";
const greenInk = "#065f46";
const amberBg = "#fffbeb";
const amberInk = "#92400e";

export function CandidatePDFReport({
  resume,
  branding,
  guide,
  ratings = [],
  generatedAt = new Date(),
}: CandidatePDFReportProps) {
  const questions = guide ? allQuestions(guide) : [];
  const accent = branding.primaryColor || "#123056";
  const [logoFailed, setLogoFailed] = useState(false);
  const dateLabel = generatedAt.toLocaleString("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const strengths = (guide?.strengths.length ? guide.strengths : resume.strengths).slice(0, 8);
  const probes = (guide?.probeAreas.length ? guide.probeAreas : resume.weaknesses).slice(0, 8);

  return (
    <article
      id="candidate-print-root"
      style={{
        boxSizing: "border-box",
        width: "210mm",
        maxWidth: "100%",
        margin: "0 auto",
        background: paper,
        color: ink,
        fontFamily: 'Segoe UI, Arial, Helvetica, sans-serif',
        fontSize: "12px",
        lineHeight: 1.5,
        printColorAdjust: "exact",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          padding: "22px 28px",
          background: accent,
          color: paper,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {branding.logoUrl && !logoFailed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={branding.logoUrl}
              alt={branding.companyName}
              onError={() => setLogoFailed(true)}
              style={{
                width: 56,
                height: 56,
                objectFit: "contain",
                background: paper,
                borderRadius: 12,
                padding: 4,
              }}
            />
          ) : (
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 12,
                background: "rgba(255,255,255,0.16)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 16,
              }}
            >
              {branding.companyName.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <p style={{ margin: 0, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", opacity: 0.75 }}>
              Executive rapor
            </p>
            <h1 style={{ margin: "4px 0 0", fontSize: 20, fontWeight: 650 }}>{branding.companyName}</h1>
            <p style={{ margin: "2px 0 0", fontSize: 12, opacity: 0.85 }}>İşe alım değerlendirme özeti</p>
          </div>
        </div>
        <p style={{ margin: 0, fontSize: 11, opacity: 0.8, textAlign: "right" }}>{dateLabel}</p>
      </header>

      <section style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: 14, padding: "20px 28px 8px" }}>
        <div style={{ border: `1px solid ${line}`, background: soft, borderRadius: 14, padding: 16 }}>
          <p style={{ margin: 0, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: muted }}>
            Aday
          </p>
          <p style={{ margin: "6px 0 0", fontSize: 22, fontWeight: 650, color: accent }}>{resume.name}</p>
          <p style={{ margin: "4px 0 0", color: muted }}>{resume.role}</p>
          {resume.skills.length ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
              {resume.skills.slice(0, 10).map((skill) => (
                <span
                  key={skill}
                  style={{
                    border: `1px solid ${line}`,
                    background: paper,
                    borderRadius: 999,
                    padding: "2px 10px",
                    fontSize: 11,
                    color: ink,
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <ScoreTile label="Eşleşme skoru" value={resume.matchScore} accent={accent} />
          <ScoreTile label="Mülakat skoru" value={resume.interviewScore} accent={accent} />
        </div>
      </section>

      <section style={{ padding: "12px 28px" }}>
        <h2 style={{ margin: 0, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: accent }}>
          AI CV özeti
        </h2>
        <p style={{ margin: "8px 0 0", color: ink }}>{resume.summary || "Özet henüz üretilmedi."}</p>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "4px 28px 16px" }}>
        <div style={{ border: "1px solid #a7f3d0", background: greenBg, borderRadius: 14, padding: 14 }}>
          <h3 style={{ margin: 0, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: greenInk }}>
            Güçlü yönler
          </h3>
          <ul style={{ margin: "8px 0 0", paddingLeft: 18, color: ink }}>
            {strengths.length ? strengths.map((item) => <li key={item}>{item}</li>) : <li>Belirtilmedi</li>}
          </ul>
        </div>
        <div style={{ border: "1px solid #fde68a", background: amberBg, borderRadius: 14, padding: 14 }}>
          <h3 style={{ margin: 0, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: amberInk }}>
            Gelişime açık yönler
          </h3>
          <ul style={{ margin: "8px 0 0", paddingLeft: 18, color: ink }}>
            {probes.length ? probes.map((item) => <li key={item}>{item}</li>) : <li>Belirtilmedi</li>}
          </ul>
        </div>
      </section>

      <section style={{ padding: "0 28px 20px" }}>
        <h2 style={{ margin: 0, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: accent }}>
          AI mülakat soruları ve değerlendirme notları
        </h2>
        {questions.length === 0 ? (
          <p style={{ margin: "8px 0 0", color: muted }}>
            Bu rapor için henüz mülakat rehberi üretilmedi.
            {resume.interviewNotes ? ` Kayıtlı not: ${resume.interviewNotes}` : ""}
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
            {questions.map((question, index) => {
              const rating = ratings.find((item) => item.questionId === question.id);
              return (
                <div key={question.id} style={{ border: `1px solid ${line}`, borderRadius: 12, padding: 12 }}>
                  <p style={{ margin: 0, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: muted }}>
                    {question.kind === "technical" ? "Teknik" : "Kültürel uyum"} · Soru {index + 1}
                  </p>
                  <p style={{ margin: "6px 0 0", fontWeight: 600, color: ink }}>{question.question}</p>
                  <p style={{ margin: "6px 0 0", color: muted }}>
                    <strong style={{ color: accent }}>Beklenen yanıt: </strong>
                    {question.expectedAnswer}
                  </p>
                  <p style={{ margin: "6px 0 0", color: ink }}>
                    <strong>Puan: </strong>
                    {rating?.rating ? `${rating.rating}/5` : "Puanlanmadı"}
                    {rating?.note ? ` — ${rating.note}` : ""}
                  </p>
                </div>
              );
            })}
          </div>
        )}
        {resume.interviewNotes && questions.length > 0 ? (
          <p style={{ margin: "12px 0 0", background: soft, borderRadius: 12, padding: 12, color: muted }}>
            <strong style={{ color: ink }}>Kayıtlı mülakat notları: </strong>
            {resume.interviewNotes}
          </p>
        ) : null}
      </section>

      <section style={{ padding: "0 28px 16px" }}>
        <p
          style={{
            margin: 0,
            padding: 12,
            borderRadius: 12,
            border: "1px solid #fde68a",
            background: "#fffbeb",
            color: "#78350f",
            fontSize: 11,
            lineHeight: 1.5,
          }}
        >
          {AI_DISCLAIMER_TEXT}
        </p>
      </section>

      <footer
        style={{
          display: "flex",
          justifyContent: "space-between",
          borderTop: `1px solid ${line}`,
          padding: "12px 28px",
          fontSize: 11,
          color: muted,
        }}
      >
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
    <div style={{ border: `1px solid ${line}`, background: paper, borderRadius: 14, padding: 12, textAlign: "center" }}>
      <p style={{ margin: 0, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: muted }}>{label}</p>
      <p style={{ margin: "6px 0 0", fontSize: 24, fontWeight: 700, color: accent }}>{value == null ? "—" : value}</p>
    </div>
  );
}
