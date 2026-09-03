import type { InterviewGuide } from "./interview";
import type { OnboardingPlanPayload, StoredOnboardingPlan } from "./onboarding";
import { insertOnboardingPlan, toLocalOnboardingPlan } from "./onboarding";
import type { StoredPerformanceReview } from "./performance";
import { insertPerformanceReview, toLocalPerformanceReview } from "./performance";
import { insertResume, type ResumeInsert, type StoredResume } from "./resumes";
import { mergeById, readSessionList, writeSessionList } from "./session-store";
import type { ChatMessage } from "./types";

export const DEMO_ONBOARDING_KEY = "nexus-onboarding-plans";
export const DEMO_PERFORMANCE_KEY = "nexus-performance-reviews";
export const DEMO_POLICY_KEY = "nexus-demo-policy-messages";
export const DEMO_GUIDES_KEY = "nexus-interview-guides";
export const DEMO_SEEDED_EVENT = "nexus-demo-seeded";

export type DemoCandidateSeed = ResumeInsert & {
  interviewGuide: InterviewGuide;
};

function notesFromGuide(guide: InterviewGuide) {
  return [...guide.technicalQuestions, ...guide.cultureQuestions]
    .map((item, index) => `${index + 1}. ${item.question}\nBeklenen: ${item.expectedAnswer}`)
    .join("\n\n");
}

function frontendGuide(): InterviewGuide {
  return {
    technicalQuestions: [
      {
        id: "tech-1",
        kind: "technical",
        question: "Next.js App Router’da sunucu ve istemci bileşen sınırını nasıl çizersiniz?",
        expectedAnswer: "Veri çekme sunucuda, etkileşim 'use client'; gizlilik ve bundle etkisi anlatılmalı.",
      },
      {
        id: "tech-2",
        kind: "technical",
        question: "Büyük bir TypeScript monoreposunda tip güvenliğini nasıl korursunuz?",
        expectedAnswer: "Paylaşılan tipler, sıkı tsconfig, API sözleşmesi ve CI type-check.",
      },
      {
        id: "tech-3",
        kind: "technical",
        question: "Core Web Vitals kötüleştiğinde nasıl teşhis edersiniz?",
        expectedAnswer: "LCP/INP/CLS kaynakları, code-split, görsel önceliği, gereksiz JS.",
      },
      {
        id: "tech-4",
        kind: "technical",
        question: "Tasarım sistemini Tailwind ile nasıl ölçeklersiniz?",
        expectedAnswer: "Token’lar, bileşen API’si, erişilebilirlik ve tutarlı spacing.",
      },
      {
        id: "tech-5",
        kind: "technical",
        question: "Kimlik doğrulamalı bir SaaS’ta çok kiracılığı önde nasıl yansıtırınız?",
        expectedAnswer: "Şirket izolasyonu, yetki, veri sızıntısı riskleri ve UI’da tenant bağlamı.",
      },
    ],
    cultureQuestions: [
      {
        id: "culture-1",
        kind: "culture",
        question: "Ürün belirsizken frontend kapsamını nasıl müzakere edersiniz?",
        expectedAnswer: "MVP dilimleme, risk ve teslim tarihi şeffaflığı.",
      },
      {
        id: "culture-2",
        kind: "culture",
        question: "Kod incelemesinde anlaşmazlığı nasıl çözersiniz?",
        expectedAnswer: "Veri/kullanıcı etkisi, saygı ve yazılı karar.",
      },
      {
        id: "culture-3",
        kind: "culture",
        question: "Junior bir meslektaşa nasıl mentorluk yaparsınız?",
        expectedAnswer: "Küçük PR’lar, eşli çalışma, net geri bildirim.",
      },
    ],
    strengths: ["Ürün odaklı UI", "Performans bilinci", "Tip güvenliği"],
    probeAreas: ["Dağıtık sistem sınırları", "İşe alım süreçlerine ürün dili"],
  };
}

