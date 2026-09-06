import { getSupabase } from "./supabase";
import {
  asPlanId,
  asSubscriptionStatus,
  toDbPlanEntitlement,
  toDbSubscriptionStatus,
  type PlanId,
  type SubscriptionStatus,
} from "./plans";
import { omitPayloadKey } from "./payload";
import type { CompanyRow } from "./database.types";
import { getCompanyId, type AppSupabase } from "./tenant";

export type CompanySubscription = {
  companyId: string;
  companyName: string;
  planType: PlanId;
  subscriptionStatus: SubscriptionStatus;
};

function missingColumn(message: string) {
  return message.match(/Could not find the '([^']+)' column/i)?.[1] ?? null;
}

export async function fetchCompanySubscription(client?: AppSupabase): Promise<CompanySubscription> {
  const supabase = client ?? getSupabase();
  const companyId = await getCompanyId(supabase);
  const { data, error } = await supabase.from("companies").select("*").eq("id", companyId).maybeSingle();

  if (error) throw new Error(error.message);

  const row = data as {
    id?: string;
    name?: string;
    plan_type?: string | null;
    subscription_status?: string | null;
  } | null;

  const planType = asPlanId(row?.plan_type);
  const status = asSubscriptionStatus(row?.subscription_status);

  return {
    companyId,
    companyName: row?.name ?? "Şirket",
    planType,
    subscriptionStatus: status,
  };
}

export async function updateCompanySubscription(planType: PlanId, client?: AppSupabase) {
  const supabase = client ?? getSupabase();
  const companyId = await getCompanyId(supabase);
  return activateCompanySubscription(companyId, planType, supabase);
}

export async function activateCompanySubscription(companyId: string, planType: PlanId, client: AppSupabase) {
  const subscriptionStatus: SubscriptionStatus = planType === "free" ? "free" : "active";
  let payload: Partial<CompanyRow> = {
    plan_type: toDbPlanEntitlement(planType),
    subscription_status: toDbSubscriptionStatus(subscriptionStatus),
  };

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const { data, error } = await client.from("companies").update(payload).eq("id", companyId).select("*").maybeSingle();
    if (!error) {
      const row = data as { id?: string; name?: string; plan_type?: string | null; subscription_status?: string | null } | null;
      return {
        companyId,
        companyName: row?.name ?? "Şirket",
        planType: asPlanId(row?.plan_type ?? planType),
        subscriptionStatus: asSubscriptionStatus(row?.subscription_status) === "active" || planType !== "free" ? ("active" as const) : ("free" as const),
      };
    }

    const column = missingColumn(error.message);
    if (!column || !(column in payload)) throw new Error(error.message);
    payload = omitPayloadKey(payload, column);
  }

  throw new Error("Abonelik güncellenemedi. companies tablosuna plan_type ve subscription_status ekleyin.");
}
