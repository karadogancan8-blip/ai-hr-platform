import { NextResponse } from "next/server";
import { isPaidPlanId, type PlanId } from "@/lib/plans";
import { stripeWebhookSecret } from "@/lib/billing";
import { verifyStripeSignature } from "@/lib/stripe-webhook";
import { createServiceSupabase } from "@/lib/supabase/admin";
import { activateCompanySubscription } from "@/lib/subscription";

export const maxDuration = 20;

function planFromMetadata(metadata?: Record<string, string>): PlanId | null {
  const raw = metadata?.plan_id ?? metadata?.entitlement ?? "";
  const lower = raw.toLowerCase();
  if (lower === "pro" || raw === "PRO") return "pro";
  if (lower === "enterprise" || raw === "ENTERPRISE") return "enterprise";
  if (lower === "starter" || raw === "STARTER") return "starter";
  return isPaidPlanId(lower) ? lower : null;
}

export async function POST(request: Request) {
  const secret = stripeWebhookSecret();
  const raw = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!secret || !verifyStripeSignature(raw, signature, secret)) {
    return NextResponse.json({ error: "Webhook imzası geçersiz." }, { status: 400 });
  }

  let event: { type?: string; data?: { object?: Record<string, unknown> } };
  try {
    event = JSON.parse(raw) as typeof event;
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON." }, { status: 400 });
  }

  const type = event.type ?? "";
  if (type !== "payment_intent.succeeded" && type !== "setup_intent.succeeded") {
    return NextResponse.json({ received: true });
  }

  const object = event.data?.object ?? {};
  const metadata = (object.metadata ?? {}) as Record<string, string>;
  const companyId = metadata.company_id;
  const planId = planFromMetadata(metadata);

  if (!companyId || !planId) {
    return NextResponse.json({ received: true, skipped: true });
  }

  const admin = createServiceSupabase();
  if (!admin) {
    console.error("[billing/webhook] SUPABASE_SERVICE_ROLE_KEY eksik");
    return NextResponse.json({ error: "Servis anahtarı yok." }, { status: 500 });
  }

  await activateCompanySubscription(companyId, planId, admin);
  return NextResponse.json({ received: true, subscriptionStatus: "ACTIVE", plan: planId.toUpperCase() });
}
