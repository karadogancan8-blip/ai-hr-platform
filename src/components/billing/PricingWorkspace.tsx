"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Check } from "lucide-react";
import { CheckoutModal } from "@/components/checkout/CheckoutModal";
import { DemoRequestModal } from "@/components/marketing/DemoRequestModal";
import { EnterpriseQuoteModal } from "@/components/billing/EnterpriseQuoteModal";
import {
  PLAN_MULTILINGUAL_FEATURE,
  isPaidPlanId,
  planChargeLabel,
  planMonthlyEquivalent,
  plans,
  type BillingCycle,
  type Plan,
  type PlanId,
} from "@/lib/plans";
import { HelpTitle } from "@/components/ui/HelpTip";
import { cardSurfaceFlush } from "@/components/ui/surface";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { fetchCompanySubscription } from "@/lib/subscription";
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
      <span className="text-start">{text}</span>
    </li>
  );
}

export function PricingWorkspace({ variant = "public" }: { variant?: "public" | "account" }) {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const account = variant === "account";
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [currentPlan, setCurrentPlan] = useState<PlanId>("free");
  const [authed, setAuthed] = useState(account);
  const [checkoutPlan, setCheckoutPlan] = useState<Plan | null>(null);
  const [demoPlan, setDemoPlan] = useState<Plan | null>(null);
  const [demoOpen, setDemoOpen] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const subscribeConsumed = useRef(false);

  const handleSubscribe = useCallback(
    async (planId: string) => {
      setNotice("");
      setError("");
      if (!isPaidPlanId(planId)) return;
      const plan = plans.find((item) => item.id === planId);
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
        const next = account ? "/ayarlar/abonelik" : "/fiyatlandirma";
        router.push(`/login?next=${encodeURIComponent(`${next}?subscribe=${planId}`)}`);
        return;
      }
      setCheckoutPlan(plan);
    },
    [account, router],
  );

  async function loadPlan() {
    if (!isSupabaseConfigured()) {
      setAuthed(false);
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
      setError(err instanceof Error ? err.message : t("checkout.error"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPlan();
  }, [variant]);

  useEffect(() => {
    const requested = searchParams.get("subscribe");
    if (!requested || loading || subscribeConsumed.current) return;
    subscribeConsumed.current = true;
    void handleSubscribe(requested);
  }, [searchParams, loading, handleSubscribe]);

  function requestDemo(plan?: Plan) {
    setDemoPlan(plan ?? null);
    setDemoOpen(true);
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            {account ? t("settings.billingKicker") : t("pricing.kicker")}
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
            <HelpTitle hint={t("pricing.hint")}>
              {account ? t("settings.billingTitle") : t("pricing.title")}
            </HelpTitle>
          </h1>
          <p className="mt-2 text-sm leading-7 text-slate-500">
            {account ? t("settings.billingLead") : t("pricing.description")}
          </p>
        </div>

        <div className="inline-flex h-11 items-center self-start rounded-xl border border-slate-200 bg-white p-0.5">
          <button
            type="button"
            onClick={() => setCycle("monthly")}
            className={`h-9 rounded-lg px-3.5 text-sm font-medium ${
              cycle === "monthly" ? "bg-[#123056] text-white" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            {t("pricing.monthly")}
          </button>
          <button
            type="button"
            onClick={() => setCycle("yearly")}
            className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-sm font-medium ${
              cycle === "yearly" ? "bg-[#123056] text-white" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            {t("pricing.yearly")}
            <span
              className={`rounded-md px-1.5 py-px text-[10px] font-medium ${
                cycle === "yearly" ? "bg-white/15 text-sky-100" : "bg-slate-100 text-slate-600"
              }`}
            >
              {t("pricing.yearlyBadge")}
            </span>
          </button>
        </div>
      </div>

      <p className="min-h-[1.5rem] text-sm text-slate-400">{loading ? t("common.loading") : "\u00a0"}</p>
      <p className={`min-h-[3rem] ${error ? "rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-800" : ""}`}>
        {error || "\u00a0"}
      </p>
      <p className={`min-h-[3rem] ${notice ? "rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800" : ""}`}>
        {notice || "\u00a0"}
      </p>

      <div className="grid min-h-[640px] items-stretch gap-5 lg:grid-cols-3">
        {plans.map((plan) => {
          const current = authed && currentPlan === plan.id;
          const highlights = plan.highlights ?? [];
          return (
            <article
              key={plan.id}
              className={`flex h-full min-h-[36rem] flex-col ${cardSurfaceFlush} px-7 py-8 ${
                plan.popular ? "ring-1 ring-slate-300" : ""
              }`}
            >
              <div className="min-h-[1.5rem]">
                {plan.popular ? (
                  <span className="inline-flex rounded-md bg-[#123056] px-2 py-0.5 text-[11px] font-medium text-white">
                    {t("pricing.popular")}
                  </span>
                ) : current ? (
                  <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                    {t("pricing.current")}
                  </span>
                ) : (
                  <span className="invisible text-[11px]">.</span>
                )}
              </div>

              <h2 className="mt-4 text-[17px] font-semibold tracking-tight text-slate-900">{plan.name}</h2>
              <p className="mt-0.5 text-xs text-slate-500">{plan.seatLabel}</p>
              <p className="mt-3 min-h-[3rem] text-sm leading-6 text-slate-500">{plan.description}</p>

              <p className="mt-6 flex min-h-[2.5rem] flex-wrap items-baseline gap-x-1.5">
                <span className="text-[28px] font-semibold tracking-tight text-slate-900">
                  {plan.monthlyPrice == null ? t("pricing.offer") : planChargeLabel(plan, cycle).split(" / ")[0]}
                </span>
                {plan.monthlyPrice != null ? (
                  <span className="text-sm text-slate-400">{cycle === "yearly" ? "/ yıl" : "/ ay"}</span>
                ) : null}
              </p>
              <p className="mt-1 min-h-[2.5rem] text-xs leading-5 text-slate-400">{planMonthlyEquivalent(plan, cycle)}</p>

              {current && plan.popular ? (
                <p className="mt-2 min-h-[1rem] text-[11px] font-medium text-slate-500">{t("pricing.current")}</p>
              ) : (
                <p className="mt-2 min-h-[1rem]" aria-hidden />
              )}

              <ul className="mt-6 flex-1 space-y-2.5">
                {highlights.map((feature) => (
                  <FeatureRow
                    key={feature}
                    text={feature === PLAN_MULTILINGUAL_FEATURE ? t("plan.multilang") : feature}
                    emphasis
                  />
                ))}
                {plan.features.map((feature) => (
                  <FeatureRow
                    key={feature}
                    text={feature === PLAN_MULTILINGUAL_FEATURE ? t("plan.multilang") : feature}
                  />
                ))}
              </ul>

              <div className="mt-7 grid gap-2">
                <button
                  type="button"
                  onClick={() => void handleSubscribe(plan.id)}
                  disabled={current}
                  className={`h-11 w-full rounded-xl text-sm font-medium ${
                    current
                      ? "cursor-default bg-slate-100 text-slate-500"
                      : plan.popular
                        ? "bg-[#123056] text-white hover:bg-[#0f2744]"
                        : "bg-slate-50 text-slate-800 hover:bg-slate-100"
                  }`}
                >
                  {current ? t("pricing.active") : plan.id === "starter" ? t("pricing.start") : t("pricing.subscribe")}
                </button>
                <button
                  type="button"
                  onClick={() => (plan.id === "enterprise" ? setQuoteOpen(true) : requestDemo(plan))}
                  className="h-11 w-full rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  {plan.id === "enterprise" ? t("pricing.offer") : t("pricing.demo")}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <CheckoutModal
        open={Boolean(checkoutPlan)}
        plan={checkoutPlan}
        cycle={cycle}
        chargeLabel={checkoutPlan ? planChargeLabel(checkoutPlan, cycle) : undefined}
        onClose={() => setCheckoutPlan(null)}
        onPaid={({ planType, entitlement }) => {
          setCurrentPlan(planType);
          setCheckoutPlan(null);
          setNotice(`${t("checkout.success")} (${entitlement})`);
          window.dispatchEvent(new CustomEvent("nexus-plan-updated", { detail: planType }));
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
      <EnterpriseQuoteModal open={quoteOpen} onClose={() => setQuoteOpen(false)} />

      {!account ? (
        <p className="text-center text-sm text-slate-400">
          <Link href="/login" className="font-medium text-slate-600 hover:text-slate-900">
            {t("pricing.login")}
          </Link>
        </p>
      ) : null}
    </div>
  );
}
