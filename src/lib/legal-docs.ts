import type { Locale, MessageKey } from "@/lib/i18n";

export type LegalDocId = "privacy" | "terms" | "kvkk" | "cookies";

export type LegalSection = {
  heading: string;
  paragraphs: string[];
};

export type LegalDocMeta = {
  id: LegalDocId;
  href: string;
  titleKey: MessageKey;
  summaryKey: MessageKey;
};

export const LEGAL_DOCS: LegalDocMeta[] = [
  { id: "privacy", href: "/gizlilik", titleKey: "legal.privacy", summaryKey: "legal.privacy.summary" },
  { id: "terms", href: "/kullanim-sartlari", titleKey: "legal.terms", summaryKey: "legal.terms.summary" },
  { id: "kvkk", href: "/kvkk", titleKey: "legal.kvkk", summaryKey: "legal.kvkk.summary" },
  { id: "cookies", href: "/cerez-politikasi", titleKey: "legal.cookies", summaryKey: "legal.cookies.summary" },
];

export const LEGAL_HREF: Record<LegalDocId, string> = {
  privacy: "/gizlilik",
  terms: "/kullanim-sartlari",
  kvkk: "/kvkk",
  cookies: "/cerez-politikasi",
};

export function legalDocByHref(pathname: string) {
  return LEGAL_DOCS.find((doc) => doc.href === pathname) ?? null;
}

