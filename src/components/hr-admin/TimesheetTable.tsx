"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { useAccessControl } from "@/components/access/AccessControlProvider";
import { HelpTitle } from "@/components/ui/HelpTip";
import { SelectField } from "@/components/ui/SelectField";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { downloadElementPdf } from "@/lib/download-pdf";
import {
  LEAVE_UPDATED_EVENT,
  fetchLeaveRequests,
  persistLeaveCache,
  readLeaveCache,
} from "@/lib/leave-requests";
import { isSupabaseConfigured } from "@/lib/supabase";
import { readLocalJson, writeLocalJson } from "@/lib/session-store";
import {
  TIMESHEET_STORAGE_KEY,
  TIMESHEET_UPDATED_EVENT,
  WEEK_DAYS,
  computeMonthPayroll,
  createTimesheetEntry,
  currentMonday,
  currentMonthKey,
  emptyDays,
  syncTimesheetsWithApprovedLeave,
  weekLabel,
  type TimesheetEntry,
  type TimesheetStatus,
  type WeekDay,
  type WorkMode,
} from "@/lib/timesheets";
import type { LeaveRequest } from "@/lib/types";
import type { MessageKey } from "@/lib/i18n";

const statusStyle: Record<TimesheetStatus, string> = {
  pending: "bg-amber-50 text-amber-800",
  approved: "bg-emerald-50 text-emerald-800",
  rejected: "bg-rose-50 text-rose-800",
};

type TimesheetTableProps = {
  variant?: "page" | "embed";
  leaves?: LeaveRequest[];
};

function persist(next: TimesheetEntry[]) {
  writeLocalJson(TIMESHEET_STORAGE_KEY, next);
  window.dispatchEvent(new Event(TIMESHEET_UPDATED_EVENT));
}

export function TimesheetTable({ variant = "embed", leaves: leavesFromParent }: TimesheetTableProps) {
  const { t } = useI18n();
  const { role } = useAccessControl();
  const hrDesk = role === "company_admin" || role === "hr_manager";
  const [rows, setRows] = useState<TimesheetEntry[]>([]);
  const [localLeaves, setLocalLeaves] = useState<LeaveRequest[]>([]);
  const [notice, setNotice] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
  const [form, setForm] = useState({
    employee: "",
    weekStart: currentMonday(),
    days: emptyDays(),
    overtimeHours: 0,
    note: "",
  });

  const leaves = leavesFromParent ?? localLeaves;
  const month = currentMonthKey();

  function loadTimesheets() {
    setRows(readLocalJson<TimesheetEntry[]>(TIMESHEET_STORAGE_KEY, []));
  }

  function loadLeavesFromCache() {
    if (leavesFromParent) return;
    setLocalLeaves(readLeaveCache());
  }

  useEffect(() => {
    loadTimesheets();
    loadLeavesFromCache();
    window.addEventListener(TIMESHEET_UPDATED_EVENT, loadTimesheets);
    window.addEventListener(LEAVE_UPDATED_EVENT, loadLeavesFromCache);
    return () => {
      window.removeEventListener(TIMESHEET_UPDATED_EVENT, loadTimesheets);
      window.removeEventListener(LEAVE_UPDATED_EVENT, loadLeavesFromCache);
    };
  }, [leavesFromParent]);

  useEffect(() => {
    if (leavesFromParent || !isSupabaseConfigured()) return;
    void fetchLeaveRequests()
      .then((fetched) => {
        persistLeaveCache(fetched);
        setLocalLeaves(fetched);
      })
      .catch(() => setLocalLeaves(readLeaveCache()));
  }, [leavesFromParent]);

  useEffect(() => {
    const synced = syncTimesheetsWithApprovedLeave(rows, leaves, month);
    if (JSON.stringify(synced) === JSON.stringify(rows)) return;
    setRows(synced);
    persist(synced);
  }, [leaves, month, rows]);

  const payroll = useMemo(() => computeMonthPayroll(rows, leaves, month), [rows, leaves, month]);

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
    const next = syncTimesheetsWithApprovedLeave([created, ...rows], leaves, month);
    setRows(next);
    persist(next);
    setForm((prev) => ({ ...prev, employee: "", overtimeHours: 0, note: "", days: emptyDays() }));
    setNotice(t("timesheet.saved"));
  }

  function setStatus(id: string, status: TimesheetStatus) {
    const next = syncTimesheetsWithApprovedLeave(
      rows.map((item) => (item.id === id ? { ...item, status } : item)),
      leaves,
      month,
    );
    setRows(next);
    persist(next);
  }

  const kpis = [
    { label: t("timesheet.kpi.business"), value: payroll.businessDays },
    { label: t("timesheet.kpi.leave"), value: payroll.leaveDays },
    { label: t("timesheet.kpi.work"), value: payroll.workDays },
    { label: t("timesheet.kpi.office"), value: payroll.office },
    { label: t("timesheet.kpi.remote"), value: payroll.remote },
    { label: t("timesheet.kpi.missing"), value: payroll.missing },
  ];

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

      <div className="grid min-h-[5.5rem] grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
        {kpis.map((item) => (
          <article key={item.label} className="rounded-xl border border-slate-100 bg-[#f8fbff] px-3 py-3">
            <p className="text-[11px] font-medium leading-4 text-slate-500">{item.label}</p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-[#0b1f3a]">{item.value}</p>
          </article>
        ))}
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
        <p className="text-xs text-slate-500">
          {t("timesheet.formula", {
            month,
            business: payroll.businessDays,
            leave: payroll.leaveDays,
            work: payroll.workDays,
          })}
        </p>
        <button
          type="button"
          onClick={() => setReportOpen(true)}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <FileDown className="h-4 w-4" />
          {t("timesheet.report")}
        </button>
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

      {reportOpen ? <TimesheetReportModal month={month} payroll={payroll} onClose={() => setReportOpen(false)} /> : null}
    </section>
  );
}

