"use client";

import { FormEvent, useEffect, useState } from "react";
import { CreditCard, Lock, X } from "lucide-react";
import type { Plan } from "@/lib/plans";

type CheckoutModalProps = {
  open: boolean;
  plan: Plan | null;
  chargeLabel?: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

function formatCardNumber(value: string) {
  return value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ");
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function CheckoutModal({ open, plan, chargeLabel, onClose, onConfirm }: CheckoutModalProps) {
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setName("");
    setNumber("");
    setExpiry("");
    setCvc("");
    setError("");
    setPending(false);
  }, [open, plan?.id]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, pending, onClose]);

  if (!open || !plan) return null;

  async function submit(event: FormEvent) {
    event.preventDefault();
    const digits = number.replace(/\s/g, "");
    if (digits.length < 16 || expiry.length < 5 || cvc.length < 3 || !name.trim()) {
      setError("Kart sahibi, 16 haneli kart numarası, son kullanma tarihi ve CVC gerekli.");
      return;
    }
    setPending(true);
    setError("");
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 700));
      await onConfirm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ödeme tamamlanamadı.");
      setPending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/45 p-4 backdrop-blur-[2px] sm:items-center">
      <button type="button" className="absolute inset-0" aria-label="Kapat" onClick={onClose} disabled={pending} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
        className="relative w-full max-w-md rounded-3xl border border-sky-100 bg-white p-6 shadow-[0_24px_80px_rgba(15,55,95,0.22)]"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">Güvenli ödeme şablonu</p>
            <h2 id="checkout-title" className="mt-1 text-lg font-semibold text-[#0b1f3a]">
              {plan.name} planına abone ol
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {chargeLabel ?? "Özel fiyatlandırma"} · Stripe / iyzico bağlanabilir
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

        <form onSubmit={submit} className="mt-5 space-y-3">
          <label className="block text-sm">
            <span className="mb-1 block text-slate-600">Kart üzerindeki isim</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-[#f8fbff] px-3 py-2.5 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
              placeholder="Ad Soyad"
              autoComplete="cc-name"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-slate-600">Kart numarası</span>
            <div className="relative">
              <CreditCard className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={number}
                onChange={(event) => setNumber(formatCardNumber(event.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-[#f8fbff] py-2.5 pl-10 pr-3 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                placeholder="ACCT-000015"
                inputMode="numeric"
                autoComplete="cc-number"
              />
            </div>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="mb-1 block text-slate-600">Son kullanma</span>
              <input
                value={expiry}
                onChange={(event) => setExpiry(formatExpiry(event.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-[#f8fbff] px-3 py-2.5 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                placeholder="AA/YY"
                inputMode="numeric"
                autoComplete="cc-exp"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-slate-600">CVC</span>
              <input
                value={cvc}
                onChange={(event) => setCvc(event.target.value.replace(/\D/g, "").slice(0, 4))}
                className="w-full rounded-xl border border-slate-200 bg-[#f8fbff] px-3 py-2.5 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                placeholder="123"
                inputMode="numeric"
                autoComplete="cc-csc"
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={pending}
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#123056] py-3 text-sm font-medium text-white hover:bg-[#0f2744] disabled:opacity-50"
          >
            <Lock className="h-4 w-4" />
            {pending ? "Ödeme işleniyor…" : "Ödemeyi Tamamla"}
          </button>
          {error ? <p className="text-sm text-rose-700">{error}</p> : null}
          <p className="text-[11px] leading-4 text-slate-400">
            Kart verisi saklanmaz. Bu akış Stripe / iyzico entegrasyonu için arayüz şablonudur.
          </p>
        </form>
      </div>
    </div>
  );
}
