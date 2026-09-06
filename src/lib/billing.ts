import {
  asPlanId,
  isPaidPlanId,
  plans,
  toDbPlanEntitlement,
  yearlyTotal,
  type BillingCycle,
  type PaidPlanId,
  type Plan,
} from "@/lib/plans";

export type CheckoutPlanId = PaidPlanId;

export function stripeSecretKey() {
  return process.env.STRIPE_SECRET_KEY?.trim() || "";
}

export function stripePublishableKey() {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() || "";
}

export function stripeWebhookSecret() {
  return process.env.STRIPE_WEBHOOK_SECRET?.trim() || "";
}

export function isStripeConfigured() {
  return Boolean(stripeSecretKey() && stripePublishableKey());
}

export function allowSimulatedCheckout() {
  return process.env.BILLING_ALLOW_SIMULATED_CHECKOUT === "true" || process.env.NODE_ENV !== "production";
}

export function planByCheckoutId(planId: string): Plan | null {
  const id = asPlanId(planId);
  if (!isPaidPlanId(id)) return null;
  return plans.find((plan) => plan.id === id) ?? null;
}

export function checkoutAmountKurus(plan: Plan, cycle: BillingCycle) {
  if (plan.monthlyPrice == null) return 0;
  const tryAmount = cycle === "yearly" ? yearlyTotal(plan.monthlyPrice) : plan.monthlyPrice;
  return Math.round(tryAmount * 100);
}

export function entitlementForCheckout(planId: CheckoutPlanId) {
  return toDbPlanEntitlement(planId);
}

export async function stripeFormRequest(path: string, params: Record<string, string>) {
  const secret = stripeSecretKey();
  if (!secret) throw new Error("STRIPE_SECRET_KEY tanımlı değil.");
  const body = new URLSearchParams(params);
  const response = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${secret}`,
      "content-type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const json = (await response.json()) as { error?: { message?: string }; id?: string; [key: string]: unknown };
  if (!response.ok) {
    throw new Error(json.error?.message || `Stripe ${response.status}`);
  }
  return json;
}

export async function stripeGet(path: string) {
  const secret = stripeSecretKey();
  if (!secret) throw new Error("STRIPE_SECRET_KEY tanımlı değil.");
  const response = await fetch(`https://api.stripe.com/v1/${path}`, {
    headers: { authorization: `Bearer ${secret}` },
  });
  const json = (await response.json()) as { error?: { message?: string }; [key: string]: unknown };
  if (!response.ok) {
    throw new Error(json.error?.message || `Stripe ${response.status}`);
  }
  return json;
}
