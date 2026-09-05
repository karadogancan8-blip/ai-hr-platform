"use client";

import { FormEvent, useEffect, useState } from "react";
import { useAccessControl } from "@/components/access/AccessControlProvider";
import { useI18n } from "@/components/i18n/LocaleProvider";
import {
  PROFILE_REQUESTS_KEY,
  PROFILE_UPDATED_EVENT,
  type ProfileRequest,
} from "@/lib/profile-requests";
import { readLocalJson, writeLocalJson } from "@/lib/session-store";
import type { MessageKey } from "@/lib/i18n";

function persist(items: ProfileRequest[]) {
  writeLocalJson(PROFILE_REQUESTS_KEY, items);
  window.dispatchEvent(new Event(PROFILE_UPDATED_EVENT));
}

export function ProfileSelfService() {
  const { t } = useI18n();
  const { role } = useAccessControl();
  const hrDesk = role === "company_admin" || role === "hr_manager";
  const [items, setItems] = useState<ProfileRequest[]>([]);
  const [form, setForm] = useState({
    employee: "",
    iban: "",
    address: "",
    emergencyName: "",
    emergencyPhone: "",
  });
  const [notice, setNotice] = useState("");

  useEffect(() => {
    function load() {
      setItems(readLocalJson<ProfileRequest[]>(PROFILE_REQUESTS_KEY, []));
    }
    load();
    window.addEventListener(PROFILE_UPDATED_EVENT, load);
    return () => window.removeEventListener(PROFILE_UPDATED_EVENT, load);
  }, []);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!form.employee.trim() || !form.iban.trim() || !form.address.trim() || !form.emergencyName.trim()) {
      setNotice(t("profile.need"));
      return;
    }
    const row: ProfileRequest = {
      id: crypto.randomUUID(),
      employee: form.employee.trim(),
      iban: form.iban.trim(),
      address: form.address.trim(),
      emergencyName: form.emergencyName.trim(),
      emergencyPhone: form.emergencyPhone.trim(),
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    const next = [row, ...items];
    setItems(next);
    persist(next);
    setForm({ employee: "", iban: "", address: "", emergencyName: "", emergencyPhone: "" });
    setNotice(t("profile.sent"));
  }

  function setStatus(id: string, status: ProfileRequest["status"]) {
    const next = items.map((item) => (item.id === id ? { ...item, status } : item));
    setItems(next);
    persist(next);
  }

  return (
    <section className="min-h-[28rem] w-full space-y-4 rounded-3xl border border-slate-200/70 bg-white p-5 transition-none">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">{t("profile.kicker")}</p>
        <h2 className="mt-1 text-base font-semibold text-[#0b1f3a]">{t("profile.title")}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">{t("profile.lead")}</p>
      </div>
      <div className="min-h-10">
        {notice ? (
          <p className="rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">{notice}</p>
        ) : null}
      </div>

      <form onSubmit={submit} className="grid gap-3 rounded-3xl border border-slate-100 bg-[#f8fbff] p-4 md:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">{t("profile.employee")}</span>
          <input
            value={form.employee}
            onChange={(event) => setForm((prev) => ({ ...prev, employee: event.target.value }))}
            className="h-10 w-full rounded-full border border-slate-200 bg-white px-4 text-sm outline-none"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">{t("profile.iban")}</span>
          <input
            value={form.iban}
            onChange={(event) => setForm((prev) => ({ ...prev, iban: event.target.value }))}
            className="h-10 w-full rounded-full border border-slate-200 bg-white px-4 font-mono text-sm outline-none"
          />
        </label>
        <label className="text-sm md:col-span-2">
          <span className="mb-1 block font-medium text-slate-700">{t("profile.address")}</span>
          <input
            value={form.address}
            onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
            className="h-10 w-full rounded-full border border-slate-200 bg-white px-4 text-sm outline-none"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">{t("profile.emergencyName")}</span>
          <input
            value={form.emergencyName}
            onChange={(event) => setForm((prev) => ({ ...prev, emergencyName: event.target.value }))}
            className="h-10 w-full rounded-full border border-slate-200 bg-white px-4 text-sm outline-none"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">{t("profile.emergencyPhone")}</span>
          <input
            value={form.emergencyPhone}
            onChange={(event) => setForm((prev) => ({ ...prev, emergencyPhone: event.target.value }))}
            className="h-10 w-full rounded-full border border-slate-200 bg-white px-4 text-sm outline-none"
          />
        </label>
        <div className="md:col-span-2">
          <button type="submit" className="h-10 rounded-full bg-[#123056] px-5 text-sm font-medium text-white">
            {t("profile.submit")}
          </button>
        </div>
      </form>

      <div className="min-h-[10rem] overflow-x-auto rounded-3xl border border-slate-100">
        <table className="min-w-[720px] w-full text-left text-sm">
          <thead className="bg-[#f7fbff] text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">{t("profile.employee")}</th>
              <th className="px-4 py-3 font-medium">{t("profile.iban")}</th>
              <th className="px-4 py-3 font-medium">{t("profile.emergencyName")}</th>
              <th className="px-4 py-3 font-medium">{t("profile.status")}</th>
              {hrDesk ? <th className="px-4 py-3 font-medium">{t("profile.action")}</th> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-slate-400" colSpan={hrDesk ? 5 : 4}>
                  {t("profile.empty")}
                </td>
              </tr>
            ) : (
              items.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3 font-medium text-slate-800">{row.employee}</td>
                  <td className="px-4 py-3 font-mono text-xs">{row.iban}</td>
                  <td className="px-4 py-3 text-xs">
                    {row.emergencyName}
                    {row.emergencyPhone ? ` · ${row.emergencyPhone}` : ""}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-700">
                      {t(`profile.status.${row.status}` as MessageKey)}
                    </span>
                  </td>
                  {hrDesk ? (
                    <td className="px-4 py-3">
                      {row.status === "pending" ? (
                        <div className="flex flex-wrap gap-1">
                          <button
                            type="button"
                            onClick={() => setStatus(row.id, "approved")}
                            className="h-8 rounded-full bg-emerald-600 px-3 text-xs font-medium text-white"
                          >
                            {t("profile.approve")}
                          </button>
                          <button
                            type="button"
                            onClick={() => setStatus(row.id, "rejected")}
                            className="h-8 rounded-full bg-slate-200 px-3 text-xs font-medium text-slate-700"
                          >
                            {t("profile.reject")}
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
    </section>
  );
}
