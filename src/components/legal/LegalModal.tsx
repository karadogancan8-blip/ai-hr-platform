"use client";

import { X } from "lucide-react";
import { LegalArticle } from "@/components/legal/LegalArticle";
import { useI18n } from "@/components/i18n/LocaleProvider";
import type { LegalDocId } from "@/lib/legal-docs";

export function LegalModal({
  docId,
  onClose,
}: {
  docId: LegalDocId | null;
  onClose: () => void;
}) {
  const { t } = useI18n();
  if (!docId) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/45 p-4 backdrop-blur-[2px] sm:items-center">
      <button type="button" className="absolute inset-0" aria-label={t("common.close")} onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className="relative flex h-[min(88vh,44rem)] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,55,95,0.22)]"
      >
        <div className="flex h-14 shrink-0 items-center justify-end border-b border-slate-100 px-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-700"
            aria-label={t("common.close")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
          <LegalArticle docId={docId} />
        </div>
      </div>
    </div>
  );
}
