"use client";

import Link from "next/link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { LegalArticle } from "@/components/legal/LegalArticle";
import { SiteFooter } from "@/components/footer";
import type { LegalDocId } from "@/lib/legal-docs";

export function LegalDocument({ docId }: { docId: LegalDocId }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="h-16 shrink-0 border-b border-slate-200/80 bg-white/90">
        <div className="mx-auto flex h-full max-w-3xl items-center justify-between px-4">
          <Link href="/" className="text-sm font-semibold text-[#0b1f3a]">
            Nexus HR
          </Link>
          <LanguageSwitcher />
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <LegalArticle docId={docId} />
      </main>
      <SiteFooter />
    </div>
  );
}
