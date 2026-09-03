export type KbTab = "all" | "hr" | "guides" | "templates";
export type KbAudience = "employee" | "hr_only";

export type KnowledgeDoc = {
  id: string;
  title: string;
  summary: string;
  body: string;
  tab: Exclude<KbTab, "all">;
  audience: KbAudience;
  tags: string[];
  sector?: string;
  generated?: boolean;
  custom?: boolean;
};

export const KB_STORAGE_KEY = "nexus-knowledge-docs";

export const SECTORS = ["Teknoloji", "Üretim", "Perakende", "Finans", "Sağlık"] as const;

export function canSeeKnowledgeDoc(isEditor: boolean, doc: KnowledgeDoc) {
  if (isEditor) return true;
  return doc.audience === "employee";
}

export const seedKnowledgeDocs: KnowledgeDoc[] = [
  {
    id: "emp-guide",
    title: "Çalışan Rehberi",
    summary: "İşe giriş, iletişim kanalları, ofis günleri ve sık sorulan süreçler.",
    audience: "employee",
    tab: "guides",
    tags: ["çalışan rehberi"],
    body: `Çalışan Rehberi

1. Karşılama
Nexus HR çalışma alanında tüm özlük ve izin işlemleriniz şirket kiracınıza özeldir.

2. İlk gün
• Yöneticiniz ve İK ile 15 dakikalık tanışma
• Araç erişimleri (e-posta, sohbet, İK paneli)
• Çalışan rehberi ve şirket politikalarını okuma

3. İletişim
Acil özlük soruları için İK paneli > Mevzuat veya Bilgi Üssü’ndeki ilgili kart.

4. Çalışma düzeni
Salı ve Perşembe ofis günüdür. 5 iş gününden uzun uzaktan çalışma yönetici onayı ister.`,
  },
  {
    id: "job-desc",
    title: "Görev Tanımları",
    summary: "Rol bazlı sorumluluk, yetki sınırı ve teslim beklentisi şablonu.",
    audience: "employee",
    tab: "guides",
    tags: ["görev tanımı"],
    body: `Görev Tanımları

Amaç
Her rolün kapsamı, karar yetkisi ve başarı ölçütü yazılıdır.

Ortak maddeler
• Kapsam: günlük işler ve dönemsel teslimatlar
• Yetki: harcama, onay ve temsil sınırları
• İşbirliği: iç paydaşlar ve yükseltme yolu
• Ölçüt: kalite, süre, müşteri/çalışan etkisi

Güncelleme
Organizasyon değişince İK, ilgili yönetici ile görev tanımını revize eder. Çalışanlar yalnızca kendi rollerine açık özeti görür.`,
  },
  {
    id: "company-policy",
    title: "Şirket Politikaları",
    summary: "İzin, etik, gizlilik ve işyeri davranış kurallarının özeti.",
    audience: "employee",
    tab: "guides",
    tags: ["şirket politikası"],
    body: `Şirket Politikaları

İzin
Yıllık izin kıdeme göre 14 veya 20 iş günüdür. Talep, çıkıştan en az 5 iş günü önce iletilir.

Etik
Çıkar çatışması, hediye ve tedarikçi ilişkileri yazılı olarak bildirilir.

Gizlilik
Müşteri ve çalışan verisi KVKK kapsamında; kişisel cihazlara aktarım yasaktır.

Davranış
Saygılı iletişim, ayrımcılık yasağı ve güvenli işyeri taahhüdü geçerlidir.`,
  },
  {
    id: "labor-law",
    title: "İş Kanunu — İK özet notu",
    summary: "İzin, mesai, kıdem ve fesih için yönetici hatırlatması.",
    audience: "hr_only",
    tab: "hr",
    tags: ["mevzuat"],
    body: `İş Kanunu — İK özet notu (iç kullanım)

Bu not hukuki mütalaa değildir; insan yöneticinin kararını destekler.

• Fazla mesai: haftalık üst sınır ve yazılı onay
• İhbar: kıdeme göre yaklaşık 2–8 hafta
• Kıdem: kural olarak 1 yıl dolunca gündeme gelir
• Fesih: gerekçe, usul ve tebligat kaydı

Anlaşmazlıkta avukat / kıdemli İK onayı alınır.`,
  },
  {
    id: "kvkk-template",
    title: "KVKK aydınlatma metni şablonu",
    summary: "İş başvurusu ve özlük süreçleri için yasal şablon.",
    audience: "hr_only",
    tab: "templates",
    tags: ["yasal şablon", "KVKK"],
    body: `KVKK Aydınlatma Metni (şablon)

Veri sorumlusu: [Şirket Unvanı]
İşlenen veriler: kimlik, iletişim, özlük, aday CV’si
Amaç: işe alım, sözleşme, yasal yükümlülük
Aktarım: yasal zorunluluk ve hizmet sağlayıcılar (barındırma)
Haklar: KVKK md. 11 başvurusu ik@[sirket].com

Şablonu hukuk birimi onaylamadan yayımlamayın.`,
  },
  {
    id: "overtime-form",
    title: "Fazla mesai onay formu",
    summary: "Yönetici onayı ve saat kaydı için doldurulabilir form taslağı.",
    audience: "hr_only",
    tab: "templates",
    tags: ["form"],
    body: `Fazla Mesai Onay Formu

Çalışan: __________    Departman: __________
Tarih: ____ / ____ / ______
Planlanan saat: ______   Amaç: ________________
Yönetici onayı: __________    İK vizesi: __________

Onaysız mesai ücret/izin karşılığı doğurmaz. Haftalık üst sınıra dikkat edin.`,
  },
  {
    id: "discipline",
    title: "Disiplin ve uyarı süreci",
    summary: "Sözlü/yazılı uyarı basamakları — yalnızca İK ve yöneticiler.",
    audience: "hr_only",
    tab: "hr",
    tags: ["yönetim", "mevzuat"],
    body: `Disiplin süreci (İK)

1. Olay kaydı ve dinleme
2. Sözlü uyarı (tutanak)
3. Yazılı uyarı
4. İş akdine etki edebilecek adımlar — hukuk + İK

Kişisel veri ve itibar korunur; çalışan dosyasına yalnızca gerekli tutanak eklenir.`,
  },
];

