import { createHmac, timingSafeEqual } from "crypto";
import type { BillingCycle, PaidPlanId } from "@/lib/plans";

export type LocalCheckoutToken = {
  provider: "iyzico";
  planId: PaidPlanId;
  companyId: string;
  userId: string;
  amount: number;
  cycle: BillingCycle;
  exp: number;
};

function hmacSecret() {
  return process.env.BILLING_HMAC_SECRET?.trim() || "nexus-local-iyzico";
}

function sign(payload: string) {
  return createHmac("sha256", hmacSecret()).update(payload).digest("hex");
}

export function issueLocalCheckoutToken(input: Omit<LocalCheckoutToken, "provider" | "exp">) {
  const body: LocalCheckoutToken = {
    ...input,
    provider: "iyzico",
    exp: Date.now() + 15 * 60 * 1000,
  };
  const payload = Buffer.from(JSON.stringify(body), "utf8").toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function readLocalCheckoutToken(token: string | null | undefined): LocalCheckoutToken | null {
  if (!token || !token.includes(".")) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as LocalCheckoutToken;
    if (parsed.provider !== "iyzico") return null;
    if (typeof parsed.exp !== "number" || parsed.exp < Date.now()) return null;
    if (!parsed.planId || !parsed.companyId || !parsed.userId) return null;
    return parsed;
  } catch {
    return null;
  }
}
