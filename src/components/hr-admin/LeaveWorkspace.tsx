"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  deleteLeaveRequest,
  fetchLeaveRequests,
  insertLeaveRequest,
  updateLeaveStatus,
} from "@/lib/leave-requests";
import { isSupabaseConfigured } from "@/lib/supabase";
import type { LeaveRequest, LeaveStatus, LeaveType } from "@/lib/types";
import { HelpTitle } from "@/components/ui/HelpTip";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DeleteIconButton } from "@/components/ui/DeleteIconButton";
import { HrDocsAndAppeal } from "@/components/hr-docs/HrDocsAndAppeal";
import { AppealsInbox } from "@/components/hr-admin/AppealsInbox";
import { useAccessControl } from "@/components/access/AccessControlProvider";
import { useI18n } from "@/components/i18n/LocaleProvider";
import type { MessageKey } from "@/lib/i18n";

const statusStyle: Record<LeaveStatus, string> = {
  beklemede: "bg-amber-50 text-amber-800",
  onaylandi: "bg-emerald-50 text-emerald-800",
  reddedildi: "bg-rose-50 text-rose-800",
};

function daysBetween(start: string, end: string) {
  const a = new Date(start);
  const b = new Date(end);
  const diff = Math.round((b.getTime() - a.getTime()) / 86400000) + 1;
  return Number.isFinite(diff) && diff > 0 ? diff : 1;
}

function shortId(id: string) {
  return id.replace(/-/g, "").slice(0, 8).toUpperCase();
}

