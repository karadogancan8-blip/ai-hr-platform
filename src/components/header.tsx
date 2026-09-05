"use client";

import { IconMenu } from "@/components/icons";
import { Search } from "lucide-react";
import { useCompanyBranding } from "@/components/branding/BrandingProvider";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { COMMAND_OPEN_EVENT } from "@/lib/command-bar";

type AppHeaderProps = {
  onMenu: () => void;
};

export function AppHeader({ onMenu }: AppHeaderProps) {
  const branding = useCompanyBranding();
  const { t } = useI18n();

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
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event(COMMAND_OPEN_EVENT))}
          className="hidden h-9 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 hover:bg-slate-50 sm:inline-flex"
        >
          <Search className="h-3.5 w-3.5" />
          {t("cmd.open")}
          <kbd className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold">⌘K</kbd>
        </button>
        <LanguageSwitcher />
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