function TimesheetReportModal({
  month,
  payroll,
  onClose,
}: {
  month: string;
  payroll: ReturnType<typeof computeMonthPayroll>;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const sheetRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function exportPdf() {
    if (!sheetRef.current) return;
    setExporting(true);
    try {
      await downloadElementPdf(sheetRef.current, `puantaj-raporu-${month}.pdf`);
    } catch (error) {
      console.error("[puantaj] pdf", error);
      window.print();
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="print-overlay fixed inset-0 z-[80] flex items-end justify-center bg-slate-900/45 p-4 sm:items-center">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #timesheet-print-root, #timesheet-print-root * { visibility: visible; }
          #timesheet-print-root { position: absolute; left: 0; top: 0; width: 100%; background: white; }
        }
      `}</style>
      <button type="button" className="print-chrome absolute inset-0" aria-label={t("common.close")} onClick={onClose} />
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
        <div id="timesheet-print-root" ref={sheetRef} className="print-sheet space-y-4 bg-white">
          <h3 className="text-lg font-semibold text-slate-900">{t("timesheet.reportTitle", { month })}</h3>
          <p className="text-sm text-slate-600">
            {t("timesheet.formula", {
              month,
              business: payroll.businessDays,
              leave: payroll.leaveDays,
              work: payroll.workDays,
            })}
          </p>
          <p className="text-sm text-slate-600">
            {t("timesheet.reportStats", {
              office: payroll.office,
              remote: payroll.remote,
              overtime: payroll.overtime,
              leave: payroll.leaveDays,
              missing: payroll.missing,
              count: payroll.employees.length,
            })}
          </p>
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2 font-medium">{t("timesheet.employee")}</th>
                  <th className="px-3 py-2 font-medium">{t("timesheet.kpi.office")}</th>
                  <th className="px-3 py-2 font-medium">{t("timesheet.kpi.remote")}</th>
                  <th className="px-3 py-2 font-medium">{t("timesheet.kpi.leave")}</th>
                  <th className="px-3 py-2 font-medium">{t("timesheet.kpi.work")}</th>
                  <th className="px-3 py-2 font-medium">{t("timesheet.kpi.missing")}</th>
                  <th className="px-3 py-2 font-medium">{t("timesheet.otHours")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payroll.employees.length === 0 ? (
                  <tr>
                    <td className="px-3 py-6 text-slate-400" colSpan={7}>
                      {t("timesheet.reportEmpty")}
                    </td>
                  </tr>
                ) : (
                  payroll.employees.map((row) => (
                    <tr key={row.employee}>
                      <td className="px-3 py-2 font-medium text-slate-800">{row.employee}</td>
                      <td className="px-3 py-2 tabular-nums">{row.office}</td>
                      <td className="px-3 py-2 tabular-nums">{row.remote}</td>
                      <td className="px-3 py-2 tabular-nums">{row.leaveDays}</td>
                      <td className="px-3 py-2 tabular-nums">{row.workDays}</td>
                      <td className="px-3 py-2 tabular-nums">{row.missing}</td>
                      <td className="px-3 py-2 tabular-nums">{row.overtime}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
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
            className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-700"
          >
            {t("timesheet.print")}
          </button>
          <button
            type="button"
            disabled={exporting}
            onClick={() => void exportPdf()}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#123056] px-4 text-sm font-medium text-white disabled:opacity-50"
          >
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
            {t("timesheet.downloadPdf")}
          </button>
        </div>
      </div>
    </div>
  );
}
