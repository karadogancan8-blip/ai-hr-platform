"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { dashboardStats, liveOperations, recentActivity } from "@/lib/mock-data";
import { useAccessControl } from "@/components/access/AccessControlProvider";
import { ENTERPRISE_MODULES } from "@/lib/access-control";
import { HelpTitle } from "@/components/ui/HelpTip";
import { Skeleton } from "@/components/ui/Skeleton";
import { useI18n } from "@/components/i18n/LocaleProvider";
import type { MessageKey } from "@/lib/i18n";

const coreLinks: { href: string; labelKey: MessageKey; hintKey: MessageKey }[] = [
  { href: "/ise-alim", labelKey: "dashboard.link.recruit", hintKey: "recruit.description" },
  { href: "/onboarding", labelKey: "dashboard.link.onboarding", hintKey: "onb.description" },
  { href: "/performans", labelKey: "dashboard.link.performance", hintKey: "perf.description" },
  { href: "/mevzuat", labelKey: "dashboard.link.policy", hintKey: "policy.description" },
  { href: "/izin", labelKey: "dashboard.link.leave", hintKey: "leave.description" },
];

const QUICK_SLOTS = coreLinks.length + ENTERPRISE_MODULES.length;

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
  const { canView, loading } = useAccessControl();
  const enterpriseLinks = ENTERPRISE_MODULES.filter((item) => canView(item.id)).map((item) => ({
    href: item.href,
    label: t(`enterprise.${item.id}.title` as MessageKey),
    hint: t(`enterprise.${item.id}.description` as MessageKey),
  }));
  const quickLinks = loading
    ? coreLinks.map((link) => ({ href: link.href, label: t(link.labelKey), hint: t(link.hintKey) }))
    : [
        ...coreLinks.map((link) => ({ href: link.href, label: t(link.labelKey), hint: t(link.hintKey) })),
        ...enterpriseLinks,
      ];
  const skeletonCount = loading ? Math.max(0, QUICK_SLOTS - coreLinks.length) : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#0b1f3a]">
          <HelpTitle hint={t("dashboard.hint")}>{t("dashboard.title")}</HelpTitle>
        </h1>
        <p className="mt-2 text-sm leading-7 text-slate-500">{t("dashboard.description")}</p>
      </div>

      <section className="grid min-h-[9.5rem] gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((stat) => (
          <article key={stat.id} className="rounded-2xl border border-sky-100 bg-white p-6">
            <p className="text-sm text-slate-500">{stat.label}</p>
            <div className="mt-4 flex items-end justify-between">
              <p className="text-3xl font-semibold text-[#0b1f3a]">{stat.value}</p>
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
      </section>

      <section className="flex min-h-[28rem] flex-col overflow-hidden rounded-2xl border border-sky-100 bg-white">
        <div className="border-b border-sky-50 px-6 py-5">
          <h2 className="text-base font-semibold text-[#0b1f3a]">{t("dashboard.quick")}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">{t("dashboard.quickLead")}</p>
        </div>
        <ul className="divide-y divide-sky-50">
          {quickLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="flex items-center justify-between gap-4 px-6 py-3.5 transition hover:bg-sky-50/60"
              >
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-slate-800">{link.label}</span>
                  <span className="mt-0.5 block truncate text-xs leading-5 text-slate-400">{link.hint}</span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
              </Link>
            </li>
          ))}
          {Array.from({ length: skeletonCount }, (_, index) => (
            <li key={`quick-skel-${index}`} className="flex h-[3.75rem] items-center px-6">
              <Skeleton className="h-8 w-full rounded-lg" />
            </li>
          ))}
        </ul>
      </section>

      <section className="grid min-h-[20rem] gap-4 lg:grid-cols-2">
        <article className="flex min-h-[20rem] flex-col overflow-hidden rounded-2xl border border-sky-100 bg-white">
          <div className="border-b border-sky-50 px-6 py-5">
            <h2 className="text-base font-semibold text-[#0b1f3a]">{t("dashboard.activity")}</h2>
          </div>
          <ul className="flex-1 divide-y divide-sky-50">
            {recentActivity.map((item, index) => (
              <li key={item.id} className="flex items-start gap-3 px-6 py-4">
                <PulseDot live={index === 0} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800">{item.title}</p>
                  <p className="mt-1 text-xs text-sky-700">{item.agent}</p>
                </div>
                <span className="shrink-0 text-xs text-slate-400">{item.time}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="flex min-h-[20rem] flex-col overflow-hidden rounded-2xl border border-sky-100 bg-white">
          <div className="border-b border-sky-50 px-6 py-5">
            <h2 className="text-base font-semibold text-[#0b1f3a]">{t("dashboard.live")}</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">{t("dashboard.liveLead")}</p>
          </div>
          <ul className="flex-1 divide-y divide-sky-50">
            {liveOperations.map((item) => (
              <li key={item.id} className="flex items-start gap-3 px-6 py-4">
                <PulseDot live={item.live} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800">{item.title}</p>
                  <p className="mt-1 text-xs text-sky-700">{item.agent}</p>
                </div>
                <span className="shrink-0 text-xs text-slate-400">{item.time}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  );
}
