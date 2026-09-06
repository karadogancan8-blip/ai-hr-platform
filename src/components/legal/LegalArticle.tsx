"use client";

import { useI18n } from "@/components/i18n/LocaleProvider";
import type { LegalDocId } from "@/lib/legal-docs";
import { LEGAL_DOCS, legalSections } from "@/lib/legal-docs";

export function LegalArticle({ docId }: { docId: LegalDocId }) {
  const { t, locale } = useI18n();
  const meta = LEGAL_DOCS.find((item) => item.id === docId);
  if (!meta) return null;
  const sections = legalSections(docId, locale);

  return (
    <article className="min-h-[32rem]">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">{t("legal.kicker")}</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#0b1f3a]">{t(meta.titleKey)}</h1>
      <p className="mt-3 min-h-[3.5rem] text-sm leading-7 text-slate-600">{t(meta.summaryKey)}</p>
      <p className="mt-2 text-xs text-slate-400">{t("legal.updated")}</p>
      <div className="mt-8 space-y-8">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-sm font-semibold text-[#0b1f3a]">{section.heading}</h2>
            <div className="mt-2 space-y-3 text-sm leading-7 text-slate-600">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 72)}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
      <p className="mt-10 min-h-[1.25rem] text-xs text-slate-400">{t("legal.contact")}</p>
    </article>
  );
}
