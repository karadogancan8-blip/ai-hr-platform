import { NextResponse } from "next/server";
import { entitlementLabel } from "@/lib/billing";
import { readLocalCheckoutToken } from "@/lib/local-payment";
import { createServiceSupabase } from "@/lib/supabase/admin";
import { activateCompanySubscription } from "@/lib/subscription";

export const maxDuration = 20;

/** Yerel İyzico / PayTR bildirim uç noktası. Geçersiz token uygulama hatası üretmez. */
export async function POST(request: Request) {
  const raw = await request.text();
  let token = "";
  try {
    const json = JSON.parse(raw) as { token?: string; merchant_oid?: string };
    token = json.token || json.merchant_oid || "";
  } catch {
    const params = new URLSearchParams(raw);
    token = params.get("token") || params.get("merchant_oid") || "";
  }

  const session = readLocalCheckoutToken(token);
  if (!session) {
    return NextResponse.json({ received: true, skipped: true, provider: "iyzico" });
  }

  const admin = createServiceSupabase();
  if (!admin) {
    return NextResponse.json({ received: true, skipped: true, reason: "no-admin" });
  }

  await activateCompanySubscription(session.companyId, session.planId, admin);
  return NextResponse.json({
    received: true,
    provider: "iyzico",
    subscriptionStatus: "ACTIVE",
    plan: entitlementLabel(session.planId),
  });
}
