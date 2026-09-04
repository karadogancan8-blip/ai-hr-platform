"use client";

import Link from "next/link";
import { dashboardStats, recentActivity } from "@/lib/mock-data";
import { useAccessControl } from "@/components/access/AccessControlProvider";
import { ENTERPRISE_MODULES } from "@/lib/access-control";
import { HelpTitle } from "@/components/ui/HelpTip";
import { Skeleton } from "@/components/ui/Skeleton";
import { cardSurface, mutedSurface } from "@/components/ui/surface";
import { useI18n } from "@/components/i18n/LocaleProvider";
import type { MessageKey } from "@/lib/i18n";

const coreLinks: { href: string; labelKey: MessageKey }[] = [
  { href: "/ise-alim", labelKey: "dashboard.link.recruit" },
  { href: "/onboarding", labelKey: "dashboard.link.onboarding" },
  { href: "/performans", labelKey: "dashboard.link.performance" },
  { href: "/mevzuat", labelKey: "dashboard.link.policy" },
  { href: "/izin", labelKey: "dashboard.link.leave" },
];

const QUICK_SLOTS = coreLinks.length + ENTERPRISE_MODULES.length;

export function DashboardOverview() {
  const { t } = useI18n();
  const { canView, loading } = useAccessControl();
  const enterpriseLinks = ENTERPRISE_MODULES.filter((item) => canView(item.id)).map((item) => ({
    href: item.href,
    label: t(`enterprise.${item.id}.title` as MessageKey),
  }));
  const quickLinks = loading
    ? coreLinks.map((link) => ({ href: link.href, label: t(link.labelKey) }))
    : [
        ...coreLinks.map((link) => ({ href: link.href, label: t(link.labelKey) })),
        ...enterpriseLinks,
      ];
  const skeletonCount = loading ? Math.max(0, QUICK_SLOTS - coreLinks.length) : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          <HelpTitle hint={t("dashboard.hint")}>{t("dashboard.title")}</HelpTitle>
        </h1>
        <p className="mt-2 text-sm leading-7 text-slate-500">{t("dashboard.description")}</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((stat) => (
          <article key={stat.id} className={`${cardSurface} p-6`}>
            <p className="text-sm text-slate-500">{stat.label}</p>
            <div className="mt-4 flex items-end justify-between">
              <p className="text-3xl font-semibold text-slate-900">{stat.value}</p>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  stat.trend === "up" ? "bg-slate-100 text-slate-600" : "bg-slate-50 text-slate-500"
                }`}
              >
                {stat.delta}
              </span>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-400">{stat.hint}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className={`${cardSurface} p-6 lg:col-span-2`}>
          <h2 className="text-base font-semibold text-slate-900">{t("dashboard.activity")}</h2>
          <ul className="mt-5 divide-y divide-slate-100">
            {recentActivity.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-4 py-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-800">{item.title}</p>
                  <p className="text-xs text-slate-500">{item.agent}</p>
                </div>
                <span className="shrink-0 text-xs text-slate-400">{item.time}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className={`${mutedSurface} flex min-h-[38rem] flex-col p-6`}>
          <h2 className="text-base font-semibold text-slate-900">{t("dashboard.quick")}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">{t("dashboard.quickLead")}</p>
          <div className="mt-6 flex min-h-0 flex-1 flex-col gap-2.5">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-xl border border-slate-200/70 bg-white px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                {link.label}
              </Link>
            ))}
            {Array.from({ length: skeletonCount }, (_, index) => (
              <Skeleton key={`quick-skel-${index}`} className="h-10 w-full rounded-xl" />
            ))}
            {!loading
              ? Array.from({ length: Math.max(0, QUICK_SLOTS - quickLinks.length) }, (_, index) => (
                  <div key={`quick-slot-${index}`} className="h-10 rounded-xl border border-dashed border-slate-200/80 bg-white/50" />
                ))
              : null}
          </div>
        </article>
      </section>
    </div>
  );
}
