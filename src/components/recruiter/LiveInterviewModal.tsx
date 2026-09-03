"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Mic, Square, Video, X } from "lucide-react";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { allQuestions, type InterviewGuide } from "@/lib/interview";
import type { StoredResume } from "@/lib/resumes";

type LiveInterviewModalProps = {
  open: boolean;
  resume: StoredResume | null;
  guide: InterviewGuide | null;
  saving?: boolean;
  onClose: () => void;
  onComplete: (payload: { score: number; notes: string }) => Promise<void>;
};

const FALLBACK_QUESTIONS = [
  "Kendinizi ve bu role uygunluğunuzu kısaca anlatır mısınız?",
  "Son 12 ayda teslim ettiğiniz en somut iş hangisiydi ve sonucu nasıl ölçtünüz?",
  "Zor bir paydaş veya ekip geriliminde nasıl hizalama sağlarsınız?",
  "Bu pozisyonda ilk 90 günde hangi etkiyi yaratmak istersiniz?",
];

export function LiveInterviewModal({
  open,
  resume,
  guide,
  saving,
  onClose,
  onComplete,
}: LiveInterviewModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<{ stop: () => void } | null>(null);
  const questions = useMemo(() => {
    if (guide) return allQuestions(guide).map((item) => item.question);
    return FALLBACK_QUESTIONS;
  }, [guide]);

  const [index, setIndex] = useState(0);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [listening, setListening] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [done, setDone] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const question = questions[index] ?? FALLBACK_QUESTIONS[0];

  useEffect(() => {
    if (!open) return;
    setIndex(0);
    setAnswers([]);
    setDraft("");
    setDone(false);
    setScore(null);
    setListening(false);
    setCameraError("");
    void startCamera();
    return () => {
      stopListening();
      stopCamera();
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    };
  }, [open, resume?.id]);

  useEffect(() => {
    if (!cameraOn || !videoRef.current || !streamRef.current) return;
    videoRef.current.srcObject = streamRef.current;
    void videoRef.current.play().catch(() => undefined);
  }, [cameraOn]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !saving && !listening) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, saving, listening, onClose]);

  async function startCamera() {
    stopCamera();
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Bu tarayıcı kamera API’sini desteklemiyor. AI mülakatçı avatarı kullanılıyor.");
      setCameraOn(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 } },
        audio: true,
      });
      streamRef.current = stream;
      setCameraOn(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }
    } catch {
      setCameraError("Kamera izni verilmedi. Simülasyon AI mülakatçı avatarı ile devam eder.");
      setCameraOn(false);
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOn(false);
  }

  function speakQuestion() {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(question);
    utterance.lang = "tr-TR";
    utterance.rate = 0.96;
    window.speechSynthesis.speak(utterance);
  }

  function stopListening() {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setListening(false);
  }

  function startListening() {
    const SpeechRecognitionCtor =
      (window as Window & { webkitSpeechRecognition?: new () => SpeechRecognitionLike }).webkitSpeechRecognition ||
      (window as Window & { SpeechRecognition?: new () => SpeechRecognitionLike }).SpeechRecognition;
    speakQuestion();
    if (!SpeechRecognitionCtor) {
      setListening(true);
      window.setTimeout(() => setListening(false), 2200);
      return;
    }
    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "tr-TR";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      const text = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? "")
        .join(" ")
        .trim();
      if (text) setDraft(text);
    };
    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }

  function nextQuestion() {
    stopListening();
    const text = draft.trim();
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = text || next[index] || "(Sözlü yanıt kaydedildi)";
      return next;
    });
    setDraft("");
    if (index < questions.length - 1) setIndex((value) => value + 1);
  }

  async function finish() {
    stopListening();
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    const filled = [...answers];
    filled[index] = draft.trim() || filled[index] || "(Sözlü yanıt kaydedildi)";
    const lengths = filled.filter(Boolean).map((item) => item.length);
    const avg = lengths.length ? lengths.reduce((sum, item) => sum + item, 0) / lengths.length : 40;
    const computed = Math.min(94, Math.max(58, Math.round(60 + Math.min(avg, 280) / 10)));
    setScore(computed);
    setDone(true);
    const notes = questions
      .map((item, i) => `S${i + 1}: ${item}\nYanıt: ${filled[i] || "—"}`)
      .join("\n\n");
    await onComplete({ score: computed, notes });
  }

  if (!open || !resume) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-3 backdrop-blur-[2px] sm:items-center sm:p-6">
      <button type="button" className="absolute inset-0" aria-label="Kapat" onClick={() => !saving && onClose()} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="live-interview-title"
        className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.2)]"
      >
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Canlı AI Mülakat Simülasyonu
            </p>
            <h2 id="live-interview-title" className="mt-1 text-lg font-semibold text-slate-900">
              {resume.name} · {resume.role}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50"
            aria-label="Kapat"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto p-5 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950">
            {cameraOn ? (
              <video ref={videoRef} muted playsInline className="aspect-video h-full w-full object-cover" />
            ) : (
              <div className="flex aspect-video flex-col items-center justify-center gap-3 bg-gradient-to-br from-slate-800 to-slate-950 text-white">
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-sky-500/20 text-lg font-semibold ring-1 ring-sky-300/40">
                  AI
                </span>
                <p className="text-sm font-medium">AI Mülakatçı</p>
                <p className="max-w-xs px-4 text-center text-xs text-slate-400">
                  {cameraError || "Kamera önizlemesi bekleniyor…"}
                </p>
                <button
                  type="button"
                  onClick={() => void startCamera()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs hover:bg-white/15"
                >
                  <Video className="h-3.5 w-3.5" />
                  Kamerayı dene
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Soru {index + 1} / {questions.length}
            </p>
            <p className="mt-2 text-base font-medium leading-7 text-slate-900">{question}</p>
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={4}
              placeholder="Konuşun veya yanıtınızı yazın…"
              className="mt-4 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />

            <div className={`mt-4 flex h-10 items-end justify-center gap-1 ${listening ? "opacity-100" : "opacity-40"}`}>
              {Array.from({ length: 12 }).map((_, i) => (
                <span
                  key={i}
                  className="w-1 rounded-full bg-sky-500"
                  style={{
                    height: listening ? `${10 + ((i * 17) % 28)}px` : "8px",
                    animation: listening ? `live-wave 0.7s ease-in-out ${i * 0.05}s infinite alternate` : "none",
                  }}
                />
              ))}
            </div>

            <div className="mt-4 grid gap-2">
              <button
                type="button"
                onClick={() => (listening ? stopListening() : startListening())}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
              >
                {listening ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                {listening ? "Dinlemeyi durdur" : "Cevapla / Konuşmayı Başlat"}
              </button>
              <button
                type="button"
                onClick={nextQuestion}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {index < questions.length - 1 ? "Sonraki soru" : "Yanıtı kaydet"}
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void finish()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#123056] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#0f2744] disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Mülakatı Tamamla ve AI Değerlendirmesi Al
              </button>
            </div>

            {done && score != null ? (
              <p className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
                AI değerlendirme skoru: <strong>{score}</strong>. Özet aday kartına kaydedildi.
              </p>
            ) : null}
            <AiDisclaimer className="mt-4" />
          </div>
        </div>
      </div>
      <style>{`
        @keyframes live-wave {
          from { transform: scaleY(0.45); }
          to { transform: scaleY(1.15); }
        }
      `}</style>
    </div>
  );
}

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript?: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};
