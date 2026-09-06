import { NextResponse } from "next/server";
import { allowSimulatedCheckout, isStripeConfigured, planByCheckoutId, stripeGet } from "@/lib/billing";
import { isPaidPlanId, type PlanId } from "@/lib/plans";
import { createServerSupabase } from "@/lib/supabase/server";
import { activateCompanySubscription } from "@/lib/subscription";
import { getCompanyId } from "@/lib/tenant";

export const maxDuration = 20;

function planFromEntitlement(value?: string | null): PlanId | null {
  const plan = planByCheckoutId(value ?? "");
  return plan && isPaidPlanId(plan.id) ? plan.id : null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      planId?: string;
      paymentIntentId?: string;
      setupIntentId?: string;
      simulate?: boolean;
    };

    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
    }

    let planId = planFromEntitlement(body.planId);

    if (body.simulate) {
      if (isStripeConfigured() || !allowSimulatedCheckout()) {
        return NextResponse.json({ error: "Simüle ödeme canlı Stripe ortamında kapalı." }, { status: 400 });
      }
      if (!planId) return NextResponse.json({ error: "Geçersiz paket." }, { status: 400 });
      const sub = await activateCompanySubscription(await getCompanyId(supabase), planId, supabase);
      return NextResponse.json({
        ok: true,
        planType: sub.planType,
        subscriptionStatus: "ACTIVE",
        entitlement: planId === "pro" ? "PRO" : planId === "enterprise" ? "ENTERPRISE" : "STARTER",
      });
    }

    if (!isStripeConfigured()) {
      return NextResponse.json({ error: "Stripe yapılandırılmamış." }, { status: 503 });
    }

    const objectPath = body.paymentIntentId
      ? `payment_intents/${body.paymentIntentId}`
      : body.setupIntentId
        ? `setup_intents/${body.setupIntentId}`
        : "";
    if (!objectPath) {
      return NextResponse.json({ error: "Ödeme kimliği eksik." }, { status: 400 });
    }

    const intent = (await stripeGet(objectPath)) as {
      status?: string;
      metadata?: Record<string, string>;
    };

    if (intent.status !== "succeeded") {
      return NextResponse.json({ error: "Ödeme henüz tamamlanmadı." }, { status: 409 });
    }

    if (intent.metadata?.user_id && intent.metadata.user_id !== user.id) {
      return NextResponse.json({ error: "Ödeme bu oturuma ait değil." }, { status: 403 });
    }

    planId = planFromEntitlement(intent.metadata?.plan_id) ?? planId;
    if (!planId) {
      return NextResponse.json({ error: "Paket bilgisi yok." }, { status: 400 });
    }

    const companyId = await getCompanyId(supabase);
    if (intent.metadata?.company_id && intent.metadata.company_id !== companyId) {
      return NextResponse.json({ error: "Şirket eşleşmedi." }, { status: 403 });
    }

    const sub = await activateCompanySubscription(companyId, planId, supabase);
    return NextResponse.json({
      ok: true,
      planType: sub.planType,
      subscriptionStatus: "ACTIVE",
      entitlement: intent.metadata?.entitlement ?? (planId === "pro" ? "PRO" : planId === "enterprise" ? "ENTERPRISE" : "STARTER"),
    });
  } catch (error) {
    console.error("[billing/confirm]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Abonelik güncellenemedi." },
      { status: 500 },
    );
  }
}
