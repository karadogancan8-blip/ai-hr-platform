"use client";

import { FormEvent, useEffect, useState } from "react";
import { CalendarCheck, X } from "lucide-react";

type DemoRequestModalProps = {
  open: boolean;
  onClose: () => void;
  planName?: string;
};

export function DemoRequestModal({ open, onClose, planName }: DemoRequestModalProps) {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName("");
    setCompany("");
    setEmail("");
    setNote("");
    setPending(false);
    setSent(false);
  }, [open, planName]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, pending, onClose]);

  if (!open) return null;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim() || !company.trim() || !email.trim()) return;
    setPending(true);
    await new Promise((resolve) => window.setTimeout(resolve, 500));
    setPending(false);
    setSent(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/45 p-4 backdrop-blur-[2px] sm:items-center">
      <button type="button" className="absolute inset-0" aria-label="Kapat" onClick={onClose} disabled={pending} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="demo-title"
        className="relative w-full max-w-md rounded-3xl border border-sky-100 bg-white p-6 shadow-[0_24px_80px_rgba(15,55,95,0.22)]"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">Kurumsal demo</p>
            <h2 id="demo-title" className="mt-1 text-lg font-semibold text-[#0b1f3a]">
              Demo randevusu alın
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {planName
                ? `${planName} paketi için 30 dakikalık keşif toplantısı planlayalım.`
                : "İK ekibiniz için 30 dakikalık canlı ürün turu planlayalım."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-700"
            aria-label="Kapat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {sent ? (
          <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-5 text-sm text-emerald-900">
            Talebiniz alındı. Satış ekibimiz {email} adresinden en kısa sürede sizinle iletişime geçecek.
            <button
              type="button"
              onClick={onClose}
              className="mt-4 block w-full rounded-xl bg-[#123056] py-2.5 text-sm font-medium text-white"
            >
              Kapat
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-5 space-y-3">
            <label className="block text-sm">
              <span className="mb-1 block text-slate-600">Ad soyad</span>
              <input
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-[#f8fbff] px-3 py-2.5 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                placeholder="Ayşe Yılmaz"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-slate-600">Şirket</span>
              <input
                required
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-[#f8fbff] px-3 py-2.5 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                placeholder="Şirket A.Ş."
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-slate-600">İş e-postası</span>
              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-[#f8fbff] px-3 py-2.5 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                placeholder="ik@sirket.com"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-slate-600">Not (isteğe bağlı)</span>
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={3}
                className="w-full rounded-xl border border-slate-200 bg-[#f8fbff] px-3 py-2.5 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                placeholder="Çalışan sayısı, mevcut İK yazılımı…"
              />
            </label>
            <button
              type="submit"
              disabled={pending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#123056] py-3 text-sm font-medium text-white hover:bg-[#0f2744] disabled:opacity-50"
            >
              <CalendarCheck className="h-4 w-4" />
              {pending ? "Gönderiliyor…" : "Demo talep et"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
