"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Receipt } from "lucide-react";
import { useAccessControl } from "@/components/access/AccessControlProvider";
import { SelectField } from "@/components/ui/SelectField";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { EXPENSE_STORAGE_KEY, EXPENSE_UPDATED_EVENT, type ExpenseCategory, type ExpenseRow } from "@/lib/expenses";
import { readLocalJson, writeLocalJson } from "@/lib/session-store";
import type { MessageKey } from "@/lib/i18n";

function persist(rows: ExpenseRow[]) {
  writeLocalJson(EXPENSE_STORAGE_KEY, rows);
  window.dispatchEvent(new Event(EXPENSE_UPDATED_EVENT));
}

export function ExpenseDesk() {
  const { t } = useI18n();
  const { role } = useAccessControl();
  const hrDesk = role === "company_admin" || role === "hr_manager";
  const [rows, setRows] = useState<ExpenseRow[]>([]);
  const [form, setForm] = useState({ employee: "", category: "taxi" as ExpenseCategory, amount: "", receipt: "" });
  const [notice, setNotice] = useState("");

  useEffect(() => {
    function load() {
      setRows(readLocalJson<ExpenseRow[]>(EXPENSE_STORAGE_KEY, []));
    }
    load();
    window.addEventListener(EXPENSE_UPDATED_EVENT, load);
    return () => window.removeEventListener(EXPENSE_UPDATED_EVENT, load);
  }, []);

  const approvedTotal = useMemo(
    () => rows.filter((row) => row.status === "approved").reduce((sum, row) => sum + row.amount, 0),
    [rows],
  );

  function submit(event: FormEvent) {
    event.preventDefault();
    const amount = Number(form.amount);
    if (!form.employee.trim() || !Number.isFinite(amount) || amount <= 0) {
      setNotice(t("expense.need"));
      return;
    }
    const row: ExpenseRow = {
      id: crypto.randomUUID(),
      employee: form.employee.trim(),
      category: form.category,
      amount,
      receipt: form.receipt.trim(),
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    const next = [row, ...rows];
    setRows(next);
    persist(next);
    setForm({ employee: "", category: "taxi", amount: "", receipt: "" });
    setNotice(t("expense.saved"));
  }

  function setStatus(id: string, status: ExpenseRow["status"]) {
    const next = rows.map((row) => (row.id === id ? { ...row, status } : row));
    setRows(next);
    persist(next);
  }

  function exportList() {
    const approved = rows.filter((row) => row.status === "approved");
    const lines = [
      `${t("expense.employee")};${t("expense.category")};${t("expense.amount")};${t("expense.receipt")}`,
      ...approved.map((row) => `${row.employee};${t(`expense.cat.${row.category}` as MessageKey)};${row.amount};${row.receipt}`),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "masraf-listesi.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section id="expenses" className="min-h-[28rem] w-full space-y-4 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-[0_8px_24px_rgba(15,37,64,0.05)] transition-none">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">{t("expense.kicker")}</p>
          <h2 className="mt-1 text-base font-semibold text-[#0b1f3a]">{t("expense.title")}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">{t("expense.lead")}</p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-800">
          <Receipt className="h-4 w-4" />
        </span>
      </div>
      <div className="min-h-10">
        {notice ? (
          <p className="rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">{notice}</p>
        ) : null}
      </div>

      <form onSubmit={submit} className="grid gap-3 rounded-3xl border border-slate-100 bg-[#f8fbff] p-4 md:grid-cols-4">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">{t("expense.employee")}</span>
          <input
            value={form.employee}
            onChange={(event) => setForm((prev) => ({ ...prev, employee: event.target.value }))}
            className="h-10 w-full rounded-full border border-slate-200 bg-white px-4 text-sm outline-none"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">{t("expense.category")}</span>
          <SelectField
            value={form.category}
            onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value as ExpenseCategory }))}
            className="h-10 w-full"
            wrapperClassName="h-10"
          >
            <option value="taxi">{t("expense.cat.taxi")}</option>
            <option value="meal">{t("expense.cat.meal")}</option>
            <option value="entertainment">{t("expense.cat.entertainment")}</option>
          </SelectField>
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">{t("expense.amount")}</span>
          <input
            type="number"
            min={0}
            step="0.01"
            value={form.amount}
            onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))}
            className="h-10 w-full rounded-full border border-slate-200 bg-white px-4 text-sm outline-none"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">{t("expense.receipt")}</span>
          <input
            value={form.receipt}
            onChange={(event) => setForm((prev) => ({ ...prev, receipt: event.target.value }))}
            className="h-10 w-full rounded-full border border-slate-200 bg-white px-4 text-sm outline-none"
          />
        </label>
        <div className="flex items-end gap-2 md:col-span-4">
          <button type="submit" className="h-10 rounded-full bg-[#123056] px-5 text-sm font-medium text-white">
            {t("expense.submit")}
          </button>
          {hrDesk ? (
            <button
              type="button"
              onClick={exportList}
              className="h-10 rounded-full border border-slate-200 px-4 text-sm font-medium text-slate-700"
            >
              {t("expense.export")}
            </button>
          ) : null}
          <p className="ms-auto text-xs text-slate-500">{t("expense.approvedTotal", { amount: approvedTotal.toFixed(2) })}</p>
        </div>
      </form>

      <div className="min-h-[10rem] overflow-x-auto rounded-3xl border border-slate-100">
        <table className="min-w-[720px] w-full text-left text-sm">
          <thead className="bg-[#f7fbff] text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">{t("expense.employee")}</th>
              <th className="px-4 py-3 font-medium">{t("expense.category")}</th>
              <th className="px-4 py-3 font-medium">{t("expense.amount")}</th>
              <th className="px-4 py-3 font-medium">{t("expense.receipt")}</th>
              <th className="px-4 py-3 font-medium">{t("expense.status")}</th>
              {hrDesk ? <th className="px-4 py-3 font-medium">{t("expense.action")}</th> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-slate-400" colSpan={hrDesk ? 6 : 5}>
                  {t("expense.empty")}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3 font-medium">{row.employee}</td>
                  <td className="px-4 py-3">{t(`expense.cat.${row.category}` as MessageKey)}</td>
                  <td className="px-4 py-3 tabular-nums">{row.amount.toFixed(2)}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{row.receipt || "—"}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium">
                      {t(`expense.status.${row.status}` as MessageKey)}
                    </span>
                  </td>
                  {hrDesk && row.status === "pending" ? (
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => setStatus(row.id, "approved")}
                          className="h-8 rounded-full bg-emerald-600 px-3 text-xs font-medium text-white"
                        >
                          {t("expense.approve")}
                        </button>
                        <button
                          type="button"
                          onClick={() => setStatus(row.id, "rejected")}
                          className="h-8 rounded-full bg-slate-200 px-3 text-xs font-medium"
                        >
                          {t("expense.reject")}
                        </button>
                      </div>
                    </td>
                  ) : hrDesk ? (
                    <td className="px-4 py-3" />
                  ) : null}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