const TR: Record<LegalDocId, LegalSection[]> = {
  privacy: [
    {
      heading: "1. Kapsam ve veri sorumlusu",
      paragraphs: [
        "Bu Gizlilik Politikası, Nexus HR adlı çok kiracılı B2B insan kaynakları yazılımının (SaaS) hesap açılışı, özgeçmiş analizi, izin, performans, bilgi üssü ve faturalandırma süreçlerinde işlenen kişisel verilere uygulanır.",
        "Müşteri şirket (işveren), kendi çalışan ve aday verileri bakımından KVKK ve GDPR kapsamında veri sorumlusudur. Nexus HR, yazılı sözleşmeye ve müşteri talimatına bağlı olarak veri işleyen (processor) sıfatıyla hizmet sunar.",
      ],
    },
    {
      heading: "2. İşlenen veri kategorileri",
      paragraphs: [
        "Hesap verileri: yetkili kullanıcı adı, iş e-postası, şirket unvanı, rol ve oturum kayıtları.",
        "İK içerikleri: özgeçmiş metni ve ekleri, aday değerlendirme özetleri, izin ve özlük kayıtları, performans notları, oryantasyon planları, yüklenen politikalar.",
        "Teknik veriler: IP adresi, tarayıcı türü, güvenlik günlükleri, dil tercihi ve abonelik durumu. Kart numarası, SKT ve CVC Nexus HR sunucularında saklanmaz; ödeme sağlayıcısının PCI DSS uyumlu altyapısında işlenir.",
      ],
    },
    {
      heading: "3. Yapay zekâ ile işleme",
      paragraphs: [
        "CV analizi, mülakat rehberi, mevzuat asistanı ve benzeri özellikler, müşteri tarafından girilen metni büyük dil modellerine (ör. Google Gemini ve yapılandırılmışsa Anthropic) iletebilir. Aktarım yalnızca talep edilen analizi üretmek içindir.",
        "Model çıktıları bağlayıcı hukuki karar, işe alım kararı veya disiplin işlemi değildir; karar destek niteliğindedir. Ayrımcılık yasağı, KVKK ve iş hukuku uyumu müşteri şirkete aittir. Nexus HR, müşteri verisini kendi temel modellerini eğitmek için kullanmaz.",
      ],
    },
    {
      heading: "4. Supabase ve güvenlik",
      paragraphs: [
        "Kimlik doğrulama ve uygulama veritabanı Supabase (PostgreSQL) üzerinde barındırılır. Kiracı izolasyonu şirket kimliği (company_id) ve satır düzeyi güvenlik politikaları (RLS) ile uygulanır; bir müşterinin kayıtları başka bir müşteri kiracısına açılmaz.",
        "Veriler iletimde TLS ile korunur. Erişim, oturum belirteçleri ve yetki rolleriyle sınırlanır. Yedekleme ve erişim günlükleri hizmetin sürekliliği ve güvenlik olaylarının incelenmesi için tutulur.",
      ],
    },
    {
      heading: "5. Saklama, paylaşım ve haklar",
      paragraphs: [
        "Veriler, sözleşme süresi ve ilgili mevzuatın (ör. iş hukuku, vergi) zorunlu kıldığı süre boyunca saklanır. Alt işlemciler: barındırma (Supabase), yapay zekâ çıkarımı (model sağlayıcıları) ve isteğe bağlı ödeme (Stripe). Aktarım, sözleşme maddeleri ve kiracı sınırlarıyla kısıtlanır.",
        "Erişim, düzeltme, silme, aktarılabilirlik ve itiraz talepleri önce müşteri şirketin İK / KVKK birimine yöneltilmelidir. Nexus HR, veri işleyen olarak talimat üzerine destek sağlar. İletişim: privacy@nexus-hr.example.",
      ],
    },
  ],
  terms: [
    {
      heading: "1. Taraflar ve kabul",
      paragraphs: [
        "Bu Kullanım Şartları, Nexus HR hesabı açan tüzel kişi müşteri ile yetkili kullanıcıları bağlar. Kaydı tamamlayan kişi, şirketi temsil etmeye yetkili olduğunu beyan eder.",
        "Hizmet, seçilen abonelik paketine (STARTER / PRO / ENTERPRISE) ve yayınlanan belgelere göre sunulur. Şartların güncellenmesi hesap içi bildirim veya site yayını ile duyurulur; hizmeti kullanmaya devam etmek kabul anlamına gelir.",
      ],
    },
    {
      heading: "2. Lisans ve kabul edilebilir kullanım",
      paragraphs: [
        "Müşteriye, kendi İK operasyonu için münhasır olmayan, devredilemez bir kullanım hakkı tanınır. Hizmeti yeniden satmak, tersine mühendislik yapmak, başka müşterilerin kiracı alanına erişmeye çalışmak veya zararlı yazılım yüklemek yasaktır.",
        "Yüklenen özgeçmiş ve personel verilerinde aday / çalışan bilgilendirmesi ve gerekli hukuki dayanak (açık rıza, sözleşme, meşru menfaat) müşterinin sorumluluğundadır. Platformu hukuka aykırı ayrımcılık veya yanıltıcı otomasyon için kullanmak sözleşmenin ağır ihlalidir.",
      ],
    },
    {
      heading: "3. Yapay zekâ karar destek ve sorumluluk sınırları",
      paragraphs: [
        "Yapay zekâ skorları, özetler ve öneriler “olduğu gibi” sunulan karar destek çıktısıdır. Nexus HR; işe alım, terfi, fesih veya ücret kararlarının doğruluğunu, eksiksizliğini veya belirli bir sonuca ulaşacağını taahhüt etmez.",
        "Kesinti, model sağlayıcı kotası, internet arızası veya üçüncü taraf kesintilerinden doğan dolaylı zararlardan, yürürlükteki zorunlu hükümler saklı kalmak kaydıyla, Nexus HR sorumlu tutulamaz. Toplam sorumluluk, ihlale yol açan olaydan önceki on iki aydaki ücretlerle sınırlıdır (kasıt ve ağır ihmal hariç).",
      ],
    },
    {
      heading: "4. Hesap, ödeme ve fesih",
      paragraphs: [
        "Kimlik bilgilerinin gizliliği ve yetkisiz erişimin bildirimi müşteriye aittir. Ücretler seçilen plana göre tahsil edilir; başarılı ödeme sonrası abonelik durumu ACTIVE olarak işlenir.",
        "Taraflar, yürürlükteki plana ve kanuni haklara uygun olarak hesabı sona erdirebilir. Fesih sonrası müşteri verisi, yasal saklama yükümlülükleri saklı kalmak üzere silinir veya anonimleştirilir. Uygulanacak hukuk: Türkiye Cumhuriyeti hukuku; yetkili merci İstanbul mahkemeleri ve icra daireleridir (tüketici ise ilgili zorunlu hükümler saklıdır).",
      ],
    },
  ],
  kvkk: [
    {
      heading: "1. Aydınlatmanın dayanağı",
      paragraphs: [
        "Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) md. 10 ve Avrupa Birliği Genel Veri Koruma Tüzüğü (GDPR) md. 13–14 uyarınca hazırlanmış bir aydınlatma / privacy notice belgesidir.",
        "Nexus HR’ı kullanan işveren şirket, çalışan ve aday verileri için veri sorumlusudur. Nexus HR, veri işleyen olarak barındırma, uygulama mantığı ve talep üzerine yapay zekâ çıkarımı sağlar.",
      ],
    },
    {
      heading: "2. İşleme amaçları ve hukuki sebepler",
      paragraphs: [
        "Amaçlar: İK süreçlerinin yürütülmesi, işe alım ve performans karar desteği, izin / özlük takibi, bilgi güvenliği, faturalandırma ve yasal yükümlülüklerin yerine getirilmesi.",
        "Hukuki sebepler müşteri şirketin konumuna göre değişir: iş sözleşmesinin ifası, meşru menfaat (güvenlik ve hizmet iyileştirme), açık rıza (özel nitelikli veri veya pazarlama gibi hallerde) ve kanuni yükümlülük.",
      ],
    },
    {
      heading: "3. Yapay zekâ ve uluslararası aktarım",
      paragraphs: [
        "Analiz için metinler, müşteri talebi üzerine Avrupa veya diğer bölgelerde bulunan model sağlayıcılarına iletilebilir. Bu aktarım, standart sözleşme maddeleri, şifreli iletim ve amaçla sınırlı işleme ile çerçevelenir.",
        "Özel nitelikli kişisel verilerin (sağlık raporu, sendika, inanç vb.) platforma yüklenmesi müşterinin açık rıza ve KVKK md. 6 uyumunu gerektirir. Nexus HR bu kategorileri talep etmez; yanlışlıkla yüklenirse müşteri silme talimatı vermelidir.",
      ],
    },
    {
      heading: "4. Veri güvenliği (Supabase) ve haklar",
      paragraphs: [
        "Supabase üzerindeki PostgreSQL veritabanında kiracı ayrımı, RLS politikaları, kimlik doğrulama ve TLS kullanılır. Yetkisiz çapraz kiracı erişimi teknik ve idari tedbirlerle engellenir.",
        "KVKK md. 11 ve GDPR md. 15–22 kapsamındaki başvuru (erişim, düzeltme, silme, itiraz, kısıtlama, taşınabilirlik) veri sorumlusuna, yani müşteri şirkete yapılır. Şikâyet: Kişisel Verileri Koruma Kurulu (Türkiye) veya yerleşim yerindeki yetkili denetim otoritesi. Nexus HR destek adresi: privacy@nexus-hr.example.",
      ],
    },
  ],
  cookies: [
    {
      heading: "1. Çerez nedir?",
      paragraphs: [
        "Çerezler, tarayıcınıza kaydedilen küçük metin dosyalarıdır. Nexus HR, B2B SaaS oturumu, güvenlik ve dil tercihi için çerez ve benzeri depolama (localStorage) kullanır.",
      ],
    },
    {
      heading: "2. Kullandığımız çerezler",
      paragraphs: [
        "Zorunlu çerezler: Supabase kimlik doğrulama oturumu, CSRF / güvenlik ve yük dengeleme. Bunlar olmadan panele giriş ve kiracı izolasyonu çalışmaz.",
        "İşlevsel depolama: arayüz dil tercihi (nexus-locale) ve bazı modül taslakları tarayıcıda tutulabilir. Bu veriler reklam profillemesi için kullanılmaz.",
        "Ödeme: Stripe veya benzeri sağlayıcı, 3D Secure doğrulaması için kendi çerezlerini ve iframe’lerini kullanabilir. Kart verisi Nexus HR çerezlerine yazılmaz.",
      ],
    },
    {
      heading: "3. Üçüncü taraflar, yapay zekâ ve tercih",
      paragraphs: [
        "Yapay zekâ API çağrıları çerezle tetiklenmez; oturum açmış kullanıcının isteğiyle sunucu üzerinden gider. Analitik veya pazarlama çerezi varsayılan olarak açılmaz; eklenirse ayrı rıza alınır.",
        "Tarayıcı ayarlarından çerezleri silebilirsiniz. Zorunlu çerezleri kapatmak oturumun düşmesine yol açar. Ayrıntılı veri işleme için Gizlilik Politikası ve KVKK / GDPR aydınlatma metnine bakın.",
      ],
    },
  ],
};

