"use client";

import { Brain, GraduationCap, LineChart, ShieldAlert, Video, Wallet } from "lucide-react";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { useAccessControl } from "@/components/access/AccessControlProvider";
import { ENTERPRISE_MODULES, type EnterpriseModuleId } from "@/lib/access-control";

const COPY: Record<
  EnterpriseModuleId,
  { icon: typeof Brain; kpis: { label: string; value: string; hint: string }[]; findings: string[] }
> = {
  culture_fit: {
    icon: Brain,
    kpis: [
      { label: "Ortalama kültür skoru", value: "78", hint: "Takım değerleri ile hizalama" },
      { label: "Riskli profil", value: "4", hint: "Derinlemesine görüşme önerilir" },
      { label: "Güçlü uyum", value: "12", hint: "Hızlı teklif adayı" },
    ],
    findings: [
      "İşbirliği ve öğrenme çevikliği boyutlarında yüksek uyum.",
      "Hiyerarşi hassasiyeti yüksek adaylarda onboarding mentorluğu önerilir.",
      "Psikolojik envanter sonuçları işe alım kararının yerine geçmez.",
    ],
  },
  flight_risk: {
    icon: LineChart,
    kpis: [
      { label: "Yüksek ayrılma riski", value: "%11", hint: "90 gün ufku" },
      { label: "Tükenmişlik sinyali", value: "7 kişi", hint: "İzin + mesai örüntüsü" },
      { label: "Tutundurma önceliği", value: "3 ekip", hint: "Mühendislik, satış, CS" },
    ],
    findings: [
      "Fazla mesai ve izin kullanmama birlikteliği risk skorunu yükseltiyor.",
      "Yönetici 1-1 sıklığı düşük ekiplerde erken müdahale önerilir.",
      "Tahminler performans cezası veya otomatik fesih için kullanılamaz.",
    ],
  },
  salary_benchmark: {
    icon: Wallet,
    kpis: [
      { label: "Piyasa medyan sapması", value: "-6%", hint: "TR teknoloji bandı" },
      { label: "Eşitsizlik uyarısı", value: "2 rol", hint: "Aynı seviye içi fark" },
      { label: "Teklif önerisi", value: "P50–P65", hint: "Kritik roller" },
    ],
    findings: [
      "Kıdemli backend bandı piyasa medyanının altında.",
      "İK uzmanı bandı iç tutarlı; harici tekliflerde P60 yeterli.",
      "Bordro tavsiyesi yalnızca bütçe simülasyonudur; nihai paket İK / CFO onayındadır.",
    ],
  },
  video_sentiment: {
    icon: Video,
    kpis: [
      { label: "Olumlu duygu", value: "%64", hint: "Son 12 görüşme" },
      { label: "Belirsiz / nötr", value: "%22", hint: "Takip sorusu öner" },
      { label: "Gerilim anı", value: "3", hint: "Yetkinlik sorularında" },
    ],
    findings: [
      "Kültürel uyum sorularında adaylar daha yüksek açıklık gösteriyor.",
      "Teknik derinleşme dakikalarında konuşma hızı düşüyor; bu otomatik eleme sebebi olamaz.",
      "Duygu analizi önyargı riski taşır; yalnızca mülakat notunu destekler.",
    ],
  },
  compliance_shield: {
    icon: ShieldAlert,
    kpis: [
      { label: "Politika boşluğu", value: "2", hint: "Fazla mesai ve KVKK" },
      { label: "Denetim hazırlığı", value: "%81", hint: "Doküman kapsama" },
      { label: "Yüksek risk madde", value: "1", hint: "İş Kanunu Md. 17" },
    ],
    findings: [
      "Fazla mesai onay kaydı eksik ekipler için süreç şablonu üretildi.",
      "Aydınlatma metni güncellemesi KVKK uyumu için önerilir.",
      "Mevzuat çıktısı hukuki mütalaa değildir; avukat / İK onayı gerekir.",
    ],
  },
  skill_gap: {
    icon: GraduationCap,
    kpis: [
      { label: "Kritik beceri açığı", value: "5", hint: "Cloud, SQL, İngilizce" },
      { label: "Önerilen öğrenme yolu", value: "18", hint: "Kişi başı 4–6 hafta" },
      { label: "İç mentor eşleşmesi", value: "9", hint: "Mevcut yetkinlik havuzu" },
    ],
    findings: [
      "Performans hedefleri ile L&D kataloğu hizalandı.",
      "Yeni yöneticiler için geri bildirim atölyesi öncelikli.",
      "Öğrenme yolu önerisi zorunlu eğitim ataması değildir.",
    ],
  },
};

export function EnterpriseModulePage({ moduleId }: { moduleId: EnterpriseModuleId }) {
  const { canView, loading } = useAccessControl();
  const meta = ENTERPRISE_MODULES.find((item) => item.id === moduleId);
  const copy = COPY[moduleId];
  const Icon = copy.icon;

  if (loading) {
    return <p className="text-sm text-slate-400">Modül yetkisi kontrol ediliyor…</p>;
  }

  if (!canView(moduleId) || !meta) {
    return (
      <div className="rounded-2xl border border-rose-100 bg-rose-50 px-5 py-8 text-sm text-rose-900">
        Bu Enterprise modülü şirket admini tarafından kapatılmış veya rolünüze açık değil. Flight Risk ve Salary
        Benchmarking gibi hassas analitikler employee / hr_specialist rollerinde gizlenir.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">Enterprise Analytics</p>
        <h1 className="mt-1 flex items-center gap-2 text-2xl font-semibold tracking-tight text-[#0b1f3a]">
          <Icon className="h-6 w-6 text-sky-700" />
          {meta.title}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{meta.subtitle}</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        {copy.kpis.map((kpi) => (
          <article
            key={kpi.label}
            className="rounded-2xl border border-sky-100 bg-white p-5 shadow-[0_8px_30px_rgba(15,55,95,0.06)]"
          >
            <p className="text-sm text-slate-500">{kpi.label}</p>
            <p className="mt-2 text-3xl font-semibold text-[#0b1f3a]">{kpi.value}</p>
            <p className="mt-1 text-xs text-slate-400">{kpi.hint}</p>
            <AiDisclaimer className="mt-4" />
          </article>
        ))}
      </section>

      <article className="rounded-2xl border border-sky-100 bg-white p-5 shadow-[0_8px_30px_rgba(15,55,95,0.06)]">
        <h2 className="text-base font-semibold text-[#0b1f3a]">AI karar destek özeti</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
          {copy.findings.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <AiDisclaimer className="mt-4" />
      </article>
    </div>
  );
}
