"use client";

import { FormEvent, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { IconUpload } from "@/components/icons";
import { ClipboardList, FileDown, Loader2, Sparkles, Video } from "lucide-react";
import { useCompanyBranding } from "@/components/branding/BrandingProvider";
import { InterviewModal } from "@/components/recruiter/InterviewModal";
import { CandidatePDFReport } from "@/components/reports/CandidatePDFReport";
import type { InterviewGuide } from "@/lib/interview";
import { exportElementToPdf } from "@/lib/pdf-report";
import { fetchResumes, updateResumeInterview, type StoredResume } from "@/lib/resumes";
import { isSupabaseConfigured } from "@/lib/supabase";

function scoreTone(score: number) {
  if (score >= 90) return "from-sky-500 to-blue-700";
  if (score >= 80) return "from-sky-400 to-indigo-600";
  return "from-slate-400 to-slate-600";
}

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString("tr-TR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

type AnalysisResponse = {
  name: string;
  role: string;
  matchScore: number;
  summary: string;
  skills?: string[];
  strengths?: string[];
  weaknesses?: string[];
  saved?: StoredResume;
  error?: string;
};

export function RecruiterWorkspace() {
  const [resumes, setResumes] = useState<StoredResume[]>([]);
  const [cvText, setCvText] = useState("");
  const [jobTitle, setJobTitle] = useState("Kıdemli Frontend Geliştirici");
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [guides, setGuides] = useState<Record<string, InterviewGuide>>({});
  const [interviewResume, setInterviewResume] = useState<StoredResume | null>(null);
  const [interviewMode, setInterviewMode] = useState<"guide" | "live">("guide");
  const [guideLoading, setGuideLoading] = useState(false);
  const [guideError, setGuideError] = useState("");
  const [savingInterview, setSavingInterview] = useState(false);
  const [pdfBusyId, setPdfBusyId] = useState<string | null>(null);
  const [pdfBundle, setPdfBundle] = useState<{ resume: StoredResume; guide: InterviewGuide | null } | null>(null);
  const pdfRef = useRef<HTMLDivElement>(null);
  const branding = useCompanyBranding();

  const average = useMemo(() => {
    if (!resumes.length) return 0;
    return Math.round(resumes.reduce((sum, item) => sum + item.matchScore, 0) / resumes.length);
  }, [resumes]);

  async function loadResumes() {
    if (!isSupabaseConfigured()) {
      setError(
        "Supabase yapılandırılmamış. NEXT_PUBLIC_SUPABASE_URL ve anon/publishable anahtarı .env.local dosyasına ekleyin.",
      );
      setLoading(false);
      return;
    }
    try {
      setError("");
      const rows = await fetchResumes();
      setResumes(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Aday listesi yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadResumes();
  }, []);

  async function ingestFiles(list: FileList | null) {
    const file = list?.[0];
    if (!file) return;
    setFileName(file.name);
    const text = await file.text();
    setCvText(text);
    setNotice(`${file.name} metin olarak okundu. Analiz için butona basın.`);
  }

  async function analyze(event: FormEvent) {
    event.preventDefault();
    if (cvText.trim().length < 40) {
      setNotice("Analiz için daha uzun bir CV / aday metni girin.");
      return;
    }
    setAnalyzing(true);
    setNotice("");
    setError("");
    try {
      const response = await fetch("/api/analyze-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvText, jobTitle }),
      });
      const payload = (await response.json()) as AnalysisResponse;
      if (!response.ok) {
        throw new Error(payload.error || "Analiz isteği başarısız.");
      }

      const saved = payload.saved;
      if (!saved) {
        throw new Error("Analiz tamamlandı ancak resumes tablosuna yazılamadı.");
      }

      setResumes((prev) => [saved, ...prev]);
      setNotice(`${saved.name} resumes tablosuna kaydedildi.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analiz veya kayıt başarısız.");
    } finally {
      setAnalyzing(false);
    }
  }

  async function loadInterviewGuide(resume: StoredResume) {
    const cached = guides[resume.id];
    if (cached) return cached;
    const response = await fetch("/api/generate-interview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        candidateName: resume.name,
        role: resume.role,
        jobTitle,
        summary: resume.summary,
        skills: resume.skills,
        strengths: resume.strengths,
        weaknesses: resume.weaknesses,
      }),
    });
    const payload = (await response.json()) as { guide?: InterviewGuide; error?: string };
    if (!response.ok || !payload.guide) {
      throw new Error(payload.error || "Mülakat rehberi üretilemedi.");
    }
    setGuides((prev) => ({ ...prev, [resume.id]: payload.guide! }));
    return payload.guide;
  }

  async function openInterview(resume: StoredResume, mode: "guide" | "live") {
    setInterviewResume(resume);
    setInterviewMode(mode);
    setGuideError("");
    if (guides[resume.id]) return;
    setGuideLoading(true);
    try {
      await loadInterviewGuide(resume);
    } catch (err) {
      setGuideError(err instanceof Error ? err.message : "Rehber üretilemedi.");
    } finally {
      setGuideLoading(false);
    }
  }

  async function downloadExecutivePdf(resume: StoredResume) {
    setPdfBusyId(resume.id);
    setError("");
    try {
      const guide = guides[resume.id] ?? (await loadInterviewGuide(resume));
      setPdfBundle({ resume, guide });
    } catch (err) {
      setError(err instanceof Error ? err.message : "PDF için mülakat rehberi alınamadı.");
      setPdfBusyId(null);
    }
  }

  useLayoutEffect(() => {
    if (!pdfBundle) return;
    const node = pdfRef.current;
    if (!node) {
      setError("PDF şablonu hazır değil.");
      setPdfBusyId(null);
      setPdfBundle(null);
      return;
    }
    const name = pdfBundle.resume.name;
    let cancelled = false;
    void exportElementToPdf(node, `${name}-executive-rapor`)
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "PDF oluşturulamadı.");
      })
      .finally(() => {
        if (cancelled) return;
        setPdfBusyId(null);
        setPdfBundle(null);
      });
    return () => {
      cancelled = true;
    };
  }, [pdfBundle]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">RecruiterAgent</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#0b1f3a]">
            İşe Alım & CV Analizi
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Analiz sonuçları Supabase <code className="text-sky-800">resumes</code> tablosuna yazılır.
          </p>
        </div>
        <div className="rounded-2xl border border-sky-100 bg-white px-4 py-3 text-sm shadow-sm">
          <span className="text-slate-500">Ortalama eşleşme</span>
          <span className="ml-2 font-semibold text-[#0b1f3a]">{average}%</span>
        </div>
      </div>

      {error ? (
        <p className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>
      ) : null}

      <form onSubmit={analyze} className="space-y-4">
        <section
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            void ingestFiles(event.dataTransfer.files);
          }}
          className={`rounded-2xl border-2 border-dashed p-8 text-center transition ${
            dragging
              ? "border-sky-500 bg-sky-50"
              : "border-sky-200 bg-white shadow-[0_8px_30px_rgba(15,55,95,0.06)]"
          }`}
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sky-50 text-sky-700">
            <IconUpload className="h-6 w-6" />
          </div>
          <p className="mt-3 text-base font-medium text-[#0b1f3a]">CV dosyasını sürükleyip bırakın</p>
          <p className="mt-1 text-sm text-slate-500">
            Metin tabanlı dosyalar (.txt, .md, .csv) otomatik okunur. PDF için metni aşağıya yapıştırın.
          </p>
          <label className="mt-4 inline-flex cursor-pointer rounded-xl bg-[#123056] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#0f2744]">
            Dosya seç
            <input
              type="file"
              accept=".txt,.md,.csv,.json,.pdf,.doc,.docx"
              className="hidden"
              onChange={(event) => void ingestFiles(event.target.files)}
            />
          </label>
          {fileName ? <p className="mt-3 text-xs text-sky-800">{fileName}</p> : null}
        </section>

        <section className="rounded-2xl border border-sky-100 bg-white p-5 shadow-[0_8px_30px_rgba(15,55,95,0.06)]">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Açık pozisyon</span>
            <input
              value={jobTitle}
              onChange={(event) => setJobTitle(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-[#f8fbff] px-3 py-2.5 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
            />
          </label>
          <label className="mt-4 block text-sm">
            <span className="mb-1 block font-medium text-slate-700">CV / aday metni</span>
            <textarea
              value={cvText}
              onChange={(event) => setCvText(event.target.value)}
              rows={8}
              placeholder="CV içeriğini yapıştırın…"
              className="w-full rounded-xl border border-slate-200 bg-[#f8fbff] px-3 py-2.5 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
            />
          </label>
          <button
            type="submit"
            disabled={analyzing}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#123056] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#0f2744] disabled:opacity-50"
          >
            {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {analyzing ? "Analiz ediliyor…" : "CV / Metin analiz et"}
          </button>
          {notice ? <p className="mt-3 text-xs text-sky-800">{notice}</p> : null}
        </section>
      </form>

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-[#0b1f3a]">Kayıtlı aday analizleri</h2>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              void loadResumes();
            }}
            className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            Yenile
          </button>
        </div>
        {loading ? <p className="text-sm text-slate-400">Veritabanından yükleniyor…</p> : null}
        {!loading && resumes.length === 0 ? (
          <p className="text-sm text-slate-400">Henüz kayıtlı analiz yok.</p>
        ) : null}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {resumes.map((resume) => (
            <article
              key={resume.id}
              className="flex flex-col rounded-2xl border border-sky-100 bg-white p-4 shadow-[0_8px_30px_rgba(15,55,95,0.06)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-[#0b1f3a]">{resume.name}</h3>
                  <p className="text-xs text-slate-500">{resume.role}</p>
                  <span
                    className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      resume.interviewScore == null
                        ? "bg-slate-100 text-slate-500"
                        : "bg-indigo-50 text-indigo-800"
                    }`}
                  >
                    Mülakat Skoru: {resume.interviewScore == null ? "—" : resume.interviewScore}
                  </span>
                </div>
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white ${scoreTone(
                    resume.matchScore,
                  )}`}
                >
                  {resume.matchScore}%
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{resume.summary}</p>
              {resume.strengths.length ? (
                <div className="mt-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">Güçlü yönler</p>
                  <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-slate-600">
                    {resume.strengths.slice(0, 3).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {resume.weaknesses.length ? (
                <div className="mt-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-700">Gelişim alanları</p>
                  <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-slate-600">
                    {resume.weaknesses.slice(0, 3).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {resume.skills.slice(0, 6).map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-xs text-slate-400">{formatWhen(resume.createdAt)}</p>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => void openInterview(resume, "guide")}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-medium text-sky-900 hover:bg-sky-100"
                >
                  <ClipboardList className="h-3.5 w-3.5" />
                  AI Mülakat Rehberi Üret
                </button>
                <button
                  type="button"
                  onClick={() => void openInterview(resume, "live")}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#123056] px-3 py-2 text-xs font-medium text-white hover:bg-[#0f2744]"
                >
                  <Video className="h-3.5 w-3.5" />
                  Mülakat Başlat
                </button>
                <button
                  type="button"
                  onClick={() => void downloadExecutivePdf(resume)}
                  disabled={pdfBusyId === resume.id}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 sm:col-span-2"
                >
                  {pdfBusyId === resume.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <FileDown className="h-3.5 w-3.5" />
                  )}
                  Executive PDF Raporu İndir
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <InterviewModal
        open={Boolean(interviewResume)}
        mode={interviewMode}
        resume={interviewResume}
        guide={interviewResume ? (guides[interviewResume.id] ?? null) : null}
        loading={guideLoading}
        error={guideError}
        saving={savingInterview}
        onClose={() => {
          if (savingInterview) return;
          setInterviewResume(null);
          setGuideError("");
        }}
        onSave={async ({ score, notes }) => {
          if (!interviewResume) return;
          setSavingInterview(true);
          try {
            const updated = await updateResumeInterview(interviewResume.id, {
              interviewScore: score,
              interviewNotes: notes,
            });
            setResumes((prev) => prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)));
            setNotice(`${interviewResume.name} için mülakat skoru ${score} olarak kaydedildi.`);
            setInterviewResume(null);
          } catch (err) {
            setGuideError(err instanceof Error ? err.message : "Skor kaydedilemedi.");
          } finally {
            setSavingInterview(false);
          }
        }}
      />
      {pdfBundle ? (
        <div className="pointer-events-none fixed top-0 -left-[12000px] z-[-1]">
          <div ref={pdfRef}>
            <CandidatePDFReport resume={pdfBundle.resume} branding={branding} guide={pdfBundle.guide} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
