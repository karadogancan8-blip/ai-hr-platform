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

export type LocalPaymentProvider = "iyzico";

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

export function entitlementLabel(planId: PaidPlanId) {
  if (planId === "pro") return "PRO";
  if (planId === "enterprise") return "ENTERPRISE";
  return "STARTER";
}
