"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { AppHeader } from "@/components/header";
import { SiteFooter } from "@/components/footer";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50/80 text-slate-900">
      <Sidebar open={open} onClose={() => setOpen(false)} />

      <div className="flex min-h-screen flex-col lg:ps-[272px]">
        <AppHeader onMenu={() => setOpen(true)} />
        <main className="flex flex-1 flex-col px-5 py-8 sm:px-8 lg:px-10">{children}</main>
        <SiteFooter />
      </div>
    </div>
  );
}
