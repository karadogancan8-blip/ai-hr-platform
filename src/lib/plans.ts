export const PLAN_MULTILINGUAL_FEATURE =
  "8 Farklı Global Dil Desteği (TR, EN, DE, FR, ES, AR, RU, ZH)";

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
  highlights?: string[];
  popular?: boolean;
};

export const plans: Plan[] = [
  {
    id: "free",
    name: "KOBİ",
    seatLabel: "1–50 çalışan",
    monthlyPrice: 2950,
    description: "Küçük ve orta ölçekli ekipler için yapay zeka destekli çekirdek İK operasyonu.",
    features: [
      "Yapay zeka destekli özgeçmiş analizi ve işe alım",
      "Mevzuat asistanı (temel kullanım kotası)",
      "Oryantasyon şablonları",
      "KVKK uyumlu belge ve izin kaydı",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    seatLabel: "50–250 çalışan",
    monthlyPrice: 7450,
    description: "Büyüyen organizasyonlar için tam platform, öncelikli kapasite ve sektörel zeka.",
    highlights: [
      "Sektörel Akıllı Bilgi Üssü",
      "Canlı AI Mülakat Simülatörü",
      "Şeffaf İtiraz ve Geri Bildirim Modülü",
      "Gizli Ücret Kıyaslama",
      PLAN_MULTILINGUAL_FEATURE,
    ],
    features: [
      "Sınırsız özgeçmiş analizi ve mülakat rehberi",
      "Mevzuat asistanı ve performans yönetimi",
      "Kurumsal marka kimliği (white-label)",
      "Çoklu yönetici yetkisi ve denetim izi",
    ],
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    seatLabel: "250 ve üzeri çalışan",
    monthlyPrice: null,
    description: "Holding ve büyük ölçekli yapılar için özel sözleşme, SSO ve hizmet seviyesi taahhüdü.",
    highlights: [
      "Sektörel Akıllı Bilgi Üssü",
      "Canlı AI Mülakat Simülatörü",
      "Şeffaf İtiraz ve Geri Bildirim Modülü",
      "Gizli Ücret Kıyaslama",
      PLAN_MULTILINGUAL_FEATURE,
    ],
    features: [
      "Özel teklif ve atanmış hesap yöneticisi",
      "SSO, özel entegrasyonlar ve SLA",
      "Özel model ve veri bölgesi seçenekleri",
      "Kurumsal oryantasyon ve eğitim",
    ],
  },
];

export const planBadgeLabel: Record<PlanId, string> = {
  free: "KOBİ",
  pro: "Pro",
  enterprise: "Enterprise",
};

export function formatTry(amount: number) {
  return `₺${amount.toLocaleString("tr-TR")}`;
}

/** Yıllık faturalamada 2 ay ücretsiz = 10 aylık tutar. */
export function yearlyTotal(monthly: number) {
  return monthly * 10;
}

export function planChargeLabel(plan: Plan, cycle: BillingCycle) {
  if (plan.monthlyPrice == null) return "Özel teklif";
  if (cycle === "yearly") {
    return `${formatTry(yearlyTotal(plan.monthlyPrice))} / yıl`;
  }
  return `${formatTry(plan.monthlyPrice)} / ay`;
}

export function planMonthlyEquivalent(plan: Plan, cycle: BillingCycle) {
  if (plan.monthlyPrice == null) return "Satış ekibiyle özel teklif.";
  if (cycle === "yearly") {
    return `${formatTry(Math.round(yearlyTotal(plan.monthlyPrice) / 12))} / ay olarak faturalandırılır. 2 ay ücretsiz.`;
  }
  return "Aylık faturalandırma. İstediğiniz zaman iptal edebilirsiniz.";
}

export function asPlanId(value?: string | null): PlanId {
  if (value === "pro" || value === "enterprise" || value === "free") return value;
  if (value === "baslangic" || value === "ucretsiz" || value === "kobi") return "free";
  if (value === "kurumsal") return "pro";
  return "free";
}
