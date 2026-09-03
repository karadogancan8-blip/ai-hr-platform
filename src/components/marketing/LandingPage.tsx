"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Bot,
  Briefcase,
  Palette,
  Rocket,
  ShieldCheck,
  Sparkles,
  Timer,
  Zap,
} from "lucide-react";
import { DemoRequestModal } from "@/components/marketing/DemoRequestModal";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useI18n } from "@/components/i18n/LocaleProvider";
import type { MessageKey } from "@/lib/i18n";

const modules: { titleKey: MessageKey; descriptionKey: MessageKey; badgeKey: MessageKey; icon: typeof Briefcase }[] = [
  { titleKey: "recruit.title", descriptionKey: "recruit.description", badgeKey: "landing.recruit.badge", icon: Briefcase },
  { titleKey: "policy.title", descriptionKey: "policy.description", badgeKey: "landing.policy.badge", icon: Bot },
  { titleKey: "onb.title", descriptionKey: "onb.description", badgeKey: "landing.onb.badge", icon: Rocket },
  { titleKey: "perf.title", descriptionKey: "perf.description", badgeKey: "landing.perf.badge", icon: BarChart3 },
  { titleKey: "settings.title", descriptionKey: "settings.description", badgeKey: "landing.settings.badge", icon: Palette },
];

const stats = [
  { value: "%85", label: "Zaman tasarrufu", icon: Timer, hint: "Manuel tarama ve evrak döngülerinde" },
  { value: "10x", label: "Hızlı işe alım", icon: Zap, hint: "İlk elemeden mülakat rehberine" },
  { value: "KVKK & GDPR", label: "Uyumlu altyapı", icon: ShieldCheck, hint: "Kiracı izolasyonu ve denetim izi" },
];

export function LandingPage() {
  const { t } = useI18n();
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <div className="min-h-full bg-[#f4f8fc] text-slate-800">
      <header className="border-b border-sky-100/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#123056] text-sm font-semibold text-white">
              N
            </span>
            <span className="text-sm font-semibold tracking-tight text-[#0b1f3a]">Nexus HR</span>
          </Link>
          <nav className="flex items-center gap-2 text-sm">
            <LanguageSwitcher />
            <Link href="/fiyatlandirma" className="hidden rounded-lg px-3 py-2 text-slate-600 hover:bg-sky-50 sm:inline">
              {t("pricing.nav")}
            </Link>
            <Link href="/login" className="rounded-lg px-3 py-2 text-slate-600 hover:bg-sky-50">
              {t("pricing.login")}
            </Link>
            <Link
              href="/login"
              className="rounded-xl bg-[#123056] px-3.5 py-2 text-sm font-medium text-white hover:bg-[#0f2744]"
            >
              {t("pricing.trial")}
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-br from-[#0b1f3a] via-[#123056] to-[#1a4a7a]">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:py-24">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-sky-100">
              <Sparkles className="h-3.5 w-3.5" />
              {t("landing.badge")}
            </span>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
              {t("landing.heroTitle")}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-sky-100/90">{t("landing.heroLead")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#123056] shadow-lg shadow-slate-900/20 hover:bg-sky-50"
              >
                {t("pricing.trial")}
              </Link>
              <button
                type="button"
                onClick={() => setDemoOpen(true)}
                className="inline-flex items-center justify-center rounded-xl border border-white/25 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                {t("landing.demoCta")}
              </button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {stats.map((item) => (
              <div
                key={item.label}
                className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-4 backdrop-blur-sm"
              >
                <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-sky-200" />
                <div>
                  <p className="text-lg font-semibold text-white">{item.value}</p>
                  <p className="text-sm font-medium text-sky-100">{item.label}</p>
                  <p className="mt-0.5 text-xs text-sky-200/70">{item.hint}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">{t("landing.modulesKicker")}</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[#0b1f3a]">{t("landing.modulesTitle")}</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((mod) => (
            <article
              key={mod.titleKey}
              className="rounded-2xl border border-sky-100 bg-white p-5 shadow-[0_8px_30px_rgba(15,55,95,0.06)]"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-[#123056]">
                  <mod.icon className="h-5 w-5" />
                </span>
                <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-sky-800">
                  {t(mod.badgeKey)}
                </span>
              </div>
              <h3 className="mt-4 text-base font-semibold text-[#0b1f3a]">{t(mod.titleKey)}</h3>
              <p className="mt-1.5 text-sm leading-6 text-slate-500">{t(mod.descriptionKey)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-sky-100 bg-white">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-12 sm:grid-cols-3 sm:px-6">
          {stats.map((item) => (
            <div key={`panel-${item.label}`} className="text-center">
              <p className="text-3xl font-semibold tracking-tight text-[#123056]">{item.value}</p>
              <p className="mt-1 text-sm font-medium text-[#0b1f3a]">{item.label}</p>
              <p className="mt-1 text-xs text-slate-500">{item.hint}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-10 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>© {new Date().getFullYear()} Nexus HR · {t("landing.footer")}</p>
        <Link href="/fiyatlandirma" className="font-medium text-sky-800 hover:underline">
          {t("landing.plans")}
        </Link>
      </footer>

      <DemoRequestModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  );
}
