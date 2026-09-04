import type { Locale } from "@/lib/i18n";

export type SkillGapWeek = {
  week: number;
  focus: string;
  actions: string[];
};

export type SkillGapPlan = {
  id: string;
  reviewId: string;
  employeeName: string;
  period: string;
  gaps: string[];
  overview: string;
  weeks: SkillGapWeek[];
  createdAt: string;
};

export const SKILL_GAP_STORAGE_KEY = "nexus-skill-gap-plans";

export function fallbackSkillGapPlan(input: {
  reviewId: string;
  employeeName: string;
  period: string;
  gaps: string[];
  locale: Locale;
}): SkillGapPlan {
  const name = input.employeeName || (input.locale === "en" ? "Employee" : "Çalışan");
  const gaps = input.gaps.length ? input.gaps.slice(0, 4) : input.locale === "en"
    ? ["Prioritisation", "Stakeholder communication"]
    : ["Önceliklendirme", "Paydaş iletişimi"];

  if (input.locale === "en") {
    return {
      id: crypto.randomUUID(),
      reviewId: input.reviewId,
      employeeName: name,
      period: input.period,
      gaps,
      overview: `A four-week coaching sprint for ${name} targeting ${gaps.join(", ")}. Each week mixes one focused skill drill, a live work application and a short manager check-in.`,
      weeks: [
        {
          week: 1,
          focus: gaps[0] ?? "Diagnostic week",
          actions: [
            "Map the gap to two real tasks this week",
            "Shadow a peer who is strong in this skill",
            "30-minute coaching conversation with the manager",
          ],
        },
        {
          week: 2,
          focus: gaps[1] ?? "Practice week",
          actions: [
            "Deliver one piece of work using the new method",
            "Collect written feedback from two stakeholders",
            "Log three measurable outcomes in the weekly notes",
          ],
        },
        {
          week: 3,
          focus: "Transfer to live work",
          actions: [
            "Lead a 20-minute knowledge share with the team",
            "Pair with a senior on a higher-stakes task",
            "Adjust the personal checklist based on feedback",
          ],
        },
        {
          week: 4,
          focus: "Lock in the habit",
          actions: [
            "Present a before/after evidence pack",
            "Agree one KPI for the next quarter",
            "Schedule a 30-day follow-up review",
          ],
        },
      ],
      createdAt: new Date().toISOString(),
    };
  }

  return {
    id: crypto.randomUUID(),
    reviewId: input.reviewId,
    employeeName: name,
    period: input.period,
    gaps,
    overview: `${name} için ${gaps.join(", ")} odaklı 4 haftalık koçluk sprinti. Her hafta bir yetkinlik çalışması, canlı iş uygulaması ve kısa yönetici kontrolü içerir.`,
    weeks: [
      {
        week: 1,
        focus: gaps[0] ?? "Tanı haftası",
        actions: [
          "Açığı bu haftaki iki gerçek işe bağlayın",
          "Bu yetkinlikte güçlü bir meslektaşı gölgeleyin",
          "Yöneticiyle 30 dakikalık koçluk görüşmesi yapın",
        ],
      },
      {
        week: 2,
        focus: gaps[1] ?? "Uygulama haftası",
        actions: [
          "Yeni yöntemi kullanarak bir teslimat yapın",
          "İki paydaştan yazılı geri bildirim alın",
          "Haftalık nota üç ölçülebilir sonuç yazın",
        ],
      },
      {
        week: 3,
        focus: "Canlı işe aktarım",
        actions: [
          "Ekibe 20 dakikalık bilgi paylaşımı yönetin",
          "Daha kritik bir işte kıdemli ile eşleşin",
          "Geri bildirime göre kişisel kontrol listesini güncelleyin",
        ],
      },
      {
        week: 4,
        focus: "Alışkanlığı sabitleme",
        actions: [
          "Önce/sonra kanıt dosyasını sunun",
          "Sonraki çeyrek için bir KPI üzerinde anlaşın",
          "30 günlük takip görüşmesini takvime alın",
        ],
      },
    ],
    createdAt: new Date().toISOString(),
  };
}
