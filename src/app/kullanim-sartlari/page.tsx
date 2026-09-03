"use client";

import { LegalDocument } from "@/components/legal/LegalDocument";
import { useI18n } from "@/components/i18n/LocaleProvider";

const BODY = {
  tr: [
    "Bu kullanım şartları, Nexus HR hesabı açan şirket ve yetkili kullanıcıları bağlar.",
    "Hesap bilgilerinizi gizli tutmak, yalnızca yetkili personele erişim vermek ve yüklenen özgeçmişlerde adayların açık rızasını sağlamak sizin yükümlülüğünüzdür.",
    "Hizmet “olduğu gibi” sunulur. Yapay zeka skorları ve metinleri karar destek niteliğindedir; ayrımcılık yasağı ve iş hukuku kurallarına uyum kullanıcıya aittir.",
    "Sözleşme, ilgili tarifeye göre sona erene veya hesap kapatılana kadar yürürlükte kalır. Uyuşmazlıklarda Türkiye Cumhuriyeti hukuku uygulanır.",
  ],
  en: [
    "These terms bind the company that opens a Nexus HR account and its authorised users.",
    "You must keep credentials confidential, grant access only to authorised staff, and obtain candidate consent for uploaded CVs.",
    "The service is provided as-is. AI scores are decision support; compliance with labour and non-discrimination law remains yours.",
    "The agreement continues until the plan ends or the account is closed. The laws of the Republic of Türkiye apply.",
  ],
};

export default function TermsPage() {
  const { locale } = useI18n();
  return <LegalDocument titleKey="legal.terms" body={BODY[locale]} />;
}
