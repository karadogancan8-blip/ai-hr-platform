"use client";

import { FormEvent, useEffect, useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { useAccessControl } from "@/components/access/AccessControlProvider";
import { SelectField } from "@/components/ui/SelectField";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { SHIFT_SWAP_EVENT, SHIFT_SWAP_KEY, type ShiftSlot, type ShiftSwapRequest } from "@/lib/shift-swap";
import { readLocalJson, writeLocalJson } from "@/lib/session-store";
import type { MessageKey } from "@/lib/i18n";

function persist(rows: ShiftSwapRequest[]) {
  writeLocalJson(SHIFT_SWAP_KEY, rows);
  window.dispatchEvent(new Event(SHIFT_SWAP_EVENT));
}

export function ShiftSwapPanel() {
  const { t } = useI18n();
  const { role } = useAccessControl();
  const hrDesk = role === "company_admin" || role === "hr_manager";
  const [rows, setRows] = useState<ShiftSwapRequest[]>([]);
  const [form, setForm] = useState({
    fromEmployee: "",
    toEmployee: "",
    date: new Date().toISOString().slice(0, 10),
    shift: "morning" as ShiftSlot,
    note: "",
  });
  const [notice, setNotice] = useState("");

  useEffect(() => {
    function load() {
      setRows(readLocalJson<ShiftSwapRequest[]>(SHIFT_SWAP_KEY, []));
    }
    load();
    window.addEventListener(SHIFT_SWAP_EVENT, load);
    return () => window.removeEventListener(SHIFT_SWAP_EVENT, load);
  }, []);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!form.fromEmployee.trim() || !form.toEmployee.trim()) {
      setNotice(t("swap.need"));
      return;
    }
    const row: ShiftSwapRequest = {
      id: crypto.randomUUID(),
      fromEmployee: form.fromEmployee.trim(),
      toEmployee: form.toEmployee.trim(),
      date: form.date,
      shift: form.shift,
      note: form.note.trim(),
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    const next = [row, ...rows];
    setRows(next);
    persist(next);
    setForm((prev) => ({ ...prev, fromEmployee: "", toEmployee: "", note: "" }));
    setNotice(t("swap.saved"));
  }

  function setStatus(id: string, status: ShiftSwapRequest["status"]) {
    const next = rows.map((row) => (row.id === id ? { ...row, status } : row));
    setRows(next);
    persist(next);
  }

  return (
    <section id="shift-swap" className="min-h-[24rem] w-full space-y-4 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-[0_8px_24px_rgba(15,37,64,0.05)] transition-none">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-700">{t("swap.kicker")}</p>
          <h2 className="mt-1 text-base font-semibold text-[#0b1f3a]">{t("swap.title")}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">{t("swap.lead")}</p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-700">
          <ArrowLeftRight className="h-4 w-4" />
        </span>
      </div>
      <div className="min-h-10">
        {notice ? (
          <p className="rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">{notice}</p>
        ) : null}
      </div>

      <form onSubmit={submit} className="grid gap-3 rounded-3xl border border-slate-100 bg-[#f8fbff] p-4 md:grid-cols-2 xl:grid-cols-5">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">{t("swap.from")}</span>
          <input
            value={form.fromEmployee}
            onChange={(event) => setForm((prev) => ({ ...prev, fromEmployee: event.target.value }))}
            className="h-10 w-full rounded-full border border-slate-200 bg-white px-4 text-sm outline-none"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">{t("swap.to")}</span>
          <input
            value={form.toEmployee}
            onChange={(event) => setForm((prev) => ({ ...prev, toEmployee: event.target.value }))}
            className="h-10 w-full rounded-full border border-slate-200 bg-white px-4 text-sm outline-none"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">{t("swap.date")}</span>
          <input
            type="date"
            value={form.date}
            onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
            className="h-10 w-full rounded-full border border-slate-200 bg-white px-4 text-sm outline-none"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">{t("swap.shift")}</span>
          <SelectField
            value={form.shift}
            onChange={(event) => setForm((prev) => ({ ...prev, shift: event.target.value as ShiftSlot }))}
            className="h-10 w-full"
            wrapperClassName="h-10"
          >
            <option value="morning">{t("swap.slot.morning")}</option>
            <option value="evening">{t("swap.slot.evening")}</option>
            <option value="night">{t("swap.slot.night")}</option>
          </SelectField>
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">{t("swap.note")}</span>
          <input
            value={form.note}
            onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
            className="h-10 w-full rounded-full border border-slate-200 bg-white px-4 text-sm outline-none"
          />
        </label>
        <div className="xl:col-span-5">
          <button type="submit" className="h-10 rounded-full bg-[#123056] px-5 text-sm font-medium text-white">
            {t("swap.submit")}
          </button>
        </div>
      </form>

      <div className="min-h-[9rem] overflow-x-auto rounded-3xl border border-slate-100">
        <table className="min-w-[760px] w-full text-left text-sm">
          <thead className="bg-[#f7fbff] text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">{t("swap.from")}</th>
              <th className="px-4 py-3 font-medium">{t("swap.to")}</th>
              <th className="px-4 py-3 font-medium">{t("swap.date")}</th>
              <th className="px-4 py-3 font-medium">{t("swap.shift")}</th>
              <th className="px-4 py-3 font-medium">{t("swap.status")}</th>
              {hrDesk ? <th className="px-4 py-3 font-medium">{t("swap.action")}</th> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-slate-400" colSpan={hrDesk ? 6 : 5}>
                  {t("swap.empty")}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3 font-medium">{row.fromEmployee}</td>
                  <td className="px-4 py-3">{row.toEmployee}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{row.date}</td>
                  <td className="px-4 py-3">{t(`swap.slot.${row.shift}` as MessageKey)}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium">
                      {t(`swap.status.${row.status}` as MessageKey)}
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
                          {t("swap.approve")}
                        </button>
                        <button
                          type="button"
                          onClick={() => setStatus(row.id, "rejected")}
                          className="h-8 rounded-full bg-slate-200 px-3 text-xs font-medium"
                        >
                          {t("swap.reject")}
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
