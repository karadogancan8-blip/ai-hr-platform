"use client";

import { useCallback, useEffect, useState } from "react";
import { Lock, X } from "lucide-react";
import { SecureCardFields } from "@/components/checkout/SecureCardFields";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { fieldLabel } from "@/components/ui/surface";
import type { BillingCycle, Plan, PlanId } from "@/lib/plans";

type CheckoutModalProps = {
  open: boolean;
  plan: Plan | null;
  cycle?: BillingCycle;
  chargeLabel?: string;
  onClose: () => void;
  onPaid: (result: { planType: PlanId; entitlement: string }) => void;
};

export function CheckoutModal({ open, plan, cycle = "monthly", chargeLabel, onClose, onPaid }: CheckoutModalProps) {
  if (!open || !plan) return null;
  return (
    <CheckoutDialog
      key={`${plan.id}-${cycle}`}
      plan={plan}
      cycle={cycle}
      chargeLabel={chargeLabel}
      onClose={onClose}
      onPaid={onPaid}
    />
  );
}

function CheckoutDialog({
  plan,
  cycle,
  chargeLabel,
  onClose,
  onPaid,
}: {
  plan: Plan;
  cycle: BillingCycle;
  chargeLabel?: string;
  onClose: () => void;
  onPaid: (result: { planType: PlanId; entitlement: string }) => void;
}) {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const handleError = useCallback((message: string) => {
    setError(message);
    if (message) setPending(false);
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) onClose();
    }
    function onPaidEvent(event: Event) {
      const detail = (event as CustomEvent<{ planType?: PlanId; entitlement?: string }>).detail;
      if (detail?.planType) {
        setPending(false);
        onPaid({ planType: detail.planType, entitlement: detail.entitlement ?? "" });
      }
    }
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      const data = event.data as { source?: string; status?: string; planType?: PlanId; entitlement?: string };
      if (data?.source !== "nexus-checkout") return;
      if (data.status === "succeeded" && data.planType) {
        setPending(false);
        onPaid({ planType: data.planType, entitlement: data.entitlement ?? "" });
      }
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("message", onMessage);
    window.addEventListener("nexus-checkout-paid", onPaidEvent);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("message", onMessage);
      window.removeEventListener("nexus-checkout-paid", onPaidEvent);
    };
  }, [pending, onClose, onPaid]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/45 p-4 backdrop-blur-[2px] sm:items-center">
      <button type="button" className="absolute inset-0" aria-label={t("common.close")} onClick={onClose} disabled={pending} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
        className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,55,95,0.22)]"
      >
        <div className="flex min-h-[4.5rem] items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">{t("checkout.kicker")}</p>
            <h2 id="checkout-title" className="mt-1 text-lg font-semibold text-[#0b1f3a]">
              {t("checkout.title", { plan: plan.name })}
            </h2>
            <p className="mt-1 min-h-[1.25rem] text-sm text-slate-500">
              {t("checkout.lead", { amount: chargeLabel ?? t("pricing.offer") })}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-700"
            aria-label={t("common.close")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <label className="mt-5 block">
          <span className={fieldLabel}>{t("checkout.name")}</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 bg-[#f8fbff] px-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
            placeholder={t("checkout.namePh")}
            autoComplete="cc-name"
          />
        </label>

        <div className="mt-3">
          <SecureCardFields key={`${plan.id}-${cycle}`} planId={plan.id} cycle={cycle} holderName={name} onError={handleError} />
        </div>

        <button
          type="submit"
          form="nexus-checkout-form"
          disabled={pending}
          onClick={() => {
            setPending(true);
            setError("");
          }}
          className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#123056] text-sm font-medium text-white hover:bg-[#0f2744] disabled:opacity-50"
        >
          <Lock className="h-4 w-4" />
          {pending ? t("checkout.processing") : t("checkout.pay")}
        </button>
        <p className="mt-2 min-h-[1.25rem] text-sm text-rose-700">{error || "\u00a0"}</p>
        <p className="min-h-[2.5rem] text-[11px] leading-4 text-slate-400">{t("checkout.secure")}</p>
      </div>
    </div>
  );
}