const EN: Record<LegalDocId, LegalSection[]> = {
  privacy: [
    {
      heading: "1. Scope and roles",
      paragraphs: [
        "This Privacy Policy applies to personal data processed in Nexus HR, a multi-tenant B2B human-resources SaaS product, including account creation, CV analysis, leave, performance, knowledge base and billing.",
        "The customer employer is the controller of employee and candidate data under KVKK and the GDPR. Nexus HR acts as a processor under the customer contract and documented instructions.",
      ],
    },
    {
      heading: "2. Categories of data",
      paragraphs: [
        "Account data: authorised user name, work email, company name, role and session records.",
        "HR content: CV text and attachments, candidate assessments, leave and personnel records, performance notes, onboarding plans and uploaded policies.",
        "Technical data: IP address, browser type, security logs, language preference and subscription status. Card number, expiry and CVC are not stored on Nexus HR servers; they are handled in the payment provider’s PCI DSS environment.",
      ],
    },
    {
      heading: "3. Artificial-intelligence processing",
      paragraphs: [
        "CV analysis, interview guides, the policy assistant and similar features may send customer-entered text to large language models (for example Google Gemini and, if configured, Anthropic) solely to produce the requested analysis.",
        "Model output is decision support, not a binding legal, hiring or disciplinary decision. Compliance with non-discrimination, KVKK and labour law remains the customer’s duty. Nexus HR does not use customer data to train its own foundation models.",
      ],
    },
    {
      heading: "4. Supabase and security",
      paragraphs: [
        "Authentication and the application database are hosted on Supabase (PostgreSQL). Tenant isolation is enforced with a company identifier (company_id) and row-level security (RLS); one customer’s records are not exposed to another tenant.",
        "Data in transit is protected with TLS. Access is limited by session tokens and roles. Backups and access logs support continuity and security investigations.",
      ],
    },
    {
      heading: "5. Retention, sharing and rights",
      paragraphs: [
        "Data is kept for the contract term and any period required by law (for example labour or tax rules). Sub-processors include hosting (Supabase), AI inference (model providers) and optional payments (Stripe). Transfers are limited by contract and tenant boundaries.",
        "Access, correction, erasure, portability and objection requests should first go to the customer’s HR / privacy team. Nexus HR assists as processor on instruction. Contact: privacy@nexus-hr.example.",
      ],
    },
  ],
  terms: [
    {
      heading: "1. Parties and acceptance",
      paragraphs: [
        "These Terms of Service bind the legal-entity customer that opens a Nexus HR account and its authorised users. The person completing registration represents that they are authorised to bind the company.",
        "The service is provided under the selected plan (STARTER / PRO / ENTERPRISE) and published documentation. Updates may be notified in-product or on the site; continued use constitutes acceptance.",
      ],
    },
    {
      heading: "2. Licence and acceptable use",
      paragraphs: [
        "The customer receives a non-exclusive, non-transferable right to use the service for its own HR operations. Resale, reverse engineering, attempts to access another tenant, or uploading malware are prohibited.",
        "The customer is responsible for candidate and employee notices and a lawful basis (consent, contract or legitimate interest) for uploaded data. Using the platform for unlawful discrimination or deceptive automation is a material breach.",
      ],
    },
    {
      heading: "3. AI decision support and liability",
      paragraphs: [
        "AI scores, summaries and suggestions are provided “as is” as decision support. Nexus HR does not warrant that hiring, promotion, termination or pay decisions will be accurate, complete or produce a particular outcome.",
        "Subject to mandatory law, Nexus HR is not liable for indirect loss arising from downtime, model-provider quotas, internet failure or third-party outages. Aggregate liability is capped at fees paid in the twelve months before the event (except wilful misconduct or gross negligence).",
      ],
    },
    {
      heading: "4. Accounts, payment and termination",
      paragraphs: [
        "The customer must keep credentials confidential and report unauthorised access. Fees are charged under the selected plan; after successful payment the subscription status is set to ACTIVE.",
        "Either party may end the account in line with the plan and statutory rights. After termination, customer data is deleted or anonymised subject to legal retention. Governing law: Republic of Türkiye; courts of Istanbul (mandatory consumer rules reserved where applicable).",
      ],
    },
  ],
  kvkk: [
    {
      heading: "1. Legal basis of this notice",
      paragraphs: [
        "This notice is issued under Article 10 of Türkiye’s Law No. 6698 on the Protection of Personal Data (KVKK) and Articles 13–14 of the EU General Data Protection Regulation (GDPR).",
        "The employer using Nexus HR is the controller of employee and candidate data. Nexus HR is the processor for hosting, application logic and on-demand AI inference.",
      ],
    },
    {
      heading: "2. Purposes and lawful bases",
      paragraphs: [
        "Purposes include running HR workflows, recruitment and performance decision support, leave and personnel tracking, information security, billing and legal compliance.",
        "Lawful bases depend on the customer’s context: performance of an employment contract, legitimate interest (security and service integrity), consent (for special-category or marketing cases) and legal obligation.",
      ],
    },
    {
      heading: "3. AI and international transfers",
      paragraphs: [
        "On the customer’s request, text may be sent to model providers in the EEA or other regions. Transfers are framed by standard contractual clauses, encryption in transit and purpose limitation.",
        "Uploading special-category data (health, trade union, belief, etc.) requires the customer’s KVKK Article 6 compliance. Nexus HR does not solicit these categories; if uploaded in error the customer should instruct deletion.",
      ],
    },
    {
      heading: "4. Security (Supabase) and rights",
      paragraphs: [
        "The PostgreSQL database on Supabase uses tenant separation, RLS policies, authentication and TLS. Unauthorised cross-tenant access is prevented by technical and organisational measures.",
        "Requests under KVKK Article 11 and GDPR Articles 15–22 (access, rectification, erasure, objection, restriction, portability) must be made to the controller — the customer company. Complaints may be filed with Türkiye’s Personal Data Protection Board or the supervisory authority of the data subject’s residence. Processor support: privacy@nexus-hr.example.",
      ],
    },
  ],
  cookies: [
    {
      heading: "1. What cookies are",
      paragraphs: [
        "Cookies are small text files stored in your browser. Nexus HR uses cookies and similar storage (localStorage) for B2B SaaS sessions, security and language preference.",
      ],
    },
    {
      heading: "2. Cookies we use",
      paragraphs: [
        "Strictly necessary: Supabase authentication session, CSRF / security and load balancing. The product cannot log you in or isolate tenants without them.",
        "Functional storage: UI language (nexus-locale) and some module drafts may be kept in the browser. They are not used for advertising profiles.",
        "Payments: Stripe or a similar provider may set its own cookies and iframes for 3D Secure. Card data is not written into Nexus HR cookies.",
      ],
    },
    {
      heading: "3. Third parties, AI and choices",
      paragraphs: [
        "AI API calls are not cookie-triggered; they run on the server after an authenticated user request. Analytics or marketing cookies are off by default; if added later, separate consent will be collected.",
        "You may delete cookies in browser settings. Blocking strictly necessary cookies will drop the session. See the Privacy Policy and KVKK / GDPR notice for full processing details.",
      ],
    },
  ],
};

export function legalSections(id: LegalDocId, locale: Locale): LegalSection[] {
  return locale === "en" ? EN[id] : TR[id];
}
