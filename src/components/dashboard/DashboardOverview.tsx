"use client";

import Link from "next/link";
import { Bot, ClipboardList, Clock, FileSearch, TrendingUp } from "lucide-react";
import { dashboardStats, liveOperations, recentActivity } from "@/lib/mock-data";
import { CompanyPulseCard } from "@/components/dashboard/CompanyPulseCard";
import { HelpTitle } from "@/components/ui/HelpTip";
import { useI18n } from "@/components/i18n/LocaleProvider";
import type { MessageKey } from "@/lib/i18n";

const shortcuts: { href: string; labelKey: MessageKey; icon: typeof FileSearch; iconClass: string }[] = [
  { href: "/ise-alim", labelKey: "dashboard.link.recruit", icon: FileSearch, iconClass: "bg-sky-50 text-sky-700" },
  { href: "/izin", labelKey: "dashboard.link.leave", icon: ClipboardList, iconClass: "bg-indigo-50 text-indigo-700" },
  { href: "/puantaj", labelKey: "dashboard.link.timesheet", icon: Clock, iconClass: "bg-amber-50 text-amber-700" },
  { href: "/mevzuat", labelKey: "dashboard.link.policy", icon: Bot, iconClass: "bg-violet-50 text-violet-700" },
  { href: "/performans", labelKey: "dashboard.link.performance", icon: TrendingUp, iconClass: "bg-emerald-50 text-emerald-700" },
];

const feed = [
  ...liveOperations.map((item) => ({ ...item, kind: "live" as const })),
  ...recentActivity.map((item) => ({ ...item, live: false, kind: "done" as const })),
];

function PulseDot({ live }: { live?: boolean }) {
  if (!live) {
    return <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-slate-300" />;
  }
  return (
    <span className="relative mt-1.5 flex h-2.5 w-2.5 shrink-0">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-50" />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-sky-500" />
    </span>
  );
}

export function DashboardOverview() {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#0b1f3a]">
          <HelpTitle hint={t("dashboard.hint")}>{t("dashboard.title")}</HelpTitle>
        </h1>
        <p className="mt-2 text-sm leading-7 text-slate-500">{t("dashboard.description")}</p>
      </div>

      <section className="grid min-h-[42rem] items-stretch gap-5 lg:grid-cols-3">
        <div className="flex min-h-[42rem] flex-col gap-5 lg:col-span-2">
          <div className="grid min-h-[13.5rem] shrink-0 grid-cols-2 gap-4">
            {dashboardStats.map((stat) => (
              <article key={stat.id} className="rounded-2xl border border-sky-100 bg-white p-5">
                <p className="text-sm text-slate-500">{stat.label}</p>
                <div className="mt-3 flex items-end justify-between gap-2">
                  <p className="text-3xl font-semibold tracking-tight text-[#0b1f3a]">{stat.value}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      stat.trend === "up" ? "bg-emerald-50 text-emerald-700" : "bg-sky-50 text-sky-700"
                    }`}
                  >
                    {stat.delta}
                  </span>
                </div>
                <p className="mt-3 text-xs leading-5 text-slate-400">{stat.hint}</p>
              </article>
            ))}
          </div>

          <article className="flex min-h-[26rem] flex-1 flex-col overflow-hidden rounded-2xl border border-sky-100 bg-white">
            <div className="border-b border-sky-50 px-6 py-4">
              <h2 className="text-base font-semibold text-[#0b1f3a]">{t("dashboard.activity")}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">{t("dashboard.liveLead")}</p>
            </div>
            <ul className="min-h-0 flex-1 divide-y divide-sky-50 overflow-y-auto">
              {feed.map((item) => (
                <li key={`${item.kind}-${item.id}`} className="flex items-start gap-3 px-6 py-3.5">
                  <PulseDot live={item.live} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800">{item.title}</p>
                    <p className="mt-0.5 text-xs text-sky-700">{item.agent}</p>
                  </div>
                  <span className="shrink-0 text-xs text-slate-400">{item.time}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>

        <aside className="flex min-h-[42rem] flex-col overflow-hidden rounded-2xl border border-indigo-100/80 bg-gradient-to-br from-indigo-50/70 via-white to-slate-50 p-6 shadow-sm transition-shadow hover:shadow-md">
          <h2 className="text-base font-semibold tracking-tight text-slate-800">{t("dashboard.quick")}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">{t("dashboard.quickLead")}</p>
          <div className="mt-6 flex flex-1 flex-col gap-2.5">
            {shortcuts.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white/90 px-3.5 py-3 text-sm font-medium text-slate-800 transition-all hover:border-indigo-300 hover:bg-indigo-50/50"
                >
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${item.iconClass}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <span>{t(item.labelKey)}</span>
                </Link>
              );
            })}
          </div>
        </aside>
      </section>

      <CompanyPulseCard />
    </div>
  );
}
