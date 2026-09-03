"use client";

import Link from "next/link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { LegalLinks } from "@/components/legal/LegalLinks";
import { useI18n } from "@/components/i18n/LocaleProvider";
import type { MessageKey } from "@/lib/i18n";

export function LegalDocument({ titleKey, body }: { titleKey: MessageKey; body: string[] }) {
  const { t } = useI18n();
  return (
    <div className="flex min-h-screen flex-col bg-[#f4f8fc]">
      <header className="h-16 shrink-0 border-b border-sky-100 bg-white/90">
        <div className="mx-auto flex h-full max-w-3xl items-center justify-between px-4">
          <Link href="/" className="text-sm font-semibold text-[#0b1f3a]">
            Nexus HR
          </Link>
          <LanguageSwitcher />
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">{t("legal.kicker")}</p>
        <h1 className="mt-2 text-2xl font-semibold text-[#0b1f3a]">{t(titleKey)}</h1>
        <div className="mt-6 space-y-4 text-sm leading-7 text-slate-600">
          {body.map((paragraph) => (
            <p key={paragraph.slice(0, 48)}>{paragraph}</p>
          ))}
        </div>
      </main>
      <footer className="shrink-0 border-t border-sky-100 bg-white px-4 py-6">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-400">{t("landing.footer")}</p>
          <LegalLinks />
        </div>
      </footer>
    </div>
  );
}
