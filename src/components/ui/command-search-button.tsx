"use client";

import { Search } from "lucide-react";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { COMMAND_OPEN_EVENT } from "@/lib/command-bar";

export function CommandSearchButton({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  const { t } = useI18n();

  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(COMMAND_OPEN_EVENT))}
      aria-label={t("cmd.open")}
      className={`inline-flex h-9 max-w-full items-center justify-center gap-2 overflow-hidden rounded-full border border-slate-200/80 bg-white text-xs font-medium text-slate-600 shadow-sm transition-all hover:shadow-md ${
        compact ? "w-9 px-0" : "px-3"
      } ${className}`}
    >
      <Search className="h-3.5 w-3.5 shrink-0" />
      {compact ? null : (
        <>
          <span className="min-w-0 truncate">{t("cmd.open")}</span>
          <kbd className="hidden h-6 shrink-0 items-center rounded-full bg-slate-100 px-2 text-[10px] font-semibold text-slate-500 sm:inline-flex">
            {t("cmd.shortcut")}
          </kbd>
        </>
      )}
    </button>
  );
}
