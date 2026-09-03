"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { AppHeader } from "@/components/header";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#eef4fb] text-slate-800">
      <Sidebar open={open} onClose={() => setOpen(false)} />

      <div className="lg:ps-[272px]">
        <AppHeader onMenu={() => setOpen(true)} />
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
