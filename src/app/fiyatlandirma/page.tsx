"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PricingWorkspace } from "@/components/billing/PricingWorkspace";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase";

export default function PricingPage() {
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    void createBrowserSupabase()
      .auth.getUser()
      .then(({ data }) => setAuthed(Boolean(data.user)));
  }, []);

  return (
    <div className="min-h-full bg-[#f4f8fc]">
      <header className="border-b border-sky-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#123056] text-sm font-semibold text-white">
              N
            </span>
            <span className="text-sm font-semibold tracking-tight text-[#0b1f3a]">Nexus HR</span>
          </Link>
          <nav className="flex items-center gap-2 text-sm">
            {authed ? (
              <Link
                href="/dashboard"
                className="rounded-xl bg-[#123056] px-3.5 py-2 font-medium text-white hover:bg-[#0f2744]"
              >
                Panele dön
              </Link>
            ) : (
              <>
                <Link href="/login" className="rounded-lg px-3 py-2 text-slate-600 hover:bg-sky-50">
                  Giriş
                </Link>
                <Link
                  href="/login"
                  className="rounded-xl bg-[#123056] px-3.5 py-2 font-medium text-white hover:bg-[#0f2744]"
                >
                  14 gün ücretsiz
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <PricingWorkspace />
      </div>
    </div>
  );
}
