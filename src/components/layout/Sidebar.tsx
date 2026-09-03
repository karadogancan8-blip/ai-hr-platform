"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ComponentType } from "react";
import { LogOut } from "lucide-react";
import { Brain, BookOpen, GraduationCap, LineChart, ShieldAlert, Video, Wallet } from "lucide-react";
import {
  IconClose,
  IconCreditCard,
  IconDashboard,
  IconLeave,
  IconOnboarding,
  IconPerformance,
  IconPolicy,
  IconRecruit,
  IconSettings,
} from "../icons";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { planBadgeLabel, type PlanId } from "@/lib/plans";
import { fetchCompanySubscription } from "@/lib/subscription";
import { useCompanyBranding } from "@/components/branding/BrandingProvider";
import { useAccessControl } from "@/components/access/AccessControlProvider";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { APP_ROLES, type EnterpriseModuleId } from "@/lib/access-control";
import type { MessageKey } from "@/lib/i18n";

const navItems: {
  href: string;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  moduleId?: EnterpriseModuleId;
  labelKey?: MessageKey;
  descKey?: MessageKey;
}[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    description: "Genel Özet",
    icon: IconDashboard,
    labelKey: "nav.dashboard",
    descKey: "nav.dashboardDesc",
  },
  {
    href: "/ise-alim",
    label: "İşe Alım & CV Analizi",
    description: "RecruiterAgent",
    icon: IconRecruit,
    labelKey: "nav.recruit",
  },
  {
    href: "/mevzuat",
    label: "Şirket İçi Mevzuat",
    description: "PolicyAgent",
    icon: IconPolicy,
    labelKey: "nav.policy",
  },
  {
    href: "/izin",
    label: "İzin & Özlük Yönetimi",
    description: "HRAdminAgent",
    icon: IconLeave,
    labelKey: "nav.leave",
  },
  {
    href: "/onboarding",
    label: "Onboarding",
    description: "Uyum Companion",
    icon: IconOnboarding,
    labelKey: "nav.onboarding",
  },
  {
    href: "/performans",
    label: "Performans",
    description: "Değerlendirme",
    icon: IconPerformance,
    labelKey: "nav.performance",
  },
  {
    href: "/dokumanlar",
    label: "📚 Bilgi Üssü & Dökümanlar",
    description: "Knowledge Base",
    icon: BookOpen,
    labelKey: "nav.knowledge",
  },
  {
    href: "/kultur-profili",
    label: "Kültür & Profil",
    description: "Culture Fit",
    icon: Brain,
    moduleId: "culture_fit",
  },
  {
    href: "/ayrilma-riski",
    label: "Ayrılma Riski",
    description: "Flight Risk",
    icon: LineChart,
    moduleId: "flight_risk",
  },
  {
    href: "/ucret-karsilastirma",
    label: "Ücret Kıyaslama",
    description: "Salary Benchmark",
    icon: Wallet,
    moduleId: "salary_benchmark",
  },
  {
    href: "/video-mulakat",
    label: "Video Duygu Analizi",
    description: "Interview Sentiment",
    icon: Video,
    moduleId: "video_sentiment",
  },
  {
    href: "/uyum-kalkani",
    label: "Uyum Kalkanı",
    description: "Compliance Shield",
    icon: ShieldAlert,
    moduleId: "compliance_shield",
  },
  {
    href: "/beceri-acigi",
    label: "Beceri & Öğrenme",
    description: "Skill Gap",
    icon: GraduationCap,
    moduleId: "skill_gap",
  },
  {
    href: "/fiyatlandirma",
    label: "Fiyatlandırma & Üyelik",
    description: "Paketler",
    icon: IconCreditCard,
    labelKey: "nav.pricing",
  },
  {
    href: "/ayarlar",
    label: "Ayarlar",
    description: "White-Label & Yetki",
    icon: IconSettings,
    labelKey: "nav.settings",
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
  const branding = useCompanyBranding();
  const { canView, role, loading: accessLoading } = useAccessControl();
  const { t } = useI18n();
  const roleLabel = APP_ROLES.find((item) => item.id === role)?.label ?? "Şirket Admini";

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
        className={`fixed start-0 top-0 z-40 flex h-screen w-[272px] flex-col overflow-y-auto border-e border-white/10 bg-[linear-gradient(180deg,#0b1f3a_0%,#123056_55%,#0e2744_100%)] text-slate-100 shadow-xl transition-transform duration-200 overscroll-contain lg:!translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-3 px-5 py-6">
          <Link href="/dashboard" className="flex items-center gap-3" onClick={onClose}>
            {branding.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={branding.logoUrl}
                alt={branding.companyName}
                className="h-10 w-10 rounded-xl bg-white object-contain p-0.5 ring-1 ring-white/20"
              />
            ) : (
              <span
                className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold tracking-tight text-white ring-1 ring-white/20"
                style={{ backgroundColor: branding.primaryColor }}
              >
                {branding.companyName.slice(0, 2).toUpperCase() || "AI"}
              </span>
            )}
            <span>
              <span className="block text-sm font-semibold tracking-wide">{branding.companyName}</span>
              <span className="block text-xs text-sky-200/70">{t("nav.platform")}</span>
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

        <nav className="space-y-1 px-3 pb-2">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-200/50">
            {t("nav.modules")}
          </p>
          {navItems
            .filter((item) => {
              if (item.moduleId) return !accessLoading && canView(item.moduleId);
              return true;
            })
            .map((item) => {
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
                  <span className="block text-sm font-medium leading-5">
                    {item.labelKey ? t(item.labelKey) : item.label}
                  </span>
                  <span className={`mt-0.5 block text-xs ${active ? "text-sky-200" : "text-slate-400"}`}>
                    {item.descKey ? t(item.descKey) : item.description}
                  </span>
                  {item.href === "/fiyatlandirma" ? (
                    <span className="mt-1.5 inline-flex max-w-full rounded-full bg-sky-400/20 px-2 py-0.5 text-[10px] font-semibold leading-4 text-sky-100">
                      {planBadgeLabel[plan]}
                    </span>
                  ) : null}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="m-4 space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-200/70">{t("nav.account")}</p>
          <p className="truncate text-sm text-sky-50" title={email || t("nav.noSession")}>
            {email || t("nav.noSession")}
          </p>
          <span className="inline-flex rounded-full bg-sky-400/20 px-2.5 py-1 text-[11px] font-semibold text-sky-100">
            {planBadgeLabel[plan]}
          </span>
          <span className="inline-flex rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-sky-100">
            {roleLabel}
          </span>
          <button
            type="button"
            onClick={() => void logout()}
            disabled={signingOut}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/20 disabled:opacity-50"
          >
            <LogOut className="h-4 w-4" />
            {signingOut ? t("nav.signingOut") : t("nav.signOut")}
          </button>
        </div>
      </aside>
    </>
  );
}