export function LeaveWorkspace() {
  const { t } = useI18n();
  const { role } = useAccessControl();
  const hrDesk = role === "company_admin" || role === "hr_manager";
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    employee: "",
    department: "İnsan Kaynakları",
    type: "yillik" as LeaveType,
    startDate: "2026-09-10",
    endDate: "2026-09-12",
    reason: "",
  });

  const pending = useMemo(
    () => requests.filter((item) => item.status === "beklemede"),
    [requests],
  );

  async function loadRequests() {
    if (!isSupabaseConfigured()) {
      setError(
        "Supabase yapılandırılmamış. NEXT_PUBLIC_SUPABASE_URL ve anon/publishable anahtarı .env.local dosyasına ekleyin.",
      );
      setLoading(false);
      return;
    }
    try {
      setError("");
      const rows = await fetchLeaveRequests();
      setRequests(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "İzin talepleri yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadRequests();
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!form.employee.trim() || !form.reason.trim()) {
      setNotice(t("leave.required"));
      return;
    }
    setSaving(true);
    setNotice("");
    try {
      const created = await insertLeaveRequest({
        employee: form.employee.trim(),
        department: form.department,
        type: form.type,
        startDate: form.startDate,
        endDate: form.endDate,
        days: daysBetween(form.startDate, form.endDate),
        reason: form.reason.trim(),
        status: "beklemede",
      });
      setRequests((prev) => [created, ...prev]);
      setForm((prev) => ({ ...prev, employee: "", reason: "" }));
      setNotice(t("leave.saved"));
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Kayıt başarısız.");
    } finally {
      setSaving(false);
    }
  }

  async function setStatus(id: string, status: LeaveStatus) {
    try {
      const updated = await updateLeaveStatus(id, status);
      setRequests((prev) => prev.map((item) => (item.id === id ? updated : item)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Durum güncellenemedi.");
    }
  }

  async function removeRequest(id: string) {
    try {
      await deleteLeaveRequest(id);
      setRequests((prev) => prev.filter((item) => item.id !== id));
      setNotice(t("leave.deleted"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("leave.deleted"));
    } finally {
      setDeleteId(null);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">{t("leave.kicker")}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#0b1f3a]">
          <HelpTitle hint={t("leave.hint")}>{t("leave.title")}</HelpTitle>
        </h1>
        <p className="mt-2 text-sm leading-7 text-slate-500">{t("leave.description")}</p>
      </div>

      {error ? (
        <p className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,380px)_1fr]">
        <form
          onSubmit={submit}
          className="space-y-4 rounded-2xl border border-slate-200/70 bg-white p-6"
        >
          <h2 className="text-base font-semibold text-[#0b1f3a]">{t("leave.form")}</h2>
          <label className="block text-sm">
            <span className="mb-1 block text-slate-600">{t("leave.employee")}</span>
            <input
              value={form.employee}
              onChange={(event) => setForm({ ...form, employee: event.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-[#f8fbff] px-3 py-2.5 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
              placeholder="Ad Soyad"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-slate-600">{t("leave.dept")}</span>
            <select
              value={form.department}
              onChange={(event) => setForm({ ...form, department: event.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-[#f8fbff] px-3 py-2.5 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
            >
              {["İnsan Kaynakları", "Finans", "Satış", "Ürün", "Operasyon", "Teknoloji"].map((dept) => (
                <option key={dept}>{dept}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-slate-600">{t("leave.type")}</span>
            <select
              value={form.type}
              onChange={(event) => setForm({ ...form, type: event.target.value as LeaveType })}
              className="w-full rounded-xl border border-slate-200 bg-[#f8fbff] px-3 py-2.5 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
            >
              {(["yillik", "mazeret", "hastalik", "ucretsiz"] as LeaveType[]).map((key) => (
                <option key={key} value={key}>
              {t(`leave.type.${key}` as MessageKey)}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="mb-1 block text-slate-600">{t("leave.start")}</span>
              <input
                type="date"
                value={form.startDate}
                onChange={(event) => setForm({ ...form, startDate: event.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-[#f8fbff] px-3 py-2.5 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-slate-600">{t("leave.end")}</span>
              <input
                type="date"
                value={form.endDate}
                onChange={(event) => setForm({ ...form, endDate: event.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-[#f8fbff] px-3 py-2.5 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
              />
            </label>
          </div>
          <label className="block text-sm">
            <span className="mb-1 block text-slate-600">{t("leave.reason")}</span>
            <textarea
              value={form.reason}
              onChange={(event) => setForm({ ...form, reason: event.target.value })}
              rows={3}
              className="w-full rounded-xl border border-slate-200 bg-[#f8fbff] px-3 py-2.5 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
              placeholder={t("leave.reasonPlaceholder")}
            />
          </label>
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-[#123056] py-2.5 text-sm font-medium text-white hover:bg-[#0f2744] disabled:opacity-50"
          >
            {saving ? t("leave.saving") : t("leave.submit")}
          </button>
          {notice ? <p className="text-xs text-sky-800">{notice}</p> : null}
        </form>

        <section className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white">
          <div className="flex items-center justify-between gap-3 border-b border-sky-50 px-5 py-4">
            <h2 className="text-base font-semibold text-[#0b1f3a]">{t("leave.table")}</h2>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-800">
                {t("leave.pendingCount", { pending: pending.length, total: requests.length })}
              </span>
              <button
                type="button"
                onClick={() => {
                  setLoading(true);
                  void loadRequests();
                }}
                className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                {t("common.refresh")}
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[#f7fbff] text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">{t("leave.code")}</th>
                  <th className="px-4 py-3 font-medium">{t("leave.employee")}</th>
                  <th className="px-4 py-3 font-medium">{t("leave.type")}</th>
                  <th className="px-4 py-3 font-medium">{t("leave.dates")}</th>
                  <th className="px-4 py-3 font-medium">{t("leave.days")}</th>
                  <th className="px-4 py-3 font-medium">{t("leave.status")}</th>
                  <th className="px-4 py-3 font-medium">{t("leave.action")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td className="px-4 py-8 text-sm text-slate-400" colSpan={7}>
                    {t("leave.loading")}
                    </td>
                  </tr>
                ) : null}
                {!loading && requests.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-sm text-slate-400" colSpan={7}>
                    {t("leave.empty")}
                    </td>
                  </tr>
                ) : null}
                {requests.map((row) => (
                  <tr key={row.id} className="group align-top">
                    <td className="px-4 py-4 font-medium text-slate-700">{shortId(row.id)}</td>
                    <td className="px-4 py-4">
                      <div className="font-medium text-slate-900">{row.employee}</div>
                      <div className="mt-1 text-xs text-slate-400">{row.department}</div>
                    </td>
                    <td className="px-4 py-4">{t(`leave.type.${row.type}` as MessageKey)}</td>
                    <td className="px-4 py-4 text-xs leading-5 text-slate-600">
                      {row.startDate} → {row.endDate}
                    </td>
                    <td className="px-4 py-4">{row.days}</td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle[row.status]}`}>
                        {t(`leave.status.${row.status}` as MessageKey)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        {row.status === "beklemede" ? (
                          <>
                            <button
                              type="button"
                              onClick={() => void setStatus(row.id, "onaylandi")}
                              className="rounded-lg bg-emerald-600 px-2 py-1 text-xs font-medium text-white"
                            >
                              {t("leave.approve")}
                            </button>
                            <button
                              type="button"
                              onClick={() => void setStatus(row.id, "reddedildi")}
                              className="rounded-lg bg-slate-200 px-2 py-1 text-xs font-medium text-slate-700"
                            >
                              {t("leave.reject")}
                            </button>
                          </>
                        ) : null}
                        <DeleteIconButton label={t("common.delete")} onClick={() => setDeleteId(row.id)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <HrDocsAndAppeal
        storageKey="nexus-docs-leave"
        subjectLabel="izin-ozluk"
        appealButtonKey="appeal.button.leave"
        appealTitleKey="appeal.title.leave"
        appealLeadKey="appeal.lead.leave"
      />
      {hrDesk ? <AppealsInbox /> : null}
      <ConfirmDialog
        open={Boolean(deleteId)}
        title={t("common.delete")}
        body={t("leave.deleteConfirm")}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) void removeRequest(deleteId);
        }}
      />
    </div>
  );
}
