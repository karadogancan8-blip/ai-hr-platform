"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Globe } from "lucide-react";
import { IconMenu } from "@/components/icons";
import { useCompanyBranding } from "@/components/branding/BrandingProvider";
import { useI18n } from "@/components/i18n/LocaleProvider";
import type { Locale } from "@/lib/i18n";

type AppHeaderProps = {
  onMenu: () => void;
};

const OPTIONS: { id: Locale; label: string }[] = [
  { id: "tr", label: "TR" },
  { id: "en", label: "EN" },
];

export function AppHeader({ onMenu }: AppHeaderProps) {
  const branding = useCompanyBranding();
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-sky-100/80 bg-white/80 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-lg p-2 text-slate-600 hover:bg-sky-50 lg:hidden"
          onClick={onMenu}
          aria-label="Menüyü aç"
        >
          <IconMenu className="h-5 w-5" />
        </button>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-sky-700/70">{t("header.kicker")}</p>
          <p className="text-sm font-semibold text-slate-800">{t("header.title")}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div
          ref={rootRef}
          className="relative"
        >
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-label={t("lang.label")}
          >
            <Globe className="h-3.5 w-3.5 text-sky-700" />
            {locale.toUpperCase()}
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>
          {open ? (
            <ul
              role="listbox"
              className="absolute right-0 mt-2 w-28 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
            >
              {OPTIONS.map((option) => (
                <li key={option.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={locale === option.id}
                    onClick={() => {
                      setLocale(option.id);
                      setOpen(false);
                    }}
                    className={`flex w-full px-3 py-2 text-left text-sm ${
                      locale === option.id ? "bg-slate-50 font-semibold text-slate-900" : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {option.label}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <div className="hidden rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-800 sm:block">
          {t("header.isolation")}
        </div>
        <div
          className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full text-xs font-semibold text-white"
          style={{ backgroundColor: branding.primaryColor }}
        >
          {branding.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={branding.logoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            branding.companyName.slice(0, 2).toUpperCase() || "İK"
          )}
        </div>
      </div>
    </header>
  );
}
