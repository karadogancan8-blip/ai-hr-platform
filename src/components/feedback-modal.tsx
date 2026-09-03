"use client";

import { FormEvent, useEffect, useState } from "react";
import { Send, X } from "lucide-react";

const CATEGORIES = [
  { id: "feature", label: "Öneri / Özellik İsteği" },
  { id: "bug", label: "Hata Bildirimi" },
  { id: "general", label: "Genel Geri Bildirim" },
] as const;

type CategoryId = (typeof CATEGORIES)[number]["id"];

export function FeedbackModal() {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<CategoryId>("feature");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setCategory("feature");
    setMessage("");
    setPending(false);
    setSent(false);
    setError("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, pending]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!message.trim()) {
      setError("Lütfen bir mesaj yazın.");
      return;
    }
    setPending(true);
    setError("");
    await new Promise((resolve) => window.setTimeout(resolve, 450));
    setPending(false);
    setSent(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-[#123056] px-4 py-3 text-sm font-medium text-white shadow-[0_12px_32px_rgba(18,48,86,0.35)] hover:bg-[#0f2744] sm:bottom-6 sm:right-6"
      >
        <span className="text-base leading-none" aria-hidden>
          💡
        </span>
        Öneri & Geri Bildirim
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/45 p-4 backdrop-blur-[2px] sm:items-center">
          <button
            type="button"
            className="absolute inset-0"
            aria-label="Kapat"
            onClick={() => !pending && setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-title"
            className="relative w-full max-w-md rounded-3xl border border-sky-100 bg-white p-6 shadow-[0_24px_80px_rgba(15,55,95,0.22)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">Ürün geri bildirimi</p>
                <h2 id="feedback-title" className="mt-1 text-lg font-semibold text-[#0b1f3a]">
                  Öneri & Geri Bildirim
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Hata, özellik isteği veya genel yorumlarınızı İK ekibiyle paylaşın.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={pending}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-700"
                aria-label="Kapat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {sent ? (
              <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-5 text-sm leading-6 text-emerald-900">
                Geri bildiriminiz için teşekkür ederiz! Fikirlerinizle Nexus HR&apos;ı geliştiriyoruz.
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="mt-4 block w-full rounded-xl bg-[#123056] py-2.5 text-sm font-medium text-white hover:bg-[#0f2744]"
                >
                  Kapat
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="mt-5 space-y-4">
                <fieldset>
                  <legend className="mb-2 text-sm font-medium text-slate-700">Kategori</legend>
                  <div className="grid gap-2">
                    {CATEGORIES.map((item) => (
                      <label
                        key={item.id}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm ${
                          category === item.id
                            ? "border-sky-300 bg-sky-50 text-[#0b1f3a]"
                            : "border-slate-200 bg-[#f8fbff] text-slate-600 hover:border-sky-200"
                        }`}
                      >
                        <input
                          type="radio"
                          name="feedback-category"
                          value={item.id}
                          checked={category === item.id}
                          onChange={() => setCategory(item.id)}
                          className="accent-[#123056]"
                        />
                        {item.label}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-slate-700">Mesaj</span>
                  <textarea
                    required
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    rows={5}
                    placeholder="Ne geliştirilebilir, nerede takıldınız veya hangi özelliği görmek istersiniz?"
                    className="w-full rounded-xl border border-slate-200 bg-[#f8fbff] px-3 py-2.5 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                  />
                </label>
                {error ? <p className="text-sm text-rose-700">{error}</p> : null}
                <button
                  type="submit"
                  disabled={pending}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#123056] py-3 text-sm font-medium text-white hover:bg-[#0f2744] disabled:opacity-50"
                >
                  {pending ? (
                    "Gönderiliyor…"
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Gönder
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
