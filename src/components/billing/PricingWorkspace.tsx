"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { CheckoutModal } from "@/components/checkout/CheckoutModal";
import { DemoRequestModal } from "@/components/marketing/DemoRequestModal";
import {
  planChargeLabel,
  planMonthlyEquivalent,
  plans,
  type BillingCycle,
  type Plan,
  type PlanId,
} from "@/lib/plans";
import { HelpTitle } from "@/components/ui/HelpTip";
import { fetchCompanySubscription, updateCompanySubscription } from "@/lib/subscription";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase";

export function PricingWorkspace() {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [currentPlan, setCurrentPlan] = useState<PlanId>("free");
  const [authed, setAuthed] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState<Plan | null>(null);
  const [demoPlan, setDemoPlan] = useState<Plan | null>(null);
  const [demoOpen, setDemoOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadPlan() {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }
    try {
      const supabase = createBrowserSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setAuthed(Boolean(user));
      if (!user) {
        setLoading(false);
        return;
      }
      const sub = await fetchCompanySubscription();
      setCurrentPlan(sub.planType);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Paket bilgisi yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPlan();
  }, []);

  async function applyPlan(plan: Plan) {
    const updated = await updateCompanySubscription(plan.id);
    setCurrentPlan(updated.planType);
    setNotice(`${plan.name} paketi şirketinize tanımlandı.`);
    window.dispatchEvent(new CustomEvent("nexus-plan-updated", { detail: updated.planType }));
  }

  async function startPlan(plan: Plan) {
    setNotice("");
    setError("");
    if (plan.monthlyPrice == null) {
      setDemoPlan(plan);
      setDemoOpen(true);
      return;
    }
    setCheckoutPlan(plan);
  }

  function requestDemo(plan?: Plan) {
    setDemoPlan(plan ?? null);
    setDemoOpen(true);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">Üyelik</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            <HelpTitle hint="Aylık veya yıllık faturalamayı seçin; kartlar çalışan ölçeğine göre paketi gösterir.">
              Fiyatlandırma & Paketler
            </HelpTitle>
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Çalışan ölçeğinize göre paket seçin. Yıllık ödemede 2 ay ücretsiz uygulanır.
          </p>
        </div>

        <div className="inline-flex items-center rounded-2xl border border-sky-100 bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setCycle("monthly")}
            className={`rounded-xl px-4 py-2 text-sm font-medium ${
              cycle === "monthly" ? "bg-[#123056] text-white" : "text-slate-600 hover:bg-sky-50"
            }`}
          >
            Aylık
          </button>
          <button
            type="button"
            onClick={() => setCycle("yearly")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium ${
              cycle === "yearly" ? "bg-[#123056] text-white" : "text-slate-600 hover:bg-sky-50"
            }`}
          >
            Yıllık
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                cycle === "yearly" ? "bg-white/15 text-sky-100" : "bg-sky-100 text-sky-800"
              }`}
            >
              2 ay ücretsiz
            </span>
          </button>
        </div>
      </div>

      {loading ? <p className="text-sm text-slate-400">Paket durumu yükleniyor…</p> : null}
      {error ? (
        <p className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>
      ) : null}
      {notice ? (
        <p className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => {
          const current = authed && currentPlan === plan.id;
          return (
            <article
              key={plan.id}
              className={`flex flex-col rounded-2xl border bg-white p-6 ${
                plan.popular ? "border-slate-300" : "border-slate-200"
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                {plan.popular ? (
                  <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                    En popüler
                  </span>
                ) : null}
                {current ? (
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                    Mevcut paket
                  </span>
                ) : null}
              </div>
              <h2 className="mt-3 text-lg font-semibold text-slate-900">{plan.name}</h2>
              <p className="mt-1 text-xs font-medium text-slate-500">{plan.seatLabel}</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">{plan.description}</p>
              <p className="mt-6 flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
                <span className="text-3xl font-semibold tracking-tight text-slate-900">
                  {plan.monthlyPrice == null ? "Özel Teklif" : planChargeLabel(plan, cycle).split(" / ")[0]}
                </span>
                <span className="text-sm text-slate-400">
                  {plan.monthlyPrice == null
                    ? ""
                    : cycle === "yearly"
                      ? "/ yıl"
                      : "/ ay"}
                </span>
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-400">{planMonthlyEquivalent(plan, cycle)}</p>
              <ul className="mt-5 flex-1 space-y-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-slate-600">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-6 grid gap-2">
                {authed || plan.monthlyPrice == null ? (
                  <button
                    type="button"
                    onClick={() => void startPlan(plan)}
                    disabled={current && plan.monthlyPrice != null}
                    className={`w-full rounded-xl py-2.5 text-sm font-medium ${
                      current && plan.monthlyPrice != null
                        ? "cursor-default bg-slate-100 text-slate-500"
                        : plan.popular
                          ? "bg-slate-900 text-white hover:bg-slate-800"
                          : "bg-slate-50 text-slate-800 hover:bg-slate-100"
                    }`}
                  >
                    {current && plan.monthlyPrice != null ? "Bu paket aktif" : "Hemen Başla"}
                  </button>
                ) : (
                  <Link
                    href="/login?next=/fiyatlandirma"
                    className={`block w-full rounded-xl py-2.5 text-center text-sm font-medium ${
                      plan.popular
                        ? "bg-slate-900 text-white hover:bg-slate-800"
                        : "bg-slate-50 text-slate-800 hover:bg-slate-100"
                    }`}
                  >
                    Hemen Başla
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => requestDemo(plan)}
                  className="w-full rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Demo Talep Et
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <CheckoutModal
        open={Boolean(checkoutPlan)}
        plan={checkoutPlan}
        chargeLabel={checkoutPlan ? planChargeLabel(checkoutPlan, cycle) : undefined}
        onClose={() => setCheckoutPlan(null)}
        onConfirm={async () => {
          if (!checkoutPlan) return;
          await applyPlan(checkoutPlan);
          setCheckoutPlan(null);
        }}
      />

      <DemoRequestModal
        open={demoOpen}
        planName={demoPlan?.name}
        onClose={() => {
          setDemoOpen(false);
          setDemoPlan(null);
        }}
      />
    </div>
  );
}
