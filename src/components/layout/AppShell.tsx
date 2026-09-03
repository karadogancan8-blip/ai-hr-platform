"use client";

import { useState } from "react";
import { IconMenu } from "../icons";
import { Sidebar } from "./Sidebar";
import { useCompanyBranding } from "@/components/branding/BrandingProvider";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const branding = useCompanyBranding();

  return (
    <div className="min-h-screen bg-[#eef4fb] text-slate-800">
      <Sidebar open={open} onClose={() => setOpen(false)} />

      <div className="lg:pl-[272px]">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-sky-100/80 bg-white/80 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-lg p-2 text-slate-600 hover:bg-sky-50 lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Menüyü aç"
            >
              <IconMenu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-sky-700/70">
                İnsan Kaynakları Komuta Merkezi
              </p>
              <p className="text-sm font-semibold text-slate-800">Kurumsal AI Operasyonları</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-800 sm:block">
              Şirket izolasyonu aktif
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

        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
