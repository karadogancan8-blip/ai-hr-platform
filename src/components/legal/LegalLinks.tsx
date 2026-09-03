"use client";

import Link from "next/link";
import { useI18n } from "@/components/i18n/LocaleProvider";

const LINKS = [
  { href: "/gizlilik", key: "legal.privacy" as const },
  { href: "/kvkk", key: "legal.kvkk" as const },
  { href: "/kullanim-sartlari", key: "legal.terms" as const },
];

export function LegalLinks({ className = "" }: { className?: string }) {
  const { t } = useI18n();
  return (
    <nav className={`flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 ${className}`}>
      {LINKS.map((item) => (
        <Link key={item.href} href={item.href} className="hover:text-sky-800 hover:underline">
          {t(item.key)}
        </Link>
      ))}
    </nav>
  );
}
