"use client";

import Link from "next/link";
import { Bot, ClipboardList, Clock, FileSearch, Sparkles, TrendingUp } from "lucide-react";
import { dashboardStats, liveOperations, recentActivity } from "@/lib/mock-data";
import { CompanyPulseCard } from "@/components/dashboard/CompanyPulseCard";
import { CompanyWall } from "@/components/social/CompanyWall";
import { HelpTitle } from "@/components/ui/HelpTip";
import { cardSurface, cardSurfaceFlush, cardTitle, moduleStripe, pageLead, pageTitle } from "@/components/ui/surface";
import { useI18n } from "@/components/i18n/LocaleProvider";
import type { MessageKey } from "@/lib/i18n";

const shortcuts: { href: string; labelKey: MessageKey; icon: typeof FileSearch; iconClass: string }[] = [
  { href: "/ise-alim", labelKey: "dashboard.link.recruit", icon: FileSearch, iconClass: "bg-blue-100 text-blue-700" },
  { href: "/izin", labelKey: "dashboard.link.leave", icon: ClipboardList, iconClass: "bg-emerald-100 text-emerald-700" },
  { href: "/puantaj", labelKey: "dashboard.link.timesheet", icon: Clock, iconClass: "bg-emerald-100 text-emerald-700" },
  { href: "/sosyal", labelKey: "dashboard.link.wall", icon: Sparkles, iconClass: "bg-amber-100 text-amber-800" },
  { href: "/mevzuat", labelKey: "dashboard.link.policy", icon: Bot, iconClass: "bg-indigo-100 text-indigo-700" },
  { href: "/performans", labelKey: "dashboard.link.performance", icon: TrendingUp, iconClass: "bg-indigo-100 text-indigo-700" },
];

const feed = [
  ...liveOperations.map((item) => ({ ...item, kind: "live" as const })),
  ...recentActivity.map((item) => ({ ...item, live: false, kind: "done" as const })),
];

const STAT_STRIPE: Record<string, string> = {
  "open-roles": moduleStripe.recruit,
  "cv-pipeline": moduleStripe.recruit,
  "policy-qa": moduleStripe.performance,
  "pending-leave": moduleStripe.leave,
};

function PulseDot({ live }: { live?: boolean }) {
  if (!live) {
    return <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-slate-300" />;
  }
  return (
    <span className="relative mt-1.5 flex h-2.5 w-2.5 shrink-0">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-50" />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-indigo-600" />
    </span>
  );
}

export function DashboardOverview() {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <div>
        <h1 className={pageTitle}>
          <HelpTitle hint={t("dashboard.hint")}>{t("dashboard.title")}</HelpTitle>
        </h1>
        <p className={pageLead}>{t("dashboard.description")}</p>
      </div>

      <section className="grid min-h-[42rem] items-stretch gap-5 lg:grid-cols-3">
        <div className="flex min-h-[42rem] flex-col gap-5 lg:col-span-2">
          <div className="grid min-h-[13.5rem] shrink-0 grid-cols-2 gap-4">
            {dashboardStats.map((stat) => (
              <article key={stat.id} className={`${cardSurface} ${STAT_STRIPE[stat.id] ?? ""}`}>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{stat.label}</p>
                <div className="mt-3 flex items-end justify-between gap-2">
                  <p className="text-3xl font-bold tracking-tight text-slate-900">{stat.value}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      stat.trend === "up" ? "bg-emerald-100 text-emerald-800" : "bg-indigo-100 text-indigo-800"
                    }`}
                  >
                    {stat.delta}
                  </span>
                </div>
                <p className="mt-3 text-xs leading-5 text-slate-500">{stat.hint}</p>
              </article>
            ))}
          </div>

          <article className={`flex min-h-[26rem] flex-1 flex-col overflow-hidden ${cardSurfaceFlush} ${moduleStripe.performance}`}>
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="text-lg font-bold text-slate-900">{t("dashboard.activity")}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-700">{t("dashboard.liveLead")}</p>
            </div>
            <ul className="min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto">
              {feed.map((item) => (
                <li key={`${item.kind}-${item.id}`} className="flex items-start gap-3 px-6 py-3.5">
                  <PulseDot live={item.live} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900">{item.title}</p>
                    <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-slate-500">{item.agent}</p>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-slate-500">{item.time}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>

        <aside className={`flex min-h-[42rem] flex-col overflow-hidden ${cardSurface} ${moduleStripe.performance}`}>
          <h2 className={cardTitle}>{t("dashboard.quick")}</h2>
          <p className="-mt-2 mb-4 text-sm leading-6 text-slate-700">{t("dashboard.quickLead")}</p>
          <div className="mt-6 flex flex-1 flex-col gap-2.5">
            {shortcuts.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center gap-3 overflow-hidden rounded-full border border-slate-200/80 bg-white/90 px-3.5 py-3 text-sm font-medium text-slate-800 transition-all hover:border-indigo-300 hover:bg-indigo-50/50"
                >
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full ${item.iconClass}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 truncate">{t(item.labelKey)}</span>
                </Link>
              );
            })}
          </div>
        </aside>
      </section>

      <CompanyWall variant="compact" />

      <CompanyPulseCard />
    </div>
  );
}