function hrGuide(): InterviewGuide {
  return {
    technicalQuestions: [
      {
        id: "tech-1",
        kind: "technical",
        question: "İş Kanunu’nda yıllık izin süreleri kıdeme göre nasıl değişir?",
        expectedAnswer: "Kıdeme göre 14/20 gün dilimleri; şirket uygulaması teyit edilir.",
      },
      {
        id: "tech-2",
        kind: "technical",
        question: "Çok kiracılı bir İK SaaS’ta özlük verisini nasıl izole edersiniz?",
        expectedAnswer: "company_id, RLS, yetki matrisleri, denetim kaydı.",
      },
      {
        id: "tech-3",
        kind: "technical",
        question: "İşe alım hunisinde yanlılığı nasıl azaltırsınız?",
        expectedAnswer: "Standart skor kartı, yapılandırılmış mülakat, kanıta dayalı not.",
      },
      {
        id: "tech-4",
        kind: "technical",
        question: "Performans döneminde kalibrasyonu nasıl yönetirsiniz?",
        expectedAnswer: "Kanıt, akran girdi, 1–5 skala ve hedef netliği.",
      },
      {
        id: "tech-5",
        kind: "technical",
        question: "Onboarding 30 gününü nasıl ölçersiniz?",
        expectedAnswer: "Checklist tamamlanma, 30. gün görüşmesi, ilk teslimat.",
      },
    ],
    cultureQuestions: [
      {
        id: "culture-1",
        kind: "culture",
        question: "Yönetici ile çalışan arasında gerilimde nasıl tarafsız kalırsınız?",
        expectedAnswer: "Dinleme, süreç, yazılı özet, gizlilik.",
      },
      {
        id: "culture-2",
        kind: "culture",
        question: "Politik bir izin talebini nasıl ele alırsınız?",
        expectedAnswer: "Yönetmelik + kanun, tutarlı uygulama, İK kaydı.",
      },
      {
        id: "culture-3",
        kind: "culture",
        question: "Değişim döneminde iletişimi nasıl kurgularsınız?",
        expectedAnswer: "Net zamanlama, SSS, yönetici brifingi.",
      },
    ],
    strengths: ["Mevzuat okuryazarlığı", "Çalışan deneyimi", "Süreç disiplini"],
    probeAreas: ["Veri analitiği derinliği", "Teknik işe alım kalibrasyonu"],
  };
}

function pmGuide(): InterviewGuide {
  return {
    technicalQuestions: [
      {
        id: "tech-1",
        kind: "technical",
        question: "Discovery’den teslimata bir epik nasıl parçalanır?",
        expectedAnswer: "Sorun, varsayım, MVP dilimi, başarı metriği.",
      },
      {
        id: "tech-2",
        kind: "technical",
        question: "OKR ile sprint çıktısını nasıl hizalarsınız?",
        expectedAnswer: "Çeyrek sonuç, sprint çıktısı ayrımı, sapma yönetimi.",
      },
      {
        id: "tech-3",
        kind: "technical",
        question: "Paydaş çatışmasında önceliği nasıl kilitlersiniz?",
        expectedAnswer: "Etki/effort, risk, yazılı karar kaydı.",
      },
      {
        id: "tech-4",
        kind: "technical",
        question: "AI özelliklerinde halüsinasyon riskini ürüne nasıl yedirirsiniz?",
        expectedAnswer: "Fallback, insan onayı, ölçülebilir kalite.",
      },
      {
        id: "tech-5",
        kind: "technical",
        question: "Kullanıcı araştırmasını yol haritasına nasıl bağlarsınız?",
        expectedAnswer: "Görüşme içgörüsü, fırsat skoru, deney hipotezi.",
      },
    ],
    cultureQuestions: [
      {
        id: "culture-1",
        kind: "culture",
        question: "Mühendislik kapasitesi doluyken satış baskısını nasıl yönetirsiniz?",
        expectedAnswer: "Şeffaf kapasite, trade-off, ortak hedef.",
      },
      {
        id: "culture-2",
        kind: "culture",
        question: "Başarısız bir deneyi ekibe nasıl anlatırsınız?",
        expectedAnswer: "Öğrenilen ders, suçlama yok, sonraki hipotez.",
      },
      {
        id: "culture-3",
        kind: "culture",
        question: "Çapraz ekiplerde güven nasıl inşa edilir?",
        expectedAnswer: "Düzenli ritim, yazılı karar, görünür backlog.",
      },
    ],
    strengths: ["Keşif disiplini", "Paydaş hizalama", "Metrik odaklılık"],
    probeAreas: ["Teknik derinlik", "Go-to-market detayı"],
  };
}

