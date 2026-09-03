import type {
  Candidate,
  ChatMessage,
  DashboardStat,
  LeaveRequest,
} from "./types";

export const dashboardStats: DashboardStat[] = [
  {
    id: "open-roles",
    label: "Açık Pozisyon",
    value: "12",
    delta: "+3",
    trend: "up",
    hint: "Bu ay yeni açılan ilan",
  },
  {
    id: "cv-pipeline",
    label: "CV Havuzu",
    value: "248",
    delta: "+41",
    trend: "up",
    hint: "RecruiterAgent taradı",
  },
  {
    id: "policy-qa",
    label: "Mevzuat Sorgusu",
    value: "86",
    delta: "+12",
    trend: "up",
    hint: "PolicyAgent yanıtı",
  },
  {
    id: "pending-leave",
    label: "Bekleyen İzin",
    value: "7",
    delta: "-2",
    trend: "down",
    hint: "HRAdminAgent kuyruğu",
  },
];

export const recentActivity = [
  {
    id: "a1",
    agent: "RecruiterAgent",
    title: "Kıdemli Frontend CV’si %94 eşleşti",
    time: "12 dk önce",
  },
  {
    id: "a2",
    agent: "PolicyAgent",
    title: "Uzaktan çalışma yönetmeliği soruldu",
    time: "28 dk önce",
  },
  {
    id: "a3",
    agent: "HRAdminAgent",
    title: "3 yıllık izin talebi onay bekliyor",
    time: "1 sa önce",
  },
  {
    id: "a4",
    agent: "RecruiterAgent",
    title: "Ürün yöneticisi kısa listesi güncellendi",
    time: "2 sa önce",
  },
];

export const mockCandidates: Candidate[] = [
  {
    id: "c1",
    name: "Elif Kaya",
    role: "Kıdemli Frontend Geliştirici",
    experience: "7 yıl",
    location: "İstanbul",
    matchScore: 94,
    skills: ["Next.js", "TypeScript", "Tailwind"],
    status: "mulakat",
    uploadedAt: "Bugün 09:14",
  },
  {
    id: "c2",
    name: "Mert Özdemir",
    role: "İK İş Ortağı",
    experience: "5 yıl",
    location: "Ankara",
    matchScore: 88,
    skills: ["SAP SuccessFactors", "İş Hukuku", "Raporlama"],
    status: "incelemede",
    uploadedAt: "Dün 16:40",
  },
  {
    id: "c3",
    name: "Selin Arslan",
    role: "Ürün Yöneticisi",
    experience: "6 yıl",
    location: "İzmir",
    matchScore: 81,
    skills: ["Roadmap", "OKR", "Discovery"],
    status: "yeni",
    uploadedAt: "Dün 11:05",
  },
  {
    id: "c4",
    name: "Can Yıldız",
    role: "Veri Analisti",
    experience: "4 yıl",
    location: "Bursa",
    matchScore: 73,
    skills: ["SQL", "Python", "Power BI"],
    status: "incelemede",
    uploadedAt: "2 gün önce",
  },
];

export const initialPolicyMessages: ChatMessage[] = [
  {
    id: "m1",
    role: "assistant",
    content:
      "Merhaba, ben PolicyAgent. Şirket içi yönetmelik, izin, fazla mesai ve uzaktan çalışma kuralları hakkında sorularınızı yanıtlayabilirim. Nasıl yardımcı olabilirim?",
    time: "09:00",
  },
];

export const policyAnswers: Record<string, string> = {
  default:
    "İlgili maddeyi şirket içi mevzuat indeksinde taradım. Uygulama genel hatlarıyla İnsan Kaynakları Yönetmeliği Md. 12–18 kapsamında değerlendirilir. Nihai karar için İK iş ortağınızla teyitleşmenizi öneririm.",
};

export const mockLeaveRequests: LeaveRequest[] = [
  {
    id: "L-1042",
    employee: "Ayşe Demir",
    department: "Finans",
    type: "yillik",
    startDate: "2026-09-08",
    endDate: "2026-09-12",
    days: 5,
    reason: "Yıllık izin planı",
    status: "beklemede",
  },
  {
    id: "L-1043",
    employee: "Burak Şahin",
    department: "Satış",
    type: "mazeret",
    startDate: "2026-09-03",
    endDate: "2026-09-03",
    days: 1,
    reason: "Resmi işlem",
    status: "beklemede",
  },
  {
    id: "L-1038",
    employee: "Deniz Aksoy",
    department: "Ürün",
    type: "hastalik",
    startDate: "2026-08-28",
    endDate: "2026-08-29",
    days: 2,
    reason: "Raporlu izin",
    status: "onaylandi",
  },
  {
    id: "L-1035",
    employee: "Hakan Uçar",
    department: "Operasyon",
    type: "ucretsiz",
    startDate: "2026-09-15",
    endDate: "2026-09-18",
    days: 4,
    reason: "Kişisel işler",
    status: "reddedildi",
  },
];
