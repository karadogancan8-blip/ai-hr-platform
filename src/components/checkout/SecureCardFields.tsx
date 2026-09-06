"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { CreditCard, Lock, ShieldCheck } from "lucide-react";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { fieldLabel } from "@/components/ui/surface";

const IFRAME_H = 220;

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

function loadStripeJs() {
  if (window.Stripe) return Promise.resolve();
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>("script[data-nexus-stripe]");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Stripe.js yüklenemedi.")));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://js.stripe.com/v3/";
    script.async = true;
    script.dataset.nexusStripe = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Stripe.js yüklenemedi."));
    document.head.appendChild(script);
  });
}

function announcePaid(planType: string, entitlement: string) {
  const payload = { source: "nexus-checkout", status: "succeeded" as const, planType, entitlement };
  window.dispatchEvent(new CustomEvent("nexus-checkout-paid", { detail: payload }));
  window.postMessage(payload, window.location.origin);
}

type IntentState = {
  mode: "payment" | "setup" | "simulate";
  clientSecret: string;
  publishableKey: string;
};

export function SecureCardFields({
  planId,
  cycle,
  holderName,
  onError,
}: {
  planId: string;
  cycle: "monthly" | "yearly";
  holderName: string;
  onError: (message: string) => void;
}) {
  const { t, locale } = useI18n();
  const [intent, setIntent] = useState<IntentState | null>(null);
  const [ready, setReady] = useState(false);
  const [threeDs, setThreeDs] = useState(false);
  const [number, setNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const cardRef = useRef<{
    stripe?: ReturnType<NonNullable<Window["Stripe"]>>;
    card?: {
      mount: (el: string | HTMLElement) => void;
      unmount: () => void;
      on: (event: string, handler: (e: { error?: { message?: string } }) => void) => void;
    };
  }>({});

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const response = await fetch("/api/billing/create-intent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ planId, cycle }),
      });
      const data = (await response.json()) as IntentState & { error?: string };
      if (!response.ok) throw new Error(data.error || t("checkout.error"));
      if (cancelled) return;
      setIntent({
        mode: data.mode,
        clientSecret: data.clientSecret ?? "",
        publishableKey: data.publishableKey ?? "",
      });

      if (data.mode === "simulate") {
        setReady(true);
        return;
      }

      await loadStripeJs();
      if (cancelled || !window.Stripe || !data.publishableKey) return;
      const stripe = window.Stripe(data.publishableKey);
      const elements = stripe.elements({ locale: locale === "en" ? "en" : "tr" });
      const style = {
        base: {
          fontSize: "16px",
          color: "#0b1f3a",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          "::placeholder": { color: "#94a3b8" },
        },
      };
      const card = elements.create("card", { style, hidePostalCode: true, disableLink: true });
      const mount = document.getElementById("nexus-stripe-card");
      if (!mount) return;
      card.mount(mount);
      card.on("change", (event) => {
        if (event.error?.message) onError(event.error.message);
      });
      cardRef.current = { stripe, card };
      setReady(true);
    })().catch((error) => {
      if (!cancelled) onError(error instanceof Error ? error.message : t("checkout.error"));
    });

    return () => {
      cancelled = true;
      cardRef.current.card?.unmount();
      cardRef.current = {};
    };
  }, [planId, cycle, locale, onError, t]);

  async function confirmStripe() {
    if (!intent || !cardRef.current.stripe || !cardRef.current.card) {
      throw new Error(t("checkout.error"));
    }
    setThreeDs(true);
    const stripe = cardRef.current.stripe;
    const card = cardRef.current.card;
    const billing = { name: holderName.trim() };
    if (intent.mode === "setup") {
      const result = await stripe.confirmCardSetup(intent.clientSecret, {
        payment_method: { card, billing_details: billing },
      });
      if (result.error) throw new Error(result.error.message);
      return { setupIntentId: result.setupIntent?.id };
    }
    const result = await stripe.confirmCardPayment(intent.clientSecret, {
      payment_method: { card, billing_details: billing },
    });
    if (result.error) throw new Error(result.error.message);
    return { paymentIntentId: result.paymentIntent?.id };
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onError("");
    if (!holderName.trim()) {
      onError(t("checkout.nameRequired"));
      return;
    }
    try {
      if (intent?.mode === "simulate") {
        const digits = number.replace(/\s/g, "");
        if (digits.length < 16 || expiry.length < 5 || cvc.length < 3) {
          onError(t("checkout.cardRequired"));
          return;
        }
        setThreeDs(true);
        await new Promise((resolve) => window.setTimeout(resolve, 650));
        const response = await fetch("/api/billing/confirm", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ planId, simulate: true }),
        });
        const data = (await response.json()) as { error?: string; planType?: string; entitlement?: string };
        if (!response.ok) throw new Error(data.error || t("checkout.error"));
        announcePaid(data.planType ?? planId, data.entitlement ?? "");
        return;
      }

      const ids = await confirmStripe();
      const response = await fetch("/api/billing/confirm", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ planId, ...ids }),
      });
      const data = (await response.json()) as { error?: string; planType?: string; entitlement?: string };
      if (!response.ok) throw new Error(data.error || t("checkout.error"));
      announcePaid(data.planType ?? planId, data.entitlement ?? "");
    } catch (error) {
      setThreeDs(false);
      onError(error instanceof Error ? error.message : t("checkout.error"));
    }
  }

  const simulated = intent?.mode === "simulate";

  return (
    <form id="nexus-checkout-form" onSubmit={(event) => void submit(event)} className="space-y-3">
      <div
        className="overflow-hidden rounded-xl border border-slate-200 bg-[#f8fbff]"
        style={{ minHeight: IFRAME_H }}
      >
        <div className="flex h-8 items-center justify-between border-b border-slate-100 px-3">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            {t("checkout.pci")}
          </span>
          <span className="text-[11px] text-slate-400">3D Secure</span>
        </div>

        <div className="relative p-3" style={{ minHeight: IFRAME_H - 32 }}>
          {!ready ? (
            <div className="absolute inset-3 animate-pulse rounded-lg bg-slate-100" aria-hidden />
          ) : null}

          {simulated ? (
            <div className={`space-y-3 ${ready ? "relative" : "invisible"}`}>
              <label className="block">
                <span className={fieldLabel}>{t("checkout.number")}</span>
                <div className="relative h-11">
                  <CreditCard className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={number}
                    onChange={(event) => setNumber(formatCardNumber(event.target.value))}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-sky-400"
                    placeholder="ACCT-000015"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    name="cc-number"
                  />
                </div>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className={fieldLabel}>{t("checkout.expiry")}</span>
                  <input
                    value={expiry}
                    onChange={(event) => setExpiry(formatExpiry(event.target.value))}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-400"
                    placeholder="MM/YY"
                    inputMode="numeric"
                    autoComplete="cc-exp"
                  />
                </label>
                <label className="block">
                  <span className={fieldLabel}>{t("checkout.cvc")}</span>
                  <input
                    value={cvc}
                    onChange={(event) => setCvc(event.target.value.replace(/\D/g, "").slice(0, 4))}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-400"
                    placeholder="123"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                  />
                </label>
              </div>
            </div>
          ) : (
            <div className={ready ? "relative" : "invisible"}>
              <span className={fieldLabel}>{t("checkout.card")}</span>
              <div id="nexus-stripe-card" className="h-11 rounded-xl border border-slate-200 bg-white px-3 py-3" />
            </div>
          )}

          {threeDs ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 p-4 text-center">
              <Lock className="h-6 w-6 text-[#123056]" />
              <p className="mt-2 text-sm font-medium text-slate-800">{t("checkout.processing")}</p>
              <p className="mt-1 text-xs text-slate-500">{t("checkout.threeDs")}</p>
            </div>
          ) : null}
        </div>
      </div>
    </form>
  );
}
