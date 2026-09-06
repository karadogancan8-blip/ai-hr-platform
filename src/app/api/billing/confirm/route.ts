import { NextResponse } from "next/server";
import { entitlementLabel } from "@/lib/billing";
import { readLocalCheckoutToken } from "@/lib/local-payment";
import { createServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { activateCompanySubscription } from "@/lib/subscription";
import { getCompanyId } from "@/lib/tenant";

export const maxDuration = 20;

export async function POST(request: Request) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
    }

    const body = (await request.json()) as { token?: string };
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
    }

    const session = readLocalCheckoutToken(body.token);
    if (!session) {
      return NextResponse.json({ error: "Ödeme oturumu geçersiz veya süresi doldu." }, { status: 400 });
    }
    if (session.userId !== user.id) {
      return NextResponse.json({ error: "Ödeme bu oturuma ait değil." }, { status: 403 });
    }

    const companyId = await getCompanyId(supabase);
    if (session.companyId !== companyId) {
      return NextResponse.json({ error: "Şirket eşleşmedi." }, { status: 403 });
    }

    const sub = await activateCompanySubscription(companyId, session.planId, supabase);
    return NextResponse.json({
      ok: true,
      provider: "iyzico",
      planType: sub.planType,
      subscriptionStatus: "ACTIVE",
      entitlement: entitlementLabel(session.planId),
    });
  } catch (error) {
    console.error("[billing/confirm]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Abonelik güncellenemedi." },
      { status: 500 },
    );
  }
}
