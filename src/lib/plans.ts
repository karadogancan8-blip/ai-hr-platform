export type PlanId = "free" | "pro" | "enterprise";
export type SubscriptionStatus = "free" | "active";
export type BillingCycle = "monthly" | "yearly";

export type Plan = {
  id: PlanId;
  name: string;
  seatLabel: string;
  monthlyPrice: number | null;
  description: string;
  features: string[];
  popular?: boolean;
};

export const plans: Plan[] = [
  {
    id: "free",
    name: "Başlangıç",
    seatLabel: "1–50 Çalışan",
    monthlyPrice: 1490,
    description: "Küçük ve orta ölçekli ekipler için çekirdek AI İK operasyonu.",
    features: [
      "AI destekli CV analizi ve işe alım",
      "Mevzuat asistanı (temel kota)",
      "Onboarding şablonları",
      "KVKK uyumlu veri saklama",
    ],
  },
  {
    id: "pro",
    name: "Kurumsal",
    seatLabel: "50–250 Çalışan",
    monthlyPrice: 3990,
    description: "Büyüyen organizasyonlar için tam platform ve öncelikli kapasite.",
    features: [
      "Sınırsız CV analizi ve mülakat rehberi",
      "Mevzuat botu + performans yönetimi",
      "White-label marka kimliği",
      "Çoklu yönetici ve denetim izi",
    ],
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    seatLabel: "250+ Çalışan",
    monthlyPrice: null,
    description: "Holding ve büyük ölçek için özel sözleşme, SSO ve SLA.",
    features: [
      "Özel fiyatlandırma ve hesap yöneticisi",
      "SSO, özel entegrasyonlar ve SLA",
      "Özel model / veri bölgesi seçenekleri",
      "Kurumsal onboarding ve eğitim",
    ],
  },
];

export const planBadgeLabel: Record<PlanId, string> = {
  free: "Başlangıç Plan",
  pro: "Kurumsal Plan",
  enterprise: "Enterprise Plan",
};

export function formatTry(amount: number) {
  return `₺${amount.toLocaleString("tr-TR")}`;
}

/** Yıllık faturalamada 2 ay ücretsiz = 10 aylık tutar. */
export function yearlyTotal(monthly: number) {
  return monthly * 10;
}

export function planChargeLabel(plan: Plan, cycle: BillingCycle) {
  if (plan.monthlyPrice == null) return "Özel fiyatlandırma";
  if (cycle === "yearly") {
    return `${formatTry(yearlyTotal(plan.monthlyPrice))} / yıl`;
  }
  return `${formatTry(plan.monthlyPrice)} / ay`;
}

export function planMonthlyEquivalent(plan: Plan, cycle: BillingCycle) {
  if (plan.monthlyPrice == null) return "Satış ekibi ile belirlenir";
  if (cycle === "yearly") {
    return `${formatTry(Math.round(yearlyTotal(plan.monthlyPrice) / 12))} / ay olarak faturalandırılır · 2 ay ücretsiz`;
  }
  return "Aylık fatura · dilediğiniz zaman iptal";
}

export function asPlanId(value?: string | null): PlanId {
  if (value === "pro" || value === "enterprise" || value === "free") return value;
  if (value === "baslangic" || value === "ucretsiz") return "free";
  if (value === "kurumsal") return "pro";
  return "free";
}
