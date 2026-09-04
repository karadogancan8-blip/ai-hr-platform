"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { FileDown } from "lucide-react";
import { useAccessControl } from "@/components/access/AccessControlProvider";
import { HelpTitle } from "@/components/ui/HelpTip";
import { SelectField } from "@/components/ui/SelectField";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { readLocalJson, writeLocalJson } from "@/lib/session-store";
import {
  TIMESHEET_STORAGE_KEY,
  TIMESHEET_UPDATED_EVENT,
  WEEK_DAYS,
  createTimesheetEntry,
  currentMonday,
  currentMonthKey,
  emptyDays,
  monthlyReport,
  weekLabel,
  type TimesheetEntry,
  type TimesheetStatus,
  type WeekDay,
  type WorkMode,
} from "@/lib/timesheets";
import type { MessageKey } from "@/lib/i18n";

const statusStyle: Record<TimesheetStatus, string> = {
  pending: "bg-amber-50 text-amber-800",
  approved: "bg-emerald-50 text-emerald-800",
  rejected: "bg-rose-50 text-rose-800",
};

type TimesheetTableProps = {
  variant?: "page" | "embed";
};

function persist(next: TimesheetEntry[]) {
  writeLocalJson(TIMESHEET_STORAGE_KEY, next);
  window.dispatchEvent(new Event(TIMESHEET_UPDATED_EVENT));
}

export function TimesheetTable({ variant = "embed" }: TimesheetTableProps) {
  const { t } = useI18n();
  const { role } = useAccessControl();
  const hrDesk = role === "company_admin" || role === "hr_manager";
  const [rows, setRows] = useState<TimesheetEntry[]>([]);
  const [notice, setNotice] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
  const [form, setForm] = useState({
    employee: "",
    weekStart: currentMonday(),
    days: emptyDays(),
    overtimeHours: 0,
    note: "",
  });

  function load() {
    setRows(readLocalJson<TimesheetEntry[]>(TIMESHEET_STORAGE_KEY, []));
  }

  useEffect(() => {
    load();
    window.addEventListener(TIMESHEET_UPDATED_EVENT, load);
    return () => window.removeEventListener(TIMESHEET_UPDATED_EVENT, load);
  }, []);

  const month = currentMonthKey();
  const report = useMemo(() => monthlyReport(rows, month), [rows, month]);

  function setDay(day: WeekDay, mode: WorkMode) {
    setForm((prev) => ({ ...prev, days: { ...prev.days, [day]: mode } }));
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!form.employee.trim()) {
      setNotice(t("timesheet.required"));
      return;
    }
    const created = createTimesheetEntry(form);
    const next = [created, ...rows];
    setRows(next);
    persist(next);
    setForm((prev) => ({ ...prev, employee: "", overtimeHours: 0, note: "", days: emptyDays() }));
    setNotice(t("timesheet.saved"));
  }

  function setStatus(id: string, status: TimesheetStatus) {
    const next = rows.map((item) => (item.id === id ? { ...item, status } : item));
    setRows(next);
    persist(next);
  }

  return (
    <section id="puantaj" className="min-h-[560px] w-full space-y-4 rounded-2xl border border-slate-200/70 bg-white p-5 transition-none">
      {variant === "page" ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">{t("timesheet.kicker")}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#0b1f3a]">
            <HelpTitle hint={t("timesheet.hint")}>{t("timesheet.title")}</HelpTitle>
          </h1>
          <p className="mt-1 text-sm text-slate-500">{t("timesheet.description")}</p>
        </div>
      ) : (
        <div>
          <h2 className="text-base font-semibold text-[#0b1f3a]">{t("timesheet.title")}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">{t("timesheet.embedLead")}</p>
        </div>
      )}

      <div className="min-h-10">
        {notice ? (
          <p className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</p>
        ) : null}
      </div>

      <form onSubmit={submit} className="grid gap-3 rounded-2xl border border-slate-100 bg-[#f8fbff] p-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">{t("timesheet.employee")}</span>
          <input
            value={form.employee}
            onChange={(event) => setForm((prev) => ({ ...prev, employee: event.target.value }))}
            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">{t("timesheet.week")}</span>
          <input
            type="date"
            value={form.weekStart}
            onChange={(event) => setForm((prev) => ({ ...prev, weekStart: event.target.value }))}
            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">{t("timesheet.otHours")}</span>
          <input
            type="number"
            min={0}
            step={0.5}
            value={form.overtimeHours}
            onChange={(event) => setForm((prev) => ({ ...prev, overtimeHours: Number(event.target.value) }))}
            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </label>
        <label className="text-sm md:col-span-2 xl:col-span-1">
          <span className="mb-1 block font-medium text-slate-700">{t("timesheet.note")}</span>
          <input
            value={form.note}
            onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 md:col-span-2 xl:col-span-4">
          {WEEK_DAYS.map((day) => (
            <label key={day} className="text-xs">
              <span className="mb-1 block font-medium text-slate-600">{t(`timesheet.day.${day}` as MessageKey)}</span>
              <SelectField
                value={form.days[day]}
                onChange={(event) => setDay(day, event.target.value as WorkMode)}
                className="h-10 w-full text-xs"
                wrapperClassName="h-10"
              >
                <option value="office">{t("timesheet.mode.office")}</option>
                <option value="remote">{t("timesheet.mode.remote")}</option>
                <option value="off">{t("timesheet.mode.off")}</option>
              </SelectField>
            </label>
          ))}
        </div>
        <div className="flex items-end md:col-span-2 xl:col-span-4">
          <button
            type="submit"
            className="inline-flex h-10 items-center rounded-xl bg-[#123056] px-4 text-sm font-medium text-white hover:bg-[#0f2744]"
          >
            {t("timesheet.submit")}
          </button>
        </div>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-slate-500">{t("timesheet.monthTotal", { month, overtime: report.overtime })}</p>
        {hrDesk ? (
          <button
            type="button"
            onClick={() => setReportOpen(true)}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <FileDown className="h-4 w-4" />
            {t("timesheet.report")}
          </button>
        ) : null}
      </div>

      <div className="min-h-[220px] overflow-x-auto rounded-2xl border border-slate-100">
        <table className="min-w-[920px] w-full text-left text-sm">
          <thead className="bg-[#f7fbff] text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-3 font-medium">{t("timesheet.employee")}</th>
              <th className="px-3 py-3 font-medium">{t("timesheet.week")}</th>
              {WEEK_DAYS.map((day) => (
                <th key={day} className="px-3 py-3 font-medium">
                  {t(`timesheet.day.${day}` as MessageKey)}
                </th>
              ))}
              <th className="px-3 py-3 font-medium">{t("timesheet.otHours")}</th>
              <th className="px-3 py-3 font-medium">{t("timesheet.status")}</th>
              {hrDesk ? <th className="px-3 py-3 font-medium">{t("timesheet.actions")}</th> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td className="px-3 py-8 text-sm text-slate-400" colSpan={hrDesk ? 10 : 9}>
                  {t("timesheet.empty")}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id}>
                  <td className="px-3 py-3 font-medium text-slate-800">{row.employee}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-xs text-slate-500">{weekLabel(row.weekStart)}</td>
                  {WEEK_DAYS.map((day) => (
                    <td key={day} className="px-3 py-3 text-xs">
                      {t(`timesheet.mode.${row.days[day]}` as MessageKey)}
                    </td>
                  ))}
                  <td className="px-3 py-3">{row.overtimeHours}</td>
                  <td className="px-3 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusStyle[row.status]}`}>
                      {t(`timesheet.status.${row.status}` as MessageKey)}
                    </span>
                  </td>
                  {hrDesk ? (
                    <td className="px-3 py-3">
                      {row.status === "pending" ? (
                        <div className="flex flex-wrap gap-1">
                          <button
                            type="button"
                            onClick={() => setStatus(row.id, "approved")}
                            className="rounded-lg bg-emerald-600 px-2 py-1 text-xs font-medium text-white"
                          >
                            {t("timesheet.approve")}
                          </button>
                          <button
                            type="button"
                            onClick={() => setStatus(row.id, "rejected")}
                            className="rounded-lg bg-slate-200 px-2 py-1 text-xs font-medium text-slate-700"
                          >
                            {t("timesheet.reject")}
                          </button>
                        </div>
                      ) : null}
                    </td>
                  ) : null}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {reportOpen ? (
        <TimesheetReportModal
          month={month}
          office={report.office}
          remote={report.remote}
          overtime={report.overtime}
          rows={report.rows}
          onClose={() => setReportOpen(false)}
        />
      ) : null}
    </section>
  );
}

