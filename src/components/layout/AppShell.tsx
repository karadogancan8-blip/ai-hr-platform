"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { AppHeader } from "@/components/header";
import { LegalLinks } from "@/components/legal/LegalLinks";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Sidebar open={open} onClose={() => setOpen(false)} />

      <div className="flex min-h-screen flex-col lg:ps-[272px]">
        <AppHeader onMenu={() => setOpen(true)} />
        <main className="flex flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        <footer className="shrink-0 border-t border-slate-200/80 bg-white px-4 py-4 sm:px-6 lg:px-8">
          <LegalLinks />
        </footer>
      </div>
    </div>
  );
}
