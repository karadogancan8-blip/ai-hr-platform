"use client";

import Link from "next/link";
import { dashboardStats, recentActivity } from "@/lib/mock-data";
import { useAccessControl } from "@/components/access/AccessControlProvider";
import { ENTERPRISE_MODULES } from "@/lib/access-control";
import { HelpTitle } from "@/components/ui/HelpTip";
import { useI18n } from "@/components/i18n/LocaleProvider";
import type { MessageKey } from "@/lib/i18n";

const coreLinks: { href: string; labelKey: MessageKey }[] = [
  { href: "/ise-alim", labelKey: "dashboard.link.recruit" },
  { href: "/onboarding", labelKey: "dashboard.link.onboarding" },
  { href: "/performans", labelKey: "dashboard.link.performance" },
  { href: "/mevzuat", labelKey: "dashboard.link.policy" },
  { href: "/izin", labelKey: "dashboard.link.leave" },
];

export function DashboardOverview() {
  const { t } = useI18n();
  const { canView, loading } = useAccessControl();
  const enterpriseLinks = ENTERPRISE_MODULES.filter((item) => !loading && canView(item.id)).map((item) => ({
    href: item.href,
    label: t(`enterprise.${item.id}.title` as MessageKey),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#0b1f3a]">
          <HelpTitle hint={t("dashboard.hint")}>{t("dashboard.title")}</HelpTitle>
        </h1>
        <p className="mt-1 text-sm text-slate-500">{t("dashboard.description")}</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((stat) => (
          <article
            key={stat.id}
            className="rounded-2xl border border-sky-100 bg-white p-5 shadow-[0_8px_30px_rgba(15,55,95,0.06)]"
          >
            <p className="text-sm text-slate-500">{stat.label}</p>
            <div className="mt-3 flex items-end justify-between">
              <p className="text-3xl font-semibold text-[#0b1f3a]">{stat.value}</p>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  stat.trend === "up" ? "bg-emerald-50 text-emerald-700" : "bg-sky-50 text-sky-700"
                }`}
              >
                {stat.delta}
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-400">{stat.hint}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-2xl border border-sky-100 bg-white p-5 shadow-[0_8px_30px_rgba(15,55,95,0.06)] lg:col-span-2">
          <h2 className="text-base font-semibold text-[#0b1f3a]">{t("dashboard.activity")}</h2>
          <ul className="mt-4 divide-y divide-slate-100">
            {recentActivity.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-4 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">{item.title}</p>
                  <p className="text-xs text-sky-700">{item.agent}</p>
                </div>
                <span className="shrink-0 text-xs text-slate-400">{item.time}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-sky-100 bg-[linear-gradient(180deg,#123056_0%,#1b4f86_100%)] p-5 text-white shadow-[0_8px_30px_rgba(15,55,95,0.16)]">
          <h2 className="text-base font-semibold">{t("dashboard.quick")}</h2>
          <p className="mt-1 text-sm text-sky-100/80">{t("dashboard.quickLead")}</p>
          <div className="mt-5 space-y-2">
            {[
              ...coreLinks.map((link) => ({ href: link.href, label: t(link.labelKey) })),
              ...enterpriseLinks,
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-xl bg-white/10 px-3 py-2 text-sm hover:bg-white/15"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
