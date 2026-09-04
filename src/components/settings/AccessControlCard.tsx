"use client";

import { useEffect, useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { useI18n } from "@/components/i18n/LocaleProvider";
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
import type { MessageKey } from "@/lib/i18n";
import { SelectField } from "@/components/ui/SelectField";

export function AccessControlCard() {
  const { t } = useI18n();
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
          ? t("access.savedLocal")
          : canManage
            ? t("access.saved")
            : t("access.roleUpdated"),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : t("access.fail"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200/70 bg-white p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-[#123056]">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">{t("access.kicker")}</p>
          <h2 className="mt-1 text-lg font-semibold text-[#0b1f3a]">{t("access.title")}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">{t("access.description")}</p>
        </div>
      </div>

      {loading ? <p className="mt-4 text-sm text-slate-400">{t("access.loading")}</p> : null}
      {error ? (
        <p className="mt-4 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>
      ) : null}
      {notice ? (
        <p className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {notice}
        </p>
      ) : null}

      <label className="mt-5 block text-sm">
        <span className="mb-1 block font-medium text-slate-700">{t("access.roleSession")}</span>
        <SelectField
          value={draftRole}
          onChange={(event) => setDraftRole(event.target.value as AppRole)}
          wrapperClassName="max-w-md"
        >
          {APP_ROLES.map((item) => (
            <option key={item.id} value={item.id}>
              {t(`access.role.${item.id}` as MessageKey)} — {t(`access.roleHint.${item.id}` as MessageKey)}
            </option>
          ))}
        </SelectField>
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
                    <h3 className="text-sm font-semibold text-[#0b1f3a]">{t(`enterprise.${module.id}.title` as MessageKey)}</h3>
                    {module.sensitive ? (
                      <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rose-700">
                        {t("access.sensitive")}
                      </span>
                    ) : null}
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                        item.enabled ? "bg-emerald-50 text-emerald-800" : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {item.enabled ? t("access.active") : t("access.inactive")}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">{t(`enterprise.${module.id}.description` as MessageKey)}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[420px]">
                  <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/70 bg-white px-3 py-2">
                    <span className="text-xs font-medium text-slate-600">{t("access.moduleStatus")}</span>
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
                    <span className="mb-1 block text-[11px] font-medium text-slate-500">{t("access.visibility")}</span>
                    <SelectField
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
                      className="text-xs"
                    >
                      {VISIBILITY_OPTIONS.map((option) => (
                        <option key={option.id} value={option.id}>
                          {t(`access.vis.${option.id}` as MessageKey)}
                        </option>
                      ))}
                    </SelectField>
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
        {canManage ? t("access.save") : t("access.saveRole")}
      </button>
      {!canManage ? (
        <p className="mt-2 text-xs text-slate-500">{t("access.adminOnly")}</p>
      ) : null}
    </section>
  );
}
