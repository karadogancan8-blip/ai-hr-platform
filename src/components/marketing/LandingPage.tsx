"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Bot,
  Briefcase,
  Globe2,
  Palette,
  Rocket,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import { DemoRequestModal } from "@/components/marketing/DemoRequestModal";
import { LandingPlayground } from "@/components/marketing/LandingPlayground";
import { LandingPricing } from "@/components/marketing/LandingPricing";
import { LanguageSwitcher } from "@/components/language-switcher";
import { LegalLinks } from "@/components/legal/LegalLinks";
import { CommandSearchButton } from "@/components/ui/command-search-button";
import { cardSurface } from "@/components/ui/surface";
import { useI18n } from "@/components/i18n/LocaleProvider";
import type { MessageKey } from "@/lib/i18n";

const modules: { titleKey: MessageKey; descriptionKey: MessageKey; badgeKey: MessageKey; icon: typeof Briefcase; tone: string }[] = [
  { titleKey: "recruit.title", descriptionKey: "recruit.description", badgeKey: "landing.recruit.badge", icon: Briefcase, tone: "bg-blue-50 text-blue-700" },
  { titleKey: "policy.title", descriptionKey: "policy.description", badgeKey: "landing.policy.badge", icon: Bot, tone: "bg-slate-100 text-slate-700" },
  { titleKey: "onb.title", descriptionKey: "onb.description", badgeKey: "landing.onb.badge", icon: Rocket, tone: "bg-sky-50 text-sky-700" },
  { titleKey: "perf.title", descriptionKey: "perf.description", badgeKey: "landing.perf.badge", icon: BarChart3, tone: "bg-violet-50 text-violet-700" },
  { titleKey: "settings.title", descriptionKey: "settings.description", badgeKey: "landing.settings.badge", icon: Palette, tone: "bg-emerald-50 text-emerald-700" },
];

export function LandingPage() {
  const { t } = useI18n();
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <div className="min-h-full bg-[#f4f7fb] text-slate-800">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/" className="flex min-w-0 items-center gap-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#123056] text-sm font-semibold text-white">
              N
            </span>
            <span className="truncate text-sm font-semibold tracking-tight text-[#0b1f3a]">Nexus HR</span>
          </Link>
          <nav className="flex min-w-0 items-center gap-2 text-sm">
            <CommandSearchButton className="hidden md:inline-flex" />
            <LanguageSwitcher />
            <Link
              href="#modules"
              className="hidden overflow-hidden rounded-full px-3 py-2 text-slate-600 hover:bg-slate-50 lg:inline"
            >
              {t("landing.nav.modules")}
            </Link>
            <Link
              href="/fiyatlandirma"
              className="hidden overflow-hidden rounded-full px-3 py-2 text-slate-600 hover:bg-slate-50 sm:inline"
            >
              {t("pricing.nav")}
            </Link>
            <Link href="/login" className="overflow-hidden rounded-full px-3 py-2 text-slate-600 hover:bg-slate-50">
              {t("pricing.login")}
            </Link>
            <Link
              href="/login?mode=register"
              className="overflow-hidden rounded-full bg-[#123056] px-3.5 py-2 text-sm font-medium text-white hover:bg-[#0f2744]"
            >
              {t("pricing.trial")}
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-br from-[#0b1f3a] via-[#123056] to-[#1a4a7a]">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:py-20">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-sky-100">
              <Sparkles className="h-3.5 w-3.5" />
              {t("landing.badge")}
            </span>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
              {t("landing.heroTitle")}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-sky-100/90">{t("landing.heroLead")}</p>
            <p className="mt-3 text-xs font-medium uppercase tracking-[0.14em] text-sky-200/80">{t("landing.heroTrust")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/login?mode=register"
                className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#123056] shadow-lg shadow-slate-900/20 hover:bg-sky-50"
              >
                {t("pricing.trial")}
              </Link>
              <button
                type="button"
                onClick={() => setDemoOpen(true)}
                className="inline-flex items-center justify-center rounded-full border border-white/25 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                {t("landing.demoCta")}
              </button>
            </div>
          </div>

          <article className="flex min-h-[16rem] flex-col justify-between rounded-2xl border border-white/15 bg-white/10 p-6 shadow-sm backdrop-blur-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-200">G2</p>
                <p className="mt-2 text-4xl font-semibold text-white">{t("landing.g2Score")}</p>
                <p className="mt-1 text-sm text-sky-100">{t("landing.g2Label")}</p>
              </div>
              <div className="flex gap-0.5 text-amber-300">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="h-4 w-4 fill-current" />
                ))}
              </div>
            </div>
            <p className="mt-6 text-sm leading-6 text-sky-50/90">{t("landing.g2Quote")}</p>
            <p className="mt-4 text-xs text-sky-200/70">{t("landing.g2Reviews")}</p>
          </article>
        </div>
      </section>

      <section className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          <div className={`${cardSurface} min-h-[8.5rem]`}>
            <Globe2 className="h-5 w-5 text-blue-700" />
            <p className="mt-3 text-lg font-semibold text-[#0b1f3a]">{t("landing.trustCountries")}</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">{t("landing.trustCountriesHint")}</p>
          </div>
          <div className={`${cardSurface} min-h-[8.5rem]`}>
            <ShieldCheck className="h-5 w-5 text-emerald-700" />
            <p className="mt-3 text-lg font-semibold text-[#0b1f3a]">{t("landing.trustKvkk")}</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">{t("landing.trustKvkkHint")}</p>
          </div>
          <div className={`${cardSurface} min-h-[8.5rem]`}>
            <ShieldCheck className="h-5 w-5 text-slate-700" />
            <p className="mt-3 text-lg font-semibold text-[#0b1f3a]">{t("landing.trustGdpr")}</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">{t("landing.trustGdprHint")}</p>
          </div>
          <div className={`${cardSurface} min-h-[8.5rem]`}>
            <Star className="h-5 w-5 text-amber-500" />
            <p className="mt-3 text-lg font-semibold text-[#0b1f3a]">{t("landing.g2Score")}</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">{t("landing.g2Label")}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <LandingPlayground />
      </section>

      <section id="modules" className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{t("landing.modulesKicker")}</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[#0b1f3a]">{t("landing.modulesTitle")}</h2>
        <div className="mt-8 grid min-h-[18rem] gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((mod) => (
            <article key={mod.titleKey} className={`${cardSurface} min-h-[12rem]`}>
              <div className="flex items-start justify-between gap-3">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full ${mod.tone}`}>
                  <mod.icon className="h-5 w-5" />
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-700">
                  {t(mod.badgeKey)}
                </span>
              </div>
              <h3 className="mt-4 text-base font-semibold text-[#0b1f3a]">{t(mod.titleKey)}</h3>
              <p className="mt-1.5 text-sm leading-6 text-slate-500">{t(mod.descriptionKey)}</p>
            </article>
          ))}
        </div>
      </section>

      <LandingPricing />

      <footer className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-10 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          © {new Date().getFullYear()} Nexus HR · {t("landing.footer")}
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <LegalLinks />
          <Link href="/fiyatlandirma" className="font-medium text-sky-800 hover:underline">
            {t("landing.plans")}
          </Link>
        </div>
      </footer>

      <DemoRequestModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  );
}
