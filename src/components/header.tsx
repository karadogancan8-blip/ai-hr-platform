"use client";

import { IconMenu } from "@/components/icons";
import { useCompanyBranding } from "@/components/branding/BrandingProvider";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { LanguageSwitcher } from "@/components/language-switcher";
import { CommandSearchButton } from "@/components/ui/command-search-button";

type AppHeaderProps = {
  onMenu: () => void;
};

export function AppHeader({ onMenu }: AppHeaderProps) {
  const branding = useCompanyBranding();
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/90 px-5 shadow-sm backdrop-blur-md sm:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          className="overflow-hidden rounded-full p-2 text-slate-600 hover:bg-sky-50 lg:hidden"
          onClick={onMenu}
          aria-label="Menüyü aç"
        >
          <IconMenu className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-slate-500">{t("header.kicker")}</p>
          <p className="truncate text-sm font-bold text-slate-900">{t("header.title")}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <CommandSearchButton compact className="sm:hidden" />
        <CommandSearchButton className="hidden sm:inline-flex" />
        <LanguageSwitcher />
        <div className="hidden overflow-hidden rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-800 lg:block">
          {t("header.isolation")}
        </div>
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-semibold text-white"
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
