"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { CheckoutModal } from "@/components/checkout/CheckoutModal";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { btnPrimary, btnSecondary, cardSurfaceFlush } from "@/components/ui/surface";
import type { MessageKey } from "@/lib/i18n";
import { isPaidPlanId, planChargeLabel, plans, type PaidPlanId, type Plan } from "@/lib/plans";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase";

const CARDS: {
  id: PaidPlanId;
  nameKey: MessageKey;
  seatsKey: MessageKey;
  priceKey: MessageKey;
  descKey: MessageKey;
  features: MessageKey[];
  popular?: boolean;
}[] = [
  {
    id: "starter",
    nameKey: "landing.plan.kobi.name",
    seatsKey: "landing.plan.kobi.seats",
    priceKey: "landing.plan.kobi.price",
    descKey: "landing.plan.kobi.desc",
    features: ["landing.plan.kobi.f1", "landing.plan.kobi.f2", "landing.plan.kobi.f3"],
  },
  {
    id: "pro",
    nameKey: "landing.plan.pro.name",
    seatsKey: "landing.plan.pro.seats",
    priceKey: "landing.plan.pro.price",
    descKey: "landing.plan.pro.desc",
    features: ["landing.plan.pro.f1", "landing.plan.pro.f2", "landing.plan.pro.f3"],
    popular: true,
  },
  {
    id: "enterprise",
    nameKey: "landing.plan.ent.name",
    seatsKey: "landing.plan.ent.seats",
    priceKey: "landing.plan.ent.price",
    descKey: "landing.plan.ent.desc",
    features: ["landing.plan.ent.f1", "landing.plan.ent.f2", "landing.plan.ent.f3"],
  },
];

export function LandingPricing() {
  const { t } = useI18n();
  const router = useRouter();
  const [checkoutPlan, setCheckoutPlan] = useState<Plan | null>(null);
  const [notice, setNotice] = useState("");

  const handleSubscribe = useCallback(
    async (planId: string) => {
      if (!isPaidPlanId(planId)) return;
      const plan = plans.find((item) => item.id === planId) ?? null;
      if (!plan) return;

      if (!isSupabaseConfigured()) {
        router.push(`/login?next=${encodeURIComponent(`/fiyatlandirma?subscribe=${planId}`)}`);
        return;
      }

      const supabase = createBrowserSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push(`/login?next=${encodeURIComponent(`/fiyatlandirma?subscribe=${planId}`)}`);
        return;
      }
      setCheckoutPlan(plan);
    },
    [router],
  );

  return (
    <section id="pricing" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{t("landing.priceKicker")}</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#0b1f3a] sm:text-3xl">{t("landing.priceTitle")}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">{t("landing.priceLead")}</p>
      <p className="mt-3 min-h-[1.25rem] text-sm text-emerald-700">{notice}</p>

      <div className="mt-8 grid min-h-[28rem] items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map((plan) => (
          <article
            key={plan.id}
            className={`${cardSurfaceFlush} flex min-h-[26rem] flex-col p-6 sm:p-7 ${
              plan.popular ? "ring-1 ring-[#123056]/20" : ""
            }`}
          >
            <div className="min-h-7">
              {plan.popular ? (
                <span className="inline-flex rounded-full bg-[#123056] px-2.5 py-0.5 text-[11px] font-semibold text-white">
                  {t("pricing.popular")}
                </span>
              ) : (
                <span className="invisible text-[11px]">.</span>
              )}
            </div>
            <h3 className="mt-3 text-lg font-semibold text-[#0b1f3a]">{t(plan.nameKey)}</h3>
            <p className="mt-0.5 text-xs text-slate-500">{t(plan.seatsKey)}</p>
            <p className="mt-4 text-3xl font-semibold tracking-tight text-[#0b1f3a]">{t(plan.priceKey)}</p>
            <p className="mt-2 min-h-[3.5rem] text-sm leading-6 text-slate-500">{t(plan.descKey)}</p>
            <ul className="mt-5 flex-1 space-y-2.5">
              {plan.features.map((key) => (
                <li key={key} className="flex items-start gap-2 text-sm text-slate-600">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" strokeWidth={2.5} />
                  <span>{t(key)}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => void handleSubscribe(plan.id)}
              className={`mt-6 h-11 w-full ${plan.popular ? btnPrimary : btnSecondary}`}
            >
              {plan.id === "starter" ? t("pricing.start") : t("pricing.subscribe")}
            </button>
          </article>
        ))}
      </div>

      <CheckoutModal
        open={Boolean(checkoutPlan)}
        plan={checkoutPlan}
        cycle="monthly"
        chargeLabel={checkoutPlan ? planChargeLabel(checkoutPlan, "monthly") : undefined}
        onClose={() => setCheckoutPlan(null)}
        onPaid={({ entitlement }) => {
          setCheckoutPlan(null);
          setNotice(`${t("checkout.success")} (${entitlement})`);
        }}
      />
    </section>
  );
}
