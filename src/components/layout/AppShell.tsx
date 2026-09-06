"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { AppHeader } from "@/components/header";
import { LegalLinks } from "@/components/legal/LegalLinks";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-800">
      <Sidebar open={open} onClose={() => setOpen(false)} />

      <div className="flex min-h-screen flex-col lg:ps-[272px]">
        <AppHeader onMenu={() => setOpen(true)} />
        <main className="flex flex-1 flex-col px-5 py-8 sm:px-8 lg:px-10">{children}</main>
        <footer className="shrink-0 border-t border-slate-200/80 bg-white px-5 py-5 sm:px-8 lg:px-10">
          <LegalLinks />
        </footer>
      </div>
    </div>
  );
}
