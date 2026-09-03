"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import {
  IconClose,
  IconCreditCard,
  IconDashboard,
  IconLeave,
  IconPolicy,
  IconRecruit,
} from "../icons";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { planBadgeLabel, type PlanId } from "@/lib/plans";
import { fetchCompanySubscription } from "@/lib/subscription";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    description: "Genel Özet",
    icon: IconDashboard,
  },
  {
    href: "/ise-alim",
    label: "İşe Alım & CV Analizi",
    description: "RecruiterAgent",
    icon: IconRecruit,
  },
  {
    href: "/mevzuat",
    label: "Şirket İçi Mevzuat",
    description: "PolicyAgent",
    icon: IconPolicy,
  },
  {
    href: "/izin",
    label: "İzin & Özlük Yönetimi",
    description: "HRAdminAgent",
    icon: IconLeave,
  },
  {
    href: "/fiyatlandirma",
    label: "Fiyatlandırma & Üyelik",
    description: "Paketler",
    icon: IconCreditCard,
  },
];

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState<PlanId>("free");
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createBrowserSupabase();
    void supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? "");
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? "");
    });
    void fetchCompanySubscription()
      .then((sub) => setPlan(sub.planType))
      .catch(() => setPlan("free"));
    function onPlan(event: Event) {
      const detail = (event as CustomEvent<PlanId>).detail;
      if (detail) setPlan(detail);
    }
    window.addEventListener("nexus-plan-updated", onPlan);
    return () => {
      data.subscription.unsubscribe();
      window.removeEventListener("nexus-plan-updated", onPlan);
    };
  }, []);

  async function logout() {
    if (!isSupabaseConfigured()) return;
    setSigningOut(true);
    try {
      await createBrowserSupabase().auth.signOut();
      router.replace("/login");
      router.refresh();
    } finally {
      setSigningOut(false);
      onClose();
    }
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-[2px] transition-opacity lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[272px] flex-col border-r border-white/10 bg-[linear-gradient(180deg,#0b1f3a_0%,#123056_55%,#0e2744_100%)] text-slate-100 shadow-xl transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-3 px-5 py-6">
          <Link href="/dashboard" className="flex items-center gap-3" onClick={onClose}>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-400/15 text-sm font-bold tracking-tight text-sky-300 ring-1 ring-sky-400/30">
              AI
            </span>
            <span>
              <span className="block text-sm font-semibold tracking-wide">Nexus HR</span>
              <span className="block text-xs text-sky-200/70">Yapay Zeka İK Platformu</span>
            </span>
          </Link>
          <button
            type="button"
            className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 lg:hidden"
            onClick={onClose}
            aria-label="Menüyü kapat"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-200/50">
            Modüller
          </p>
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`group flex items-start gap-3 rounded-xl px-3 py-3 transition ${
                  active
                    ? "bg-sky-400/15 text-white shadow-[inset_0_0_0_1px_rgba(125,211,252,0.28)]"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span
                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    active ? "bg-sky-400 text-[#0b1f3a]" : "bg-white/10 text-sky-200"
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium leading-5">{item.label}</span>
                  <span className={`block text-xs ${active ? "text-sky-200" : "text-slate-400"}`}>
                    {item.description}
                  </span>
                </span>
                {item.href === "/fiyatlandirma" ? (
                  <span className="mt-1 shrink-0 rounded-full bg-sky-400/20 px-2 py-0.5 text-[10px] font-semibold text-sky-100">
                    {planBadgeLabel[plan]}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="m-4 space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-200/70">Hesap</p>
          <p className="truncate text-sm text-sky-50" title={email || "Oturum yok"}>
            {email || "Oturum yok"}
          </p>
          <span className="inline-flex rounded-full bg-sky-400/20 px-2.5 py-1 text-[11px] font-semibold text-sky-100">
            {planBadgeLabel[plan]}
          </span>
          <button
            type="button"
            onClick={() => void logout()}
            disabled={signingOut}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/20 disabled:opacity-50"
          >
            <LogOut className="h-4 w-4" />
            {signingOut ? "Çıkış yapılıyor…" : "Çıkış Yap"}
          </button>
        </div>
      </aside>
    </>
  );
}
