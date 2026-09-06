"use client";

import Link from "next/link";
import { LegalLinks } from "@/components/legal/LegalLinks";
import { useI18n } from "@/components/i18n/LocaleProvider";
import type { LegalDocId } from "@/lib/legal-docs";

export function SiteFooter({
  showPlans = false,
  onOpenLegal,
}: {
  showPlans?: boolean;
  onOpenLegal?: (id: LegalDocId) => void;
}) {
  const { t } = useI18n();
  return (
    <footer className="shrink-0 border-t border-slate-200/80 bg-white px-4 py-6 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-h-[2.5rem]">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Nexus HR · {t("landing.footer")}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">{t("legal.contact")}</p>
        </div>
        <div className="flex min-h-[2.5rem] max-w-xl flex-col items-start gap-3 sm:items-end">
          <LegalLinks onOpen={onOpenLegal} />
          {showPlans ? (
            <Link href="/fiyatlandirma" className="text-xs font-medium text-sky-800 hover:underline">
              {t("landing.plans")}
            </Link>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
