"use client";

import Link from "next/link";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { LEGAL_DOCS, type LegalDocId } from "@/lib/legal-docs";

type LegalLinksProps = {
  className?: string;
  onOpen?: (id: LegalDocId) => void;
};

export function LegalLinks({ className = "", onOpen }: LegalLinksProps) {
  const { t } = useI18n();
  return (
    <nav aria-label={t("legal.kicker")} className={`flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500 ${className}`}>
      {LEGAL_DOCS.map((item) =>
        onOpen ? (
          <button
            key={item.id}
            type="button"
            onClick={() => onOpen(item.id)}
            className="min-h-5 text-left hover:text-sky-800 hover:underline"
          >
            {t(item.titleKey)}
          </button>
        ) : (
          <Link key={item.id} href={item.href} className="min-h-5 hover:text-sky-800 hover:underline">
            {t(item.titleKey)}
          </Link>
        ),
      )}
    </nav>
  );
}
