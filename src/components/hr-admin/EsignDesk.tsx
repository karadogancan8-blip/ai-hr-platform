"use client";

import { FormEvent, useEffect, useRef, useState, type MouseEvent, type TouchEvent } from "react";
import { PenLine } from "lucide-react";
import { useAccessControl } from "@/components/access/AccessControlProvider";
import { SelectField } from "@/components/ui/SelectField";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { ESIGN_STORAGE_KEY, ESIGN_UPDATED_EVENT, type EsignPacket, type EsignTemplate } from "@/lib/esign";
import { readLocalJson, writeLocalJson } from "@/lib/session-store";
import { cardSurface } from "@/components/ui/surface";
import type { MessageKey } from "@/lib/i18n";

function persist(items: EsignPacket[]) {
  writeLocalJson(ESIGN_STORAGE_KEY, items);
  window.dispatchEvent(new Event(ESIGN_UPDATED_EVENT));
}

export function EsignDesk() {
  const { t } = useI18n();
  const { role } = useAccessControl();
  const hrDesk = role === "company_admin" || role === "hr_manager";
  const [packets, setPackets] = useState<EsignPacket[]>([]);
  const [employee, setEmployee] = useState("");
  const [template, setTemplate] = useState<EsignTemplate>("contract");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [typedName, setTypedName] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  useEffect(() => {
    function load() {
      setPackets(readLocalJson<EsignPacket[]>(ESIGN_STORAGE_KEY, []));
    }
    load();
    window.addEventListener(ESIGN_UPDATED_EVENT, load);
    return () => window.removeEventListener(ESIGN_UPDATED_EVENT, load);
  }, []);

  function send(event: FormEvent) {
    event.preventDefault();
    if (!employee.trim()) return;
    const packet: EsignPacket = {
      id: crypto.randomUUID(),
      employee: employee.trim(),
      template,
      status: "pending",
      typedName: "",
      signatureDataUrl: "",
      createdAt: new Date().toISOString(),
      signedAt: "",
    };
    const next = [packet, ...packets];
    setPackets(next);
    persist(next);
    setEmployee("");
  }

  function paint(event: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas || !drawing.current) return;
    const rect = canvas.getBoundingClientRect();
    const point = "touches" in event ? event.touches[0] : event;
    const ctx = canvas.getContext("2d");
    if (!ctx || !point) return;
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#123056";
    ctx.lineTo(point.clientX - rect.left, point.clientY - rect.top);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(point.clientX - rect.left, point.clientY - rect.top);
  }

  function sign() {
    const packet = packets.find((item) => item.id === activeId);
    const canvas = canvasRef.current;
    if (!packet || !typedName.trim() || !canvas) return;
    const next = packets.map((item) =>
      item.id === packet.id
        ? {
            ...item,
            status: "signed" as const,
            typedName: typedName.trim(),
            signatureDataUrl: canvas.toDataURL("image/png"),
            signedAt: new Date().toISOString(),
          }
        : item,
    );
    setPackets(next);
    persist(next);
    setActiveId(null);
    setTypedName("");
  }

  const active = packets.find((item) => item.id === activeId) ?? null;

  return (
    <section className={`${cardSurface} min-h-[28rem] w-full space-y-4 transition-none`}>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-700">{t("esign.kicker")}</p>
        <h2 className="mt-1 text-base font-semibold text-[#0b1f3a]">{t("esign.title")}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">{t("esign.lead")}</p>
      </div>

      {hrDesk ? (
        <form onSubmit={send} className="grid gap-3 rounded-3xl border border-slate-100 bg-[#f8fbff] p-4 md:grid-cols-3">
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">{t("esign.employee")}</span>
            <input
              value={employee}
              onChange={(event) => setEmployee(event.target.value)}
              className="h-10 w-full rounded-full border border-slate-200 bg-white px-4 text-sm outline-none"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">{t("esign.template")}</span>
            <SelectField
              value={template}
              onChange={(event) => setTemplate(event.target.value as EsignTemplate)}
              className="h-10 w-full"
              wrapperClassName="h-10 rounded-full"
            >
              <option value="contract">{t("esign.tpl.contract")}</option>
              <option value="nda">{t("esign.tpl.nda")}</option>
              <option value="asset">{t("esign.tpl.asset")}</option>
            </SelectField>
          </label>
          <div className="flex items-end">
            <button type="submit" className="h-10 w-full rounded-full bg-[#123056] text-sm font-medium text-white">
              {t("esign.send")}
            </button>
          </div>
        </form>
      ) : null}

      <div className="min-h-[9rem] overflow-x-auto rounded-3xl border border-slate-100">
        <table className="min-w-[640px] w-full text-left text-sm">
          <thead className="bg-[#f7fbff] text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">{t("esign.employee")}</th>
              <th className="px-4 py-3 font-medium">{t("esign.template")}</th>
              <th className="px-4 py-3 font-medium">{t("esign.status")}</th>
              <th className="px-4 py-3 font-medium">{t("esign.action")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {packets.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-slate-400" colSpan={4}>
                  {t("esign.empty")}
                </td>
              </tr>
            ) : (
              packets.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3 font-medium text-slate-800">{row.employee}</td>
                  <td className="px-4 py-3">{t(`esign.tpl.${row.template}` as MessageKey)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                        row.status === "signed" ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"
                      }`}
                    >
                      {t(`esign.status.${row.status}` as MessageKey)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {row.status === "pending" ? (
                      <button
                        type="button"
                        onClick={() => setActiveId(row.id)}
                        className="inline-flex h-9 items-center gap-1 rounded-full bg-[#123056] px-3 text-xs font-medium text-white"
                      >
                        <PenLine className="h-3.5 w-3.5" />
                        {t("esign.sign")}
                      </button>
                    ) : (
                      <span className="text-xs text-slate-500">{row.typedName}</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {active ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/45 p-4 sm:items-center">
          <button type="button" className="absolute inset-0" aria-label={t("common.close")} onClick={() => setActiveId(null)} />
          <div className="relative w-full max-w-lg space-y-3 rounded-3xl border border-slate-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-slate-900">{t("esign.modalTitle")}</h3>
            <p className="text-sm text-slate-500">
              {t("esign.modalLead", { name: active.employee, doc: t(`esign.tpl.${active.template}` as MessageKey) })}
            </p>
            <canvas
              ref={canvasRef}
              width={480}
              height={160}
              className="h-40 w-full touch-none rounded-3xl border border-slate-200 bg-[#f8fbff]"
              onMouseDown={() => {
                drawing.current = true;
                canvasRef.current?.getContext("2d")?.beginPath();
              }}
              onMouseUp={() => {
                drawing.current = false;
              }}
              onMouseLeave={() => {
                drawing.current = false;
              }}
              onMouseMove={paint}
              onTouchStart={() => {
                drawing.current = true;
              }}
              onTouchEnd={() => {
                drawing.current = false;
              }}
              onTouchMove={paint}
            />
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-700">{t("esign.typedName")}</span>
              <input
                value={typedName}
                onChange={(event) => setTypedName(event.target.value)}
                className="h-10 w-full rounded-full border border-slate-200 px-4 text-sm outline-none"
              />
            </label>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveId(null)}
                className="h-10 rounded-full border border-slate-200 px-4 text-sm"
              >
                {t("common.cancel")}
              </button>
              <button
                type="button"
                onClick={sign}
                disabled={!typedName.trim()}
                className="h-10 rounded-full bg-[#123056] px-4 text-sm font-medium text-white disabled:opacity-50"
              >
                {t("esign.confirm")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
