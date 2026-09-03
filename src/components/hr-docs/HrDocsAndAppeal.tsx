"use client";

import { FormEvent, useEffect, useState } from "react";
import { FileUp, X } from "lucide-react";
import { useI18n } from "@/components/i18n/LocaleProvider";
import type { MessageKey } from "@/lib/i18n";

export type PersonnelFile = {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
};

type HrDocsAndAppealProps = {
  storageKey: string;
  subjectLabel?: string;
  showDocs?: boolean;
  showAppeal?: boolean;
  appealButtonKey?: MessageKey;
  appealTitleKey?: MessageKey;
  appealLeadKey?: MessageKey;
};

function readFiles(key: string): PersonnelFile[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as PersonnelFile[]) : [];
  } catch {
    return [];
  }
}

export function HrDocsAndAppeal({
  storageKey,
  subjectLabel,
  showDocs = true,
  showAppeal = true,
  appealButtonKey = "appeal.button",
  appealTitleKey = "appeal.title",
  appealLeadKey = "appeal.lead",
}: HrDocsAndAppealProps) {
  const { t } = useI18n();
  const [files, setFiles] = useState<PersonnelFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [notice, setNotice] = useState("");
  const [appealOpen, setAppealOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [detail, setDetail] = useState("");

  useEffect(() => {
    if (showDocs) setFiles(readFiles(storageKey));
  }, [storageKey, showDocs]);

  function persist(next: PersonnelFile[]) {
    setFiles(next);
    window.sessionStorage.setItem(storageKey, JSON.stringify(next));
  }

  function ingest(list: FileList | null) {
    if (!list?.length) return;
    const accepted = Array.from(list).filter(
      (file) => /pdf|image|jpeg|png|webp|jpg/i.test(file.type) || /\.(pdf|png|jpe?g|webp)$/i.test(file.name),
    );
    if (!accepted.length) {
      setNotice(t("docs.invalidType"));
      return;
    }
    const added = accepted.map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      type: file.type || "application/octet-stream",
      size: file.size,
      uploadedAt: new Date().toISOString(),
    }));
    persist([...added, ...files]);
    setNotice(t("docs.uploaded"));
  }

  function submitAppeal(event: FormEvent) {
    event.preventDefault();
    if (!reason.trim()) return;
    window.sessionStorage.setItem(
      `${storageKey}:appeal`,
      JSON.stringify({
        reason,
        detail,
        subjectLabel,
        createdAt: new Date().toISOString(),
      }),
    );
    setAppealOpen(false);
    setReason("");
    setDetail("");
    setNotice(t("appeal.sent"));
  }

  const appealButton = showAppeal ? (
    <button
      type="button"
      onClick={() => setAppealOpen(true)}
      className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900 hover:bg-amber-100"
    >
      {t(appealButtonKey)}
    </button>
  ) : null;

  const modal = appealOpen ? (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/45 p-4 backdrop-blur-[2px] sm:items-center">
      <button type="button" className="absolute inset-0" aria-label={t("common.close")} onClick={() => setAppealOpen(false)} />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.18)]"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">{t("appeal.kicker")}</p>
            <h3 className="mt-1 text-lg font-semibold text-slate-900">{t(appealTitleKey)}</h3>
            <p className="mt-1 text-sm text-slate-500">{t(appealLeadKey)}</p>
          </div>
          <button type="button" onClick={() => setAppealOpen(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50" aria-label={t("common.close")}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={submitAppeal} className="mt-4 space-y-3">
          <label className="block text-sm">
            <span className="mb-1 block text-slate-600">{t("appeal.reason")}</span>
            <select
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-sky-400"
            >
              <option value="">{t("appeal.reasonPlaceholder")}</option>
              <option value="score">{t("appeal.reasonScore")}</option>
              <option value="facts">{t("appeal.reasonFacts")}</option>
              <option value="docs">{t("appeal.reasonDocs")}</option>
              <option value="other">{t("appeal.reasonOther")}</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-slate-600">{t("appeal.detail")}</span>
            <textarea
              value={detail}
              onChange={(event) => setDetail(event.target.value)}
              rows={4}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-sky-400"
              placeholder={t("appeal.detailPlaceholder")}
            />
          </label>
          <button type="submit" className="w-full rounded-xl bg-[#123056] py-2.5 text-sm font-medium text-white hover:bg-[#0f2744]">
            {t("appeal.submit")}
          </button>
        </form>
      </div>
    </div>
  ) : null;

  if (!showDocs) {
    return (
      <section className="space-y-2">
        <div className="flex flex-wrap items-center justify-end gap-3">{appealButton}</div>
        {notice ? <p className="text-end text-xs text-sky-800">{notice}</p> : null}
        {modal}
      </section>
    );
  }

  return (
    <section className="space-y-3 rounded-2xl border border-sky-100 bg-white p-5 shadow-[0_8px_30px_rgba(15,55,95,0.06)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[#0b1f3a]">{t("docs.title")}</h2>
          <p className="mt-0.5 text-sm text-slate-500">{t("docs.hint")}</p>
        </div>
        {appealButton}
      </div>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          ingest(event.dataTransfer.files);
        }}
        className={`rounded-2xl border-2 border-dashed p-6 text-center ${
          dragging ? "border-sky-500 bg-sky-50" : "border-slate-200 bg-slate-50/70"
        }`}
      >
        <FileUp className="mx-auto h-7 w-7 text-slate-400" />
        <p className="mt-2 text-sm font-medium text-slate-800">{t("docs.drop")}</p>
        <p className="mt-1 text-xs text-slate-500">PDF, PNG, JPG, WEBP</p>
        <label className="mt-3 inline-flex cursor-pointer rounded-xl bg-[#123056] px-3 py-2 text-xs font-medium text-white hover:bg-[#0f2744]">
          {t("docs.browse")}
          <input
            type="file"
            accept="application/pdf,image/*"
            multiple
            className="hidden"
            onChange={(event) => ingest(event.target.files)}
          />
        </label>
      </div>

      {files.length ? (
        <ul className="space-y-2">
          {files.map((file) => (
            <li
              key={file.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm"
            >
              <span className="min-w-0 truncate text-slate-700">{file.name}</span>
              <span className="shrink-0 text-xs text-slate-400">{Math.max(1, Math.round(file.size / 1024))} KB</span>
            </li>
          ))}
        </ul>
      ) : null}
      {notice ? <p className="text-xs text-sky-800">{notice}</p> : null}
      {modal}
    </section>
  );
}
