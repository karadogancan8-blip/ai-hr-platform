"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { LOCALES, localeMeta } from "@/lib/i18n";

type LanguageSwitcherProps = {
  className?: string;
};

export function LanguageSwitcher({ className = "" }: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = localeMeta[locale];

  useEffect(() => {
    if (!open) return;
    function onDoc(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("lang.label")}
      >
        <span className="text-sm leading-none" aria-hidden>
          {current.flag}
        </span>
        <span className="tabular-nums tracking-wide">{current.short}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open ? (
        <ul
          role="listbox"
          className="absolute end-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
        >
          {LOCALES.map((id) => {
            const option = localeMeta[id];
            const selected = locale === id;
            return (
              <li key={id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  dir={option.dir}
                  onClick={() => {
                    setLocale(id);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-2.5 px-3 py-2 text-sm ${
                    selected ? "bg-slate-50 font-medium text-slate-900" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-base leading-none" aria-hidden>
                    {option.flag}
                  </span>
                  <span className="min-w-0 flex-1 text-start">{option.nativeName}</span>
                  <span className="text-[10px] font-semibold tracking-wide text-slate-400">{option.short}</span>
                  {selected ? <Check className="h-3.5 w-3.5 text-sky-700" /> : <span className="h-3.5 w-3.5" />}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