export const demoCandidates: DemoCandidateSeed[] = [
  {
    name: "Deniz Aydın",
    role: "Kıdemli Frontend Geliştirici",
    matchScore: 94,
    interviewScore: 88,
    summary:
      "7 yıllık React/Next.js deneyimi. Tasarım sistemi, performans ve TypeScript konusunda güçlü. B2B SaaS panellerinde çok kiracılı arayüz teslim etmiş.",
    skills: ["Next.js", "TypeScript", "Tailwind", "Playwright", "GraphQL"],
    strengths: ["Ürün kalitesi", "Erişilebilir UI", "Mentorluk"],
    weaknesses: ["Dağıtık sistem tasarımı sınırlı", "İşe alım domain bilgisi yeni"],
    interviewGuide: frontendGuide(),
    interviewNotes: "",
  },
  {
    name: "Ece Yılmaz",
    role: "İK Uzmanı",
    matchScore: 91,
    interviewScore: 84,
    summary:
      "5 yıl kurumsal İK: işe alım, özlük, izin ve performans kalibrasyonu. İş Kanunu pratikleri ve çalışan deneyimi programları yürütmüş.",
    skills: ["İş Hukuku", "SuccessFactors", "İşe alım", "Onboarding", "Raporlama"],
    strengths: ["Süreç disiplini", "Gizlilik", "Paydaş yönetimi"],
    weaknesses: ["İleri analitik SQL", "Teknik mülakat kalibrasyonu"],
    interviewGuide: hrGuide(),
    interviewNotes: "",
  },
  {
    name: "Kemal Arslan",
    role: "Ürün Yöneticisi",
    matchScore: 87,
    interviewScore: 80,
    summary:
      "6 yıl B2B ürün: discovery, OKR, yol haritası. AI destekli iş akışlarını insan onaylı fallback ile canlıya almış.",
    skills: ["Roadmap", "OKR", "Discovery", "SQL temel", "A/B"],
    strengths: ["Önceliklendirme", "Hikâye anlatımı", "Deney kültürü"],
    weaknesses: ["Derin teknik mimari", "Fiyatlandırma modelleme"],
    interviewGuide: pmGuide(),
    interviewNotes: "",
  },
].map((item) => ({ ...item, interviewNotes: notesFromGuide(item.interviewGuide) }));

function weekBlock(
  weeks: { week: number; title: string; focus: string }[],
  tasks: { week: number; day: number; title: string }[],
): OnboardingPlanPayload {
  return {
    summary: "",
    weeks: weeks.map((week) => ({ week: week.week, title: week.title, focus: week.focus })),
    tasks: tasks.map((task, index) => ({
      id: `demo-t${index + 1}`,
      week: task.week,
      day: task.day,
      title: task.title,
      done: index < 3,
    })),
  };
}

