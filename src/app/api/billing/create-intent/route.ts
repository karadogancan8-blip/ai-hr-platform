import { NextResponse } from "next/server";
import { checkoutAmountKurus, entitlementLabel, planByCheckoutId } from "@/lib/billing";
import { issueLocalCheckoutToken } from "@/lib/local-payment";
import { isPaidPlanId } from "@/lib/plans";
import { createServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getCompanyId } from "@/lib/tenant";

export const maxDuration = 20;

export async function POST(request: Request) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
    }

    const body = (await request.json()) as { planId?: string; cycle?: string };
    const plan = planByCheckoutId(body.planId ?? "");
    if (!plan || !isPaidPlanId(plan.id)) {
      return NextResponse.json({ error: "Geçersiz paket." }, { status: 400 });
    }

    const cycle = body.cycle === "yearly" ? "yearly" : "monthly";
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
    }

    const companyId = await getCompanyId(supabase);
    const amount = checkoutAmountKurus(plan, cycle);
    const token = issueLocalCheckoutToken({
      planId: plan.id,
      companyId,
      userId: user.id,
      amount,
      cycle,
    });

    return NextResponse.json({
      mode: "iyzico",
      provider: "iyzico",
      token,
      amount,
      entitlement: entitlementLabel(plan.id),
      companyId,
    });
  } catch (error) {
    console.error("[billing/create-intent]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Ödeme oturumu açılamadı." },
      { status: 500 },
    );
  }
}
