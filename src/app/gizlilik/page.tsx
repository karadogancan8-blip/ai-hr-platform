"use client";

import { LegalDocument } from "@/components/legal/LegalDocument";
import { useI18n } from "@/components/i18n/LocaleProvider";

const BODY = {
  tr: [
    "Nexus HR, çok kiracılı bir insan kaynakları yazılımıdır. Bu gizlilik politikası, hesap açılışı, özgeçmiş analizi ve izin süreçlerinde işlenen kişisel verilerin nasıl korunduğunu açıklar.",
    "Toplanan veriler kimlik, iletişim, özgeçmiş içeriği, performans notları ve oturum kayıtlarıyla sınırlıdır. Veriler şirketinizin kiracı alanında tutulur; diğer müşterilerle paylaşılmaz.",
    "Veriler, hizmeti sunmak, güvenliği sağlamak ve yasal yükümlülükleri yerine getirmek amacıyla işlenir. Saklama süresi, sözleşmenin ve ilgili mevzuatın gerektirdiği süreyle orantılıdır.",
    "Haklarınız kapsamında erişim, düzeltme, silme ve itiraz taleplerinizi şirket İK biriminize veya privacy@nexus-hr.example adresine iletebilirsiniz.",
  ],
  en: [
    "Nexus HR is a multi-tenant human-resources application. This policy explains how personal data in accounts, CV analysis and leave workflows is protected.",
    "We process identity, contact, CV content, performance notes and session records. Data is isolated per company tenant and is not shared with other customers.",
    "Processing supports service delivery, security and legal duties. Retention follows the contract and applicable law.",
    "You may request access, correction, erasure or objection via your HR team or privacy@nexus-hr.example.",
  ],
};

export default function PrivacyPage() {
  const { locale } = useI18n();
  return <LegalDocument titleKey="legal.privacy" body={BODY[locale]} />;
}
