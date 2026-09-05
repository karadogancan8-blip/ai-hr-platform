"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, CircleDashed, Mail } from "lucide-react";
import { useI18n } from "@/components/i18n/LocaleProvider";
import {
  IT_APPS,
  IT_PROVISION_EVENT,
  IT_PROVISION_KEY,
  emptyItRecord,
  type ItAppId,
  type ItAppStatus,
  type ItProvisionRecord,
} from "@/lib/it-provisioning";
import { readLocalJson, writeLocalJson } from "@/lib/session-store";
import type { MessageKey } from "@/lib/i18n";

const nextStatus: Record<ItAppStatus, ItAppStatus> = {
  pending: "invited",
  invited: "active",
  active: "pending",
};

function persist(map: Record<string, ItProvisionRecord>) {
  writeLocalJson(IT_PROVISION_KEY, map);
  window.dispatchEvent(new Event(IT_PROVISION_EVENT));
}

type ItProvisioningListProps = {
  employeeName: string;
};

export function ItProvisioningList({ employeeName }: ItProvisioningListProps) {
  const { t } = useI18n();
  const [map, setMap] = useState<Record<string, ItProvisionRecord>>({});
  const key = employeeName.trim().toLocaleLowerCase("tr");

  useEffect(() => {
    function load() {
      setMap(readLocalJson<Record<string, ItProvisionRecord>>(IT_PROVISION_KEY, {}));
    }
    load();
    window.addEventListener(IT_PROVISION_EVENT, load);
    return () => window.removeEventListener(IT_PROVISION_EVENT, load);
  }, []);

  const record = useMemo(() => {
    if (!key) return null;
    return map[key] ?? emptyItRecord(employeeName);
  }, [map, key, employeeName]);

  function cycle(appId: ItAppId) {
    if (!record) return;
    const next: ItProvisionRecord = {
      ...record,
      employeeName: employeeName.trim(),
      apps: record.apps.map((app) => (app.id === appId ? { ...app, status: nextStatus[app.status] } : app)),
    };
    const stored = { ...map, [key]: next };
    setMap(stored);
    persist(stored);
  }

  const done = record?.apps.filter((app) => app.status === "active").length ?? 0;

  return (
    <section className="min-h-[16rem] rounded-3xl border border-slate-200/70 bg-white p-5 transition-none">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">{t("it.kicker")}</p>
          <h2 className="mt-1 text-base font-semibold text-[#0b1f3a]">{t("it.title")}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">{t("it.lead")}</p>
        </div>
        <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800">
          {done}/{IT_APPS.length}
        </span>
      </div>

      <div className="mt-4 min-h-[10rem]">
        {!employeeName.trim() ? (
          <p className="flex min-h-[10rem] items-center text-sm text-slate-400">{t("it.needEmployee")}</p>
        ) : (
          <ul className="space-y-2">
            {IT_APPS.map((id) => {
              const app = record?.apps.find((item) => item.id === id);
              const status = app?.status ?? "pending";
              const Icon = status === "active" ? CheckCircle2 : status === "invited" ? Mail : CircleDashed;
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => cycle(id)}
                    className="flex h-14 w-full items-center justify-between rounded-full border border-slate-100 bg-[#f8fbff] px-4 text-left"
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-4 w-4 text-[#123056]" />
                      <span className="text-sm font-medium text-slate-800">{t(`it.app.${id}` as MessageKey)}</span>
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        status === "active"
                          ? "bg-emerald-50 text-emerald-800"
                          : status === "invited"
                            ? "bg-amber-50 text-amber-800"
                            : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {t(`it.status.${status}` as MessageKey)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
