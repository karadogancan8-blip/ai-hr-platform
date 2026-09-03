"use client";

import { LegalDocument } from "@/components/legal/LegalDocument";
import { useI18n } from "@/components/i18n/LocaleProvider";

const BODY = {
  tr: [
    "Nexus HR, 6698 sayılı KVKK ve AB Genel Veri Koruma Tüzüğü (GDPR) ilkelerine uygun çok kiracılı bir altyapı kullanır.",
    "Veri sorumlusu, platformu kullanan işveren şirkettir. Nexus HR, veri işleyen sıfatıyla talimatlarınız doğrultusunda barındırma ve yapay zeka karar destek hizmeti sunar.",
    "Özgeçmiş ve performans metinleri Gemini gibi model sağlayıcılarına yalnızca analiz için iletilebilir. Çıktılar bağlayıcı hukuki karar değildir; nihai sorumluluk insan yöneticidedir.",
    "KVKK md. 11 kapsamındaki başvurularınızı şirketinizdeki ilgili kişiye yöneltebilirsiniz. Uluslararası aktarım, standart sözleşme maddeleri ve kiracı izolasyonu ile sınırlanır.",
  ],
  en: [
    "Nexus HR is operated in line with Türkiye’s KVKK and the EU GDPR on a multi-tenant architecture.",
    "The employer company is the controller. Nexus HR acts as a processor for hosting and AI decision-support.",
    "CV and performance text may be sent to model providers such as Gemini solely for analysis. Outputs are not binding legal decisions.",
    "KVKK Article 11 and GDPR data-subject requests should be directed to your company. International transfers are limited by contractual clauses and tenant isolation.",
  ],
};

export default function KvkkPage() {
  const { locale } = useI18n();
  return <LegalDocument titleKey="legal.kvkk" body={BODY[locale]} />;
}
