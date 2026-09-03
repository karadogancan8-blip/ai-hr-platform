export type PlanId = "free" | "pro" | "enterprise";
export type SubscriptionStatus = "free" | "active";

export type Plan = {
  id: PlanId;
  name: string;
  priceLabel: string;
  priceHint: string;
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
};

export const plans: Plan[] = [
  {
    id: "free",
    name: "Başlangıç",
    priceLabel: "0 TL",
    priceHint: "Ücretsiz",
    description: "Küçük ekipler için temel İK operasyonu.",
    features: ["Aylık 5 CV analizi", "Temel izin yönetimi", "Tek şirket çalışma alanı"],
    cta: "Planı Seç",
  },
  {
    id: "pro",
    name: "Pro",
    priceLabel: "499 TL",
    priceHint: "Aylık",
    description: "Büyüyen ekipler için tam AI İK paketi.",
    features: ["Sınırsız CV analizi", "AI mevzuat danışmanı", "Multi-tenant izin takibi"],
    cta: "Abone Ol",
    popular: true,
  },
  {
    id: "enterprise",
    name: "Kurumsal",
    priceLabel: "1.499 TL",
    priceHint: "Aylık",
    description: "Kurumsal ölçek, öncelikli destek ve özel model.",
    features: ["Özel AI modeli", "Öncelikli destek", "Sınırsız kullanıcı"],
    cta: "Abone Ol",
  },
];

export const planBadgeLabel: Record<PlanId, string> = {
  free: "Ücretsiz Plan",
  pro: "Pro Plan",
  enterprise: "Kurumsal Plan",
};

export function asPlanId(value?: string | null): PlanId {
  if (value === "pro" || value === "enterprise" || value === "free") return value;
  if (value === "baslangic" || value === "ucretsiz") return "free";
  if (value === "kurumsal") return "enterprise";
  return "free";
}
