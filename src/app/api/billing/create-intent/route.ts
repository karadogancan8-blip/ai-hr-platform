import { NextResponse } from "next/server";
import {
  allowSimulatedCheckout,
  checkoutAmountKurus,
  isStripeConfigured,
  planByCheckoutId,
  stripeFormRequest,
  stripePublishableKey,
} from "@/lib/billing";
import { isPaidPlanId } from "@/lib/plans";
import { createServerSupabase } from "@/lib/supabase/server";
import { getCompanyId } from "@/lib/tenant";

export const maxDuration = 20;

export async function POST(request: Request) {
  try {
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
    const entitlement = plan.id === "pro" ? "PRO" : plan.id === "enterprise" ? "ENTERPRISE" : "STARTER";

    if (!isStripeConfigured()) {
      if (!allowSimulatedCheckout()) {
        return NextResponse.json(
          { error: "Stripe yapılandırılmamış. STRIPE_SECRET_KEY ve NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ekleyin." },
          { status: 503 },
        );
      }
      return NextResponse.json({
        mode: "simulate",
        publishableKey: "",
        clientSecret: "",
        amount,
        entitlement,
        companyId,
      });
    }

    const metadata = {
      "metadata[company_id]": companyId,
      "metadata[plan_id]": plan.id,
      "metadata[entitlement]": entitlement,
      "metadata[cycle]": cycle,
      "metadata[user_id]": user.id,
    };

    if (amount <= 0) {
      const setup = await stripeFormRequest("setup_intents", {
        usage: "off_session",
        "automatic_payment_methods[enabled]": "true",
        ...metadata,
      });
      return NextResponse.json({
        mode: "setup",
        publishableKey: stripePublishableKey(),
        clientSecret: String(setup.client_secret ?? ""),
        amount: 0,
        entitlement,
        companyId,
      });
    }

    const intent = await stripeFormRequest("payment_intents", {
      amount: String(amount),
      currency: "try",
      "automatic_payment_methods[enabled]": "true",
      ...metadata,
    });

    return NextResponse.json({
      mode: "payment",
      publishableKey: stripePublishableKey(),
      clientSecret: String(intent.client_secret ?? ""),
      amount,
      entitlement,
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
