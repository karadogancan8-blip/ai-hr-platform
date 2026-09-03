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

function FeatureRow({ text, emphasis }: { text: string; emphasis?: boolean }) {
  return (
    <li className={`flex items-start gap-2.5 text-[13px] leading-5 ${emphasis ? "font-medium text-slate-800" : "text-slate-600"}`}>
      <span
        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
          emphasis ? "bg-sky-50 text-sky-800" : "bg-slate-50 text-slate-400"
        }`}
      >
        <Check className="h-3 w-3" strokeWidth={2.5} />
      </span>
      <span>{text}</span>
    </li>
  );
}

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
    setNotice(`${plan.name} paketi şirketiniz için tanımlandı.`);
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
    <div className="space-y-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-800">Üyelik</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
            <HelpTitle hint="Aylık veya yıllık faturalandırmayı seçin. Kartlar, çalışan ölçeğinize uygun paketi gösterir.">
              Fiyatlandırma ve paketler
            </HelpTitle>
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Çalışan ölçeğinize uygun paketi seçin. Yıllık ödemede iki ay ücretsiz uygulanır.
          </p>
        </div>

        <div className="inline-flex items-center self-start rounded-xl border border-slate-200 bg-white p-0.5">
          <button
            type="button"
            onClick={() => setCycle("monthly")}
            className={`rounded-lg px-3.5 py-1.5 text-sm font-medium ${
              cycle === "monthly" ? "bg-[#123056] text-white" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            Aylık
          </button>
          <button
            type="button"
            onClick={() => setCycle("yearly")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-medium ${
              cycle === "yearly" ? "bg-[#123056] text-white" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            Yıllık
            <span
              className={`rounded-md px-1.5 py-px text-[10px] font-medium ${
                cycle === "yearly" ? "bg-white/15 text-sky-100" : "bg-slate-100 text-slate-600"
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

      <div className="grid items-stretch gap-5 lg:grid-cols-3">
        {plans.map((plan) => {
          const current = authed && currentPlan === plan.id;
          const highlights = plan.highlights ?? [];
          return (
            <article
              key={plan.id}
              className={`flex flex-col rounded-2xl border bg-white px-7 py-7 ${
                plan.popular
                  ? "border-[#123056] shadow-[0_18px_40px_-24px_rgba(18,48,86,0.55)] ring-1 ring-[#123056]/10"
                  : "border-slate-200"
              }`}
            >
              <div className="min-h-[1.5rem]">
                {plan.popular ? (
                  <span className="inline-flex rounded-md bg-[#123056] px-2 py-0.5 text-[11px] font-medium text-white">
                    En Çok Tercih Edilen
                  </span>
                ) : current ? (
                  <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                    Mevcut paket
                  </span>
                ) : (
                  <span className="invisible text-[11px]">.</span>
                )}
              </div>

              <h2 className="mt-4 text-[17px] font-semibold tracking-tight text-slate-900">{plan.name}</h2>
              <p className="mt-0.5 text-xs text-slate-500">{plan.seatLabel}</p>
              <p className="mt-3 text-sm leading-6 text-slate-500">{plan.description}</p>

              <p className="mt-6 flex flex-wrap items-baseline gap-x-1.5">
                <span className="text-[28px] font-semibold tracking-tight text-slate-900">
                  {plan.monthlyPrice == null ? "Özel teklif" : planChargeLabel(plan, cycle).split(" / ")[0]}
                </span>
                {plan.monthlyPrice != null ? (
                  <span className="text-sm text-slate-400">{cycle === "yearly" ? "/ yıl" : "/ ay"}</span>
                ) : null}
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-400">{planMonthlyEquivalent(plan, cycle)}</p>

              {current && plan.popular ? (
                <p className="mt-2 text-[11px] font-medium text-slate-500">Mevcut paket</p>
              ) : null}

              <ul className="mt-6 flex-1 space-y-2.5">
                {highlights.map((feature) => (
                  <FeatureRow key={feature} text={feature} emphasis />
                ))}
                {plan.features.map((feature) => (
                  <FeatureRow key={feature} text={feature} />
                ))}
              </ul>

              <div className="mt-7 grid gap-2">
                {authed || plan.monthlyPrice == null ? (
                  <button
                    type="button"
                    onClick={() => void startPlan(plan)}
                    disabled={current && plan.monthlyPrice != null}
                    className={`w-full rounded-xl py-2.5 text-sm font-medium ${
                      current && plan.monthlyPrice != null
                        ? "cursor-default bg-slate-100 text-slate-500"
                        : plan.popular
                          ? "bg-[#123056] text-white hover:bg-[#0f2744]"
                          : "bg-slate-50 text-slate-800 hover:bg-slate-100"
                    }`}
                  >
                    {current && plan.monthlyPrice != null
                      ? "Bu paket aktif"
                      : plan.monthlyPrice == null
                        ? "Teklif alın"
                        : "Hemen başla"}
                  </button>
                ) : (
                  <Link
                    href="/login?next=/fiyatlandirma"
                    className={`block w-full rounded-xl py-2.5 text-center text-sm font-medium ${
                      plan.popular
                        ? "bg-[#123056] text-white hover:bg-[#0f2744]"
                        : "bg-slate-50 text-slate-800 hover:bg-slate-100"
                    }`}
                  >
                    Hemen başla
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => requestDemo(plan)}
                  className="w-full rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Demo talep et
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