export function sectorKnowledgePack(sector: string, companyName: string): KnowledgeDoc[] {
  const name = companyName || "Şirket";
  const stamp = Date.now();
  const packs: Record<string, KnowledgeDoc[]> = {
    Teknoloji: [
      {
        id: `sec-tech-remote-${stamp}`,
        title: `${name} · Uzaktan çalışma ve IP politikası`,
        summary: "Kaynak kodu, cihaz ve esnek çalışma kuralları.",
        audience: "employee",
        tab: "guides",
        tags: ["şirket politikası"],
        sector: "Teknoloji",
        generated: true,
        body: `${name} — Uzaktan çalışma (teknoloji)

• Şirket cihazı veya MDM kayıtlı kişisel cihaz
• Kaynak kodu ve müşteri verisi özel depolara
• On-call rotasyonu yazılı vardiya ile
• Açık kaynak katkıları hukuk onayı ister`,
      },
      {
        id: `sec-tech-oncall-${stamp}`,
        title: "Nöbet / on-call İK notu",
        summary: "Teknoloji ekipleri için nöbet ücreti ve dinlenme.",
        audience: "hr_only",
        tab: "hr",
        tags: ["mevzuat"],
        sector: "Teknoloji",
        generated: true,
        body: `On-call İK notu\n\nNöbet süresi çalışma süresine sayılabilir. Dinlenme hakkı ve ücretlendirme toplu sözleşme / şirket skalasına göre İK tarafından netleştirilir.`,
      },
    ],
    Üretim: [
      {
        id: `sec-mfg-isg-${stamp}`,
        title: `${name} · İSG ve vardiya rehberi`,
        summary: "Kişisel koruyucu, vardiya devri ve kaza bildirimi.",
        audience: "employee",
        tab: "guides",
        tags: ["çalışan rehberi"],
        sector: "Üretim",
        generated: true,
        body: `${name} — İSG rehberi\n\n• KKD zorunluluğu saha girişinde\n• Vardiya devri yazılı teslim\n• Kaza/ramak kala 24 saat içinde İSG + İK`,
      },
    ],
    Perakende: [
      {
        id: `sec-ret-shift-${stamp}`,
        title: `${name} · Mağaza vardiya ve müşteri politikası`,
        summary: "Kasa, vardiya değişimi ve müşteri şikayet yolu.",
        audience: "employee",
        tab: "guides",
        tags: ["şirket politikası"],
        sector: "Perakende",
        generated: true,
        body: `${name} — Mağaza politikası\n\nKasa farkı tutanağı, vardiya değişiminde çift imza, müşteri şikayeti 48 saatte yöneticiye.`,
      },
    ],
    Finans: [
      {
        id: `sec-fin-conf-${stamp}`,
        title: `${name} · Gizlilik ve bilgi duvarı`,
        summary: "Müşteri hesabı, içeriden bilgi ve ekran kilidi.",
        audience: "employee",
        tab: "guides",
        tags: ["şirket politikası"],
        sector: "Finans",
        generated: true,
        body: `${name} — Finansal gizlilik\n\nMüşteri verisi yalnızca görev için. Masadan kalkınca kilit. Şüpheli işlem uyumu İK değil uyum birimine.`,
      },
    ],
    Sağlık: [
      {
        id: `sec-hlth-${stamp}`,
        title: `${name} · Hasta gizliliği ve vardiya`,
        summary: "Kişisel sağlık verisi ve nöbet teslimi.",
        audience: "employee",
        tab: "guides",
        tags: ["şirket politikası"],
        sector: "Sağlık",
        generated: true,
        body: `${name} — Sağlık çalışanı notu\n\nHasta bilgisi koridor/sohbet ortamında paylaşılmaz. Nöbet teslimi yazılı. İğne batması İSG prosedürü.`,
      },
    ],
  };
  return packs[sector] ?? packs.Teknoloji;
}

export function readStoredDocs(): KnowledgeDoc[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(KB_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as KnowledgeDoc[]) : [];
  } catch {
    return [];
  }
}

export function writeStoredDocs(docs: KnowledgeDoc[]) {
  window.sessionStorage.setItem(KB_STORAGE_KEY, JSON.stringify(docs));
}

export function loadKnowledgeDocs(): KnowledgeDoc[] {
  const stored = readStoredDocs();
  const map = new Map<string, KnowledgeDoc>();
  seedKnowledgeDocs.forEach((doc) => map.set(doc.id, doc));
  stored.forEach((doc) => map.set(doc.id, doc));
  return [...map.values()];
}

export function persistKnowledgeDocs(docs: KnowledgeDoc[]) {
  const extras = docs.filter(
    (doc) => doc.generated || doc.custom || !seedKnowledgeDocs.some((seed) => seed.id === doc.id),
  );
  writeStoredDocs(extras);
}

export function mergeKnowledgeDocs(extra: KnowledgeDoc[]) {
  const merged = loadKnowledgeDocs();
  extra.forEach((doc) => {
    const i = merged.findIndex((item) => item.id === doc.id);
    if (i >= 0) merged[i] = doc;
    else merged.push(doc);
  });
  persistKnowledgeDocs(merged);
  return merged;
}
