"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { CheckoutModal } from "@/components/checkout/CheckoutModal";
import { planBadgeLabel, plans, type Plan, type PlanId } from "@/lib/plans";
import { fetchCompanySubscription, updateCompanySubscription } from "@/lib/subscription";
import { isSupabaseConfigured } from "@/lib/supabase";

export function PricingWorkspace() {
  const [currentPlan, setCurrentPlan] = useState<PlanId>("free");
  const [checkoutPlan, setCheckoutPlan] = useState<Plan | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadPlan() {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }
    try {
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

  async function selectPlan(plan: Plan) {
    setNotice("");
    setError("");
    if (plan.id === "free") {
      try {
        await applyPlan(plan);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Paket güncellenemedi.");
      }
      return;
    }
    setCheckoutPlan(plan);
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">Üyelik</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#0b1f3a]">Fiyatlandırma & Paketler</h1>
        <p className="mt-1 text-sm text-slate-500">
          Şirketinizin aboneliğini yönetin. Ödeme akışı Stripe / iyzico için hazır şablondur.
        </p>
      </div>

      {loading ? <p className="text-sm text-slate-400">Paket durumu yükleniyor…</p> : null}
      {error ? (
        <p className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>
      ) : null}
      {notice ? (
        <p className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</p>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-3">
        {plans.map((plan) => {
          const current = currentPlan === plan.id;
          return (
            <article
              key={plan.id}
              className={`relative flex flex-col rounded-3xl border bg-white p-6 shadow-[0_8px_30px_rgba(15,55,95,0.06)] ${
                plan.popular ? "border-sky-400 ring-4 ring-sky-100" : "border-sky-100"
              }`}
            >
              {plan.popular ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#123056] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                  En popüler
                </span>
              ) : null}
              <h2 className="text-lg font-semibold text-[#0b1f3a]">{plan.name}</h2>
              <p className="mt-1 text-sm text-slate-500">{plan.description}</p>
              <p className="mt-5 flex items-end gap-1">
                <span className="text-3xl font-semibold tracking-tight text-[#0b1f3a]">{plan.priceLabel}</span>
                <span className="mb-1 text-sm text-slate-400">{plan.priceHint}</span>
              </p>
              <ul className="mt-5 flex-1 space-y-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-slate-600">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => void selectPlan(plan)}
                disabled={current}
                className={`mt-6 w-full rounded-xl py-2.5 text-sm font-medium ${
                  current
                    ? "bg-slate-100 text-slate-500"
                    : plan.popular
                      ? "bg-[#123056] text-white hover:bg-[#0f2744]"
                      : "bg-sky-50 text-sky-900 hover:bg-sky-100"
                }`}
              >
                {current ? `${planBadgeLabel[plan.id]} aktif` : plan.cta}
              </button>
            </article>
          );
        })}
      </div>

      <CheckoutModal
        open={Boolean(checkoutPlan)}
        plan={checkoutPlan}
        onClose={() => setCheckoutPlan(null)}
        onConfirm={async () => {
          if (!checkoutPlan) return;
          await applyPlan(checkoutPlan);
          setCheckoutPlan(null);
        }}
      />
    </div>
  );
}