export const demoOnboardingSeeds: {
  employeeName: string;
  role: string;
  department: string;
  payload: OnboardingPlanPayload;
}[] = [
  {
    employeeName: "Baran Koç",
    role: "Yazılım Mühendisi",
    department: "Mühendislik",
    payload: {
      ...weekBlock(
        [
          { week: 1, title: "Hafta 1 · Ortam ve kültür", focus: "Hesap, repo, ekip ritmi" },
          { week: 2, title: "Hafta 2 · Kod tabanı", focus: "Gölge PR ve küçük düzeltme" },
          { week: 3, title: "Hafta 3 · Sahiplik", focus: "Bağımsız iş paketi" },
          { week: 4, title: "Hafta 4 · Teslim", focus: "30. gün demo ve hedefler" },
        ],
        [
          { week: 1, day: 1, title: "Laptop, SSO, GitHub ve Slack erişimini doğrula" },
          { week: 1, day: 2, title: "Mühendislik ilkeleri ve kod stili dokümanını oku" },
          { week: 1, day: 3, title: "Yerel ortamı ayağa kaldır, smoke test geçir" },
          { week: 1, day: 5, title: "Takım board’unda ilk 3 işi mentor ile seç" },
          { week: 2, day: 8, title: "Bir bug’ı gölge olarak izle ve not çıkar" },
          { week: 2, day: 10, title: "Küçük bir UI/API düzeltmesi için PR aç" },
          { week: 2, day: 12, title: "Kod incelemesi al, yorumları aynı gün kapat" },
          { week: 3, day: 15, title: "Bağımsız bir kullanıcı hikâyesini planla" },
          { week: 3, day: 18, title: "Test + gözlem ile özelliği staging’e çıkar" },
          { week: 3, day: 21, title: "Retrospektifte bir öğrenim paylaş" },
          { week: 4, day: 24, title: "30 günlük teknik öğrenim özetini yaz" },
          { week: 4, day: 28, title: "Çeyrek için 3 mühendislik hedefi öner" },
          { week: 4, day: 30, title: "Yönetici ile 30. gün değerlendirme toplantısı" },
        ],
      ),
      summary:
        "Baran Koç için mühendislik onboarding’i: ilk hafta ortam, ikinci hafta kod tabanı, üçüncü hafta sahiplik, dördüncü hafta teslim ve hedef netleştirme.",
    },
  },
  {
    employeeName: "Selin Aksoy",
    role: "İK Uzmanı",
    department: "İnsan Kaynakları",
    payload: {
      ...weekBlock(
        [
          { week: 1, title: "Hafta 1 · Politika ve sistemler", focus: "Yönetmelik, KVKK, İK araçları" },
          { week: 2, title: "Hafta 2 · Döngüler", focus: "İşe alım ve izin süreçleri" },
          { week: 3, title: "Hafta 3 · Danışmanlık", focus: "Yönetici soruları ve vaka" },
          { week: 4, title: "Hafta 4 · Sahiplik", focus: "İlk süreç iyileştirme" },
        ],
        [
          { week: 1, day: 1, title: "İK yönetmeliği ve gizlilik taahhüdünü tamamla" },
          { week: 1, day: 2, title: "HRIS hesapları ve şirket organizasyonunu incele" },
          { week: 1, day: 4, title: "İzin / işe alım / performans ekranlarında demo turu" },
          { week: 1, day: 5, title: "İK iş ortağı ile paydaş haritası çıkar" },
          { week: 2, day: 8, title: "Bir işe alım talebini uçtan uca gölge et" },
          { week: 2, day: 10, title: "Örnek izin talebini mevzuata göre değerlendir" },
          { week: 2, day: 13, title: "Aday deneyimi anketini oku, 3 iyileştirme not et" },
          { week: 3, day: 16, title: "Yönetici SSS’sine yazılı yanıt taslağı hazırla" },
          { week: 3, day: 19, title: "Zor bir vaka simülasyonunda mentorla rol yap" },
          { week: 3, day: 21, title: "Onboarding checklist kalitesini gözden geçir" },
          { week: 4, day: 25, title: "Bir süreç darboğazı için tek sayfalık öneri yaz" },
          { week: 4, day: 28, title: "90 günlük İK hedeflerini yöneticiyle kilitle" },
          { week: 4, day: 30, title: "30. gün çalışan deneyimi kapanış toplantısı" },
        ],
      ),
      summary:
        "Selin Aksoy için İK uyum planı: politika ve sistemler, işe alım/izin döngüleri, danışmanlık vakaları ve 30. günde süreç sahipliği.",
    },
  },
];

export const demoPerformanceSeeds: Omit<StoredPerformanceReview, "id" | "createdAt" | "persisted">[] = [
  {
    employeeName: "Baran Koç",
    period: "2026 Q2",
    notes:
      "İki sprint boyunca ödeme ekranı hatalarını kapattı, PR kalitesi yükseldi. Stand-up’larda riskleri geç bildirdiği geri bildirimi var.",
    summary:
      "2026 Q2’de Baran Koç teslimat hızı ve kod kalitesinde belirgin katkı sağladı. İletişim zamanlaması gelişim alanı; gelecek çeyrekte görünür risk raporu beklenir.",
    strengths: ["Kaliteli PR disiplini", "Hata kök nedenine inme", "Takım içi yardım"],
    improvements: ["Riskleri daha erken eskalasyon", "Tahmin doğruluğu", "Dokümantasyon sürekliliği"],
    goals: [
      "Q3’te kritik hatalarda 24s kök neden notu",
      "Sprint tahmin sapmasını %20 azaltmak",
      "Ödeme modülü runbook’unu tamamlamak",
    ],
    score: 4,
  },
  {
    employeeName: "Selin Aksoy",
    period: "2026 Q3",
    notes:
      "İşe alım SLA’sını 18 günden 12 güne indirdi. Yönetici danışmanlığında netlik övgüsü aldı. Raporlama otomasyonu henüz tamamlanmadı.",
    summary:
      "2026 Q3’te Selin Aksoy işe alım çevikliğini ve paydaş güvenini yükseltti. Veri otomasyonu ve kalibrasyon ritmi gelecek çeyreğin odağı olmalı.",
    strengths: ["Aday deneyimi", "Yönetici ortaklığı", "Mevzuata uygun karar"],
    improvements: ["Rapor otomasyonu", "Kalibrasyon kanıt standardı", "Teknik rol mülakat setleri"],
    goals: [
      "Aylık işe alım panosunu otomatikleştirmek",
      "Teknik roller için yapılandırılmış soru seti",
      "Çeyrek kalibrasyon dosyası şablonu",
    ],
    score: 4,
  },
];

