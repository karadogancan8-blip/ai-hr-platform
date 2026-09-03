"use client";

import { useI18n } from "@/components/i18n/LocaleProvider";

export const AI_DISCLAIMER_TEXT =
  "⚖️ Decision Support System: Bu çıktı Gemini 1.5 AI tahminleme modelleriyle üretilmiştir. KVKK ve İş Kanunu gereği nihai karar ve sorumluluk insan yöneticidedir.";

export function AiDisclaimer({ className = "" }: { className?: string }) {
  const { t } = useI18n();
  return (
    <p
      className={`rounded-xl border border-amber-100 bg-amber-50/80 px-3 py-2 text-[11px] leading-5 text-amber-950 ${className}`}
    >
      {t("ai.disclaimer")}
    </p>
  );
}
