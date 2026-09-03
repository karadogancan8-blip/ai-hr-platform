"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/components/i18n/LocaleProvider";
import type { MessageKey } from "@/lib/i18n";
import {
  APPEALS_UPDATED_EVENT,
  readAppeals,
  updateAppealStatus,
  type AppealStatus,
  type EmployeeAppeal,
} from "@/lib/appeals";

const statusClass: Record<AppealStatus, string> = {
  beklemede: "bg-amber-50 text-amber-800",
  onaylandi: "bg-emerald-50 text-emerald-800",
  revize: "bg-sky-50 text-sky-800",
  reddedildi: "bg-rose-50 text-rose-800",
};

export function AppealsInbox() {
  const { t } = useI18n();
  const [rows, setRows] = useState<EmployeeAppeal[]>([]);

  useEffect(() => {
    setRows(readAppeals());
    function refresh() {
      setRows(readAppeals());
    }
    window.addEventListener(APPEALS_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(APPEALS_UPDATED_EVENT, refresh);
  }, []);

  function decide(id: string, status: AppealStatus) {
    setRows(updateAppealStatus(id, status));
  }

  return (
    <section className="rounded-2xl border border-sky-100 bg-white p-5 shadow-[0_8px_30px_rgba(15,55,95,0.06)]">
      <h2 className="text-base font-semibold text-[#0b1f3a]">{t("appeals.title")}</h2>
      <p className="mt-1 text-sm text-slate-500">{t("appeals.lead")}</p>
      {!rows.length ? <p className="mt-4 text-sm text-slate-400">{t("appeals.empty")}</p> : null}
      <ul className="mt-4 space-y-3">
        {rows.map((row) => (
          <li key={row.id} className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-slate-900">{row.subjectLabel}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {row.module} · {new Date(row.createdAt).toLocaleString()}
                </p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusClass[row.status]}`}>
                {t(`appeals.status.${row.status}` as MessageKey)}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-700">{row.reason}</p>
            {row.detail ? <p className="mt-1 text-sm text-slate-500">{row.detail}</p> : null}
            {row.status === "beklemede" ? (
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => decide(row.id, "onaylandi")}
                  className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white"
                >
                  {t("appeals.approve")}
                </button>
                <button
                  type="button"
                  onClick={() => decide(row.id, "revize")}
                  className="rounded-lg bg-sky-700 px-2.5 py-1 text-xs font-medium text-white"
                >
                  {t("appeals.revise")}
                </button>
                <button
                  type="button"
                  onClick={() => decide(row.id, "reddedildi")}
                  className="rounded-lg bg-slate-200 px-2.5 py-1 text-xs font-medium text-slate-800"
                >
                  {t("appeals.reject")}
                </button>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
