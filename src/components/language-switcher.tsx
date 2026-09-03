"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { LOCALES, localeMeta, type Locale } from "@/lib/i18n";

type LanguageSwitcherProps = {
  className?: string;
};

function LanguageRow({ id }: { id: Locale }) {
  const option = localeMeta[id];
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="text-[15px] leading-none" aria-hidden>
        {option.flag}
      </span>
      <span className="text-[11px] font-semibold tracking-wide text-slate-600">{option.short}</span>
    </span>
  );
}

export function LanguageSwitcher({ className = "" }: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

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
        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2 py-1.5 text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("lang.label")}
        title={`${localeMeta[locale].flag} ${localeMeta[locale].short} – ${localeMeta[locale].nativeName}`}
      >
        <LanguageRow id={locale} />
        <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open ? (
        <ul
          role="listbox"
          className="absolute end-0 z-50 mt-2 w-36 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 p-1 shadow-[0_18px_40px_-18px_rgba(15,23,42,0.45)] backdrop-blur-sm"
        >
          {LOCALES.map((id) => {
            const selected = locale === id;
            return (
              <li key={id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    setLocale(id);
                    setOpen(false);
                  }}
                  className={`inline-flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-start transition ${
                    selected
                      ? "bg-sky-50 text-slate-900 shadow-sm"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <LanguageRow id={id} />
                  {selected ? <Check className="ms-auto h-3.5 w-3.5 shrink-0 text-sky-700" /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
