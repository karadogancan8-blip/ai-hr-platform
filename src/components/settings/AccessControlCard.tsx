"use client";

import { useEffect, useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { useAccessControl } from "@/components/access/AccessControlProvider";
import {
  APP_ROLES,
  ENTERPRISE_MODULES,
  VISIBILITY_OPTIONS,
  updateAccessControl,
  updateCurrentRole,
  type AccessControlMap,
  type AppRole,
  type ModuleVisibility,
} from "@/lib/access-control";

export function AccessControlCard() {
  const { access, role, canManage, loading } = useAccessControl();
  const [draft, setDraft] = useState<AccessControlMap>(access);
  const [draftRole, setDraftRole] = useState<AppRole>(role);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setDraft(access);
    setDraftRole(role);
  }, [access, role]);

  async function save() {
    setSaving(true);
    setNotice("");
    setError("");
    try {
      const roleResult = await updateCurrentRole(draftRole);
      let localOnly = roleResult.persisted === "local";
      if (canManage) {
        const accessResult = await updateAccessControl(draft);
        localOnly = localOnly || accessResult.persisted === "local";
      }
      setNotice(
        localOnly
          ? "Ayarlar kaydedildi (yerel önbellek). Supabase’de access_control / profiles.role kolonları yoksa schema.sql komutlarını çalıştırın."
          : canManage
            ? "Modül ve yetki ayarları kaydedildi."
            : "Rolünüz güncellendi. Hassas modüller bu role göre gizlenir.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yetkiler kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-2xl border border-sky-100 bg-white p-6 shadow-[0_8px_30px_rgba(15,55,95,0.06)]">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-[#123056]">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">Enterprise Access Control</p>
          <h2 className="mt-1 text-lg font-semibold text-[#0b1f3a]">Modül ve Yetki Yönetimi</h2>
          <p className="mt-1 text-sm text-slate-500">
            Her gelişmiş özellik için önce modülü açın/kapatın, ardından kimlerin göreceğini seçin. employee ve
            hr_specialist, admin’in gizlediği hassas modülleri menüde ve raporlarda göremez.
          </p>
        </div>
      </div>

      {loading ? <p className="mt-4 text-sm text-slate-400">Yetki ayarları yükleniyor…</p> : null}
      {error ? (
        <p className="mt-4 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>
      ) : null}
      {notice ? (
        <p className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {notice}
        </p>
      ) : null}

      <label className="mt-5 block text-sm">
        <span className="mb-1 block font-medium text-slate-700">Bu oturumdaki rol</span>
        <select
          value={draftRole}
          onChange={(event) => setDraftRole(event.target.value as AppRole)}
          className="w-full max-w-md rounded-xl border border-slate-200 bg-[#f8fbff] px-3 py-2.5 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
        >
          {APP_ROLES.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label} — {item.hint}
            </option>
          ))}
        </select>
      </label>

      <div className="mt-5 space-y-3">
        {ENTERPRISE_MODULES.map((module) => {
          const item = draft[module.id];
          return (
            <article
              key={module.id}
              className="rounded-2xl border border-slate-100 bg-[#f8fbff] p-4"
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-[#0b1f3a]">{module.title}</h3>
                    {module.sensitive ? (
                      <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rose-700">
                        Hassas
                      </span>
                    ) : null}
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                        item.enabled ? "bg-emerald-50 text-emerald-800" : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {item.enabled ? "Aktif" : "Pasif"}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">{module.subtitle}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[420px]">
                  <label className="flex items-center justify-between gap-3 rounded-xl border border-sky-100 bg-white px-3 py-2">
                    <span className="text-xs font-medium text-slate-600">Modül durumu</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={item.enabled}
                      disabled={!canManage}
                      onClick={() =>
                        setDraft((prev) => ({
                          ...prev,
                          [module.id]: { ...prev[module.id], enabled: !prev[module.id].enabled },
                        }))
                      }
                      className={`relative h-6 w-11 rounded-full transition ${
                        item.enabled ? "bg-[#123056]" : "bg-slate-300"
                      } disabled:opacity-50`}
                    >
                      <span
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
                          item.enabled ? "left-5" : "left-0.5"
                        }`}
                      />
                    </button>
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[11px] font-medium text-slate-500">Görünürlük yetkisi</span>
                    <select
                      value={item.visibility}
                      disabled={!canManage || !item.enabled}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          [module.id]: {
                            ...prev[module.id],
                            visibility: event.target.value as ModuleVisibility,
                          },
                        }))
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-sky-400 disabled:opacity-50"
                    >
                      {VISIBILITY_OPTIONS.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => void save()}
        disabled={saving || loading}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#123056] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#0f2744] disabled:opacity-50"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
        {canManage ? "Yetkileri kaydet" : "Rolü kaydet"}
      </button>
      {!canManage ? (
        <p className="mt-2 text-xs text-slate-500">
          Modül aç/kapa ve görünürlük yalnızca şirket admini tarafından değiştirilir.
        </p>
      ) : null}
    </section>
  );
}