export const demoPolicyQa: { question: string; answer: string }[] = [
  {
    question: "Yıllık izin hakkım kıdeme göre kaç gün?",
    answer:
      "İş Kanunu’na göre yıllık ücretli izin kıdeme göre kural olarak 14 veya 20 iş günüdür. Şirket yönetmeliğinde talep, iznin başlangıcından en az 5 iş günü önce iletilir; resmi tatiller süreye dahil edilmez. Kesin bakiye özlük kaydınızda görünür.",
  },
  {
    question: "Salı günü evden çalışabilir miyim?",
    answer:
      "Hibrit kuralımızda Salı ve Perşembe ofis günüdür. 5 iş gününden uzun uzaktan çalışma için yönetici onayı gerekir. İstisna talepleri yazılı iletilir; veri güvenliği politikası uzaktan da geçerlidir.",
  },
  {
    question: "Fazla mesai için onay şart mı?",
    answer:
      "Evet. Fazla mesai önceden yazılı onay ister ve haftalık 11 saati aşamaz. Onaysız süre ücret/izin karşılığı doğurmaz. Fiili saatler yöneticinizle kayıt altına alınmalıdır.",
  },
];

export function demoPolicyMessages(): ChatMessage[] {
  const rows: ChatMessage[] = [
    {
      id: "demo-m0",
      role: "assistant",
      content:
        "Demo modu: PolicyAgent örnek mevzuat diyalogları yüklendi. İzin, hibrit çalışma ve fazla mesai sorularını inceleyebilirsiniz.",
      time: "09:00",
    },
  ];
  demoPolicyQa.forEach((item, index) => {
    rows.push({
      id: `demo-q${index}`,
      role: "user",
      content: item.question,
      time: "09:0" + (index + 1),
    });
    rows.push({
      id: `demo-a${index}`,
      role: "assistant",
      content: item.answer,
      time: "09:0" + (index + 1),
    });
  });
  return rows;
}

export async function seedDemoCorporateData() {
  const resumes: StoredResume[] = [];
  const guides: Record<string, InterviewGuide> = {};

  for (const candidate of demoCandidates) {
    try {
      const saved = await insertResume(candidate);
      resumes.push(saved);
      guides[saved.id] = candidate.interviewGuide;
    } catch (error) {
      console.error("[seed] resume", candidate.name, error);
      const local: StoredResume = {
        id: crypto.randomUUID(),
        name: candidate.name,
        role: candidate.role ?? "Aday",
        matchScore: candidate.matchScore,
        interviewScore: candidate.interviewScore ?? null,
        interviewNotes: candidate.interviewNotes ?? "",
        summary: candidate.summary,
        skills: candidate.skills ?? [],
        strengths: candidate.strengths ?? [],
        weaknesses: candidate.weaknesses ?? [],
        createdAt: new Date().toISOString(),
      };
      resumes.push(local);
      guides[local.id] = candidate.interviewGuide;
    }
  }

  const onboarding: StoredOnboardingPlan[] = [];
  for (const item of demoOnboardingSeeds) {
    try {
      onboarding.push(await insertOnboardingPlan(item));
    } catch (error) {
      console.error("[seed] onboarding", item.employeeName, error);
      onboarding.push(toLocalOnboardingPlan(item));
    }
  }

  const reviews: StoredPerformanceReview[] = [];
  for (const item of demoPerformanceSeeds) {
    try {
      reviews.push(await insertPerformanceReview(item));
    } catch (error) {
      console.error("[seed] performance", item.employeeName, error);
      reviews.push(toLocalPerformanceReview(item));
    }
  }

  if (typeof window !== "undefined") {
    writeSessionList(DEMO_ONBOARDING_KEY, mergeById(onboarding, readSessionList(DEMO_ONBOARDING_KEY)));
    writeSessionList(DEMO_PERFORMANCE_KEY, mergeById(reviews, readSessionList(DEMO_PERFORMANCE_KEY)));
    writeSessionList(DEMO_POLICY_KEY, demoPolicyMessages());
    window.sessionStorage.setItem(DEMO_GUIDES_KEY, JSON.stringify(guides));
    window.dispatchEvent(new CustomEvent(DEMO_SEEDED_EVENT, { detail: { resumes, onboarding, reviews } }));
  }

  return { resumes, onboarding, reviews, guides };
}
