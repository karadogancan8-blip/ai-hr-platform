"use client";

import Link from "next/link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { LegalLinks } from "@/components/legal/LegalLinks";
import { useI18n } from "@/components/i18n/LocaleProvider";

export function PublicChrome({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-800">
      <header className="h-16 shrink-0 border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#123056] text-sm font-semibold text-white">
              N
            </span>
            <span className="text-sm font-semibold tracking-tight text-slate-900">Nexus HR</span>
          </Link>
          <nav className="flex items-center gap-2 text-sm">
            <LanguageSwitcher />
            <Link href="/fiyatlandirma" className="hidden rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100 sm:inline">
              {t("pricing.nav")}
            </Link>
            <Link href="/login" className="rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100">
              {t("pricing.login")}
            </Link>
            <Link
              href="/login?mode=register"
              className="rounded-xl bg-[#123056] px-3.5 py-2 text-sm font-medium text-white hover:bg-[#0f2744]"
            >
              {t("pricing.trial")}
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-10 sm:px-6">{children}</main>
      <footer className="shrink-0 border-t border-slate-200/80 bg-white px-4 py-5 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-400">{t("landing.footer")}</p>
          <LegalLinks />
        </div>
      </footer>
    </div>
  );
}