function TimesheetReportModal({
  month,
  office,
  remote,
  overtime,
  rows,
  onClose,
}: {
  month: string;
  office: number;
  remote: number;
  overtime: number;
  rows: TimesheetEntry[];
  onClose: () => void;
}) {
  const { t } = useI18n();

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="print-overlay fixed inset-0 z-[80] flex items-end justify-center bg-slate-900/45 p-4 sm:items-center">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #timesheet-print-root, #timesheet-print-root * { visibility: visible; }
          #timesheet-print-root { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
      <button type="button" className="print-chrome absolute inset-0" aria-label={t("common.close")} onClick={onClose} />
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
        <div id="timesheet-print-root" className="print-sheet space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">{t("timesheet.reportTitle", { month })}</h3>
          <p className="text-sm text-slate-600">
            {t("timesheet.reportStats", { office, remote, overtime, count: rows.length })}
          </p>
          <ul className="min-h-[8rem] space-y-2 text-sm text-slate-700">
            {rows.map((row) => (
              <li key={row.id} className="rounded-xl border border-slate-100 px-3 py-2">
                {row.employee} · {weekLabel(row.weekStart)} · {row.overtimeHours} {t("timesheet.otHours")}
              </li>
            ))}
          </ul>
        </div>
        <div className="print-chrome mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-700"
          >
            {t("common.close")}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="h-10 rounded-xl bg-[#123056] px-4 text-sm font-medium text-white"
          >
            {t("timesheet.print")}
          </button>
        </div>
      </div>
    </div>
  );
}
