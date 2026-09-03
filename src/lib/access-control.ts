import { getSupabase } from "./supabase";
import { getCompanyId, type AppSupabase } from "./tenant";
import type { Json } from "./database.types";

export type AppRole = "company_admin" | "hr_manager" | "hr_specialist" | "employee";
export type ModuleVisibility = "admin_only" | "hr_managers" | "all_employees";
export type EnterpriseModuleId =
  | "culture_fit"
  | "flight_risk"
  | "salary_benchmark"
  | "video_sentiment"
  | "compliance_shield"
  | "skill_gap";

export type ModuleAccess = {
  enabled: boolean;
  visibility: ModuleVisibility;
};

export type AccessControlMap = Record<EnterpriseModuleId, ModuleAccess>;

export const ACCESS_UPDATED_EVENT = "nexus-access-updated";
export const ROLE_UPDATED_EVENT = "nexus-role-updated";

export const APP_ROLES: { id: AppRole; label: string; hint: string }[] = [
  { id: "company_admin", label: "Şirket Admini", hint: "Tüm aktif modüller ve yetki yönetimi" },
  { id: "hr_manager", label: "İK Yöneticisi", hint: "İK yöneticilerine açılan modüller" },
  { id: "hr_specialist", label: "İK Uzmanı", hint: "Yalnızca tüm çalışanlara açık modüller" },
  { id: "employee", label: "Çalışan", hint: "Yalnızca tüm çalışanlara açık modüller" },
];

export const VISIBILITY_OPTIONS: { id: ModuleVisibility; label: string }[] = [
  { id: "admin_only", label: "Sadece Şirket Admini" },
  { id: "hr_managers", label: "İK Yöneticileri" },
  { id: "all_employees", label: "Tüm Çalışanlar" },
];

export const ENTERPRISE_MODULES: {
  id: EnterpriseModuleId;
  title: string;
  subtitle: string;
  href: string;
  sensitive?: boolean;
}[] = [
  {
    id: "culture_fit",
    title: "Culture Fit & Psychological Profiling",
    subtitle: "Kültür uyumu ve psikolojik profil",
    href: "/kultur-profili",
  },
  {
    id: "flight_risk",
    title: "Predictive Flight Risk & Burnout Analytics",
    subtitle: "Ayrılma riski ve tükenmişlik tahmini",
    href: "/ayrilma-riski",
    sensitive: true,
  },
  {
    id: "salary_benchmark",
    title: "AI Salary Benchmarking & Payroll Advisor",
    subtitle: "Ücret kıyaslama ve bordro danışmanı",
    href: "/ucret-karsilastirma",
    sensitive: true,
  },
  {
    id: "video_sentiment",
    title: "Automated Video Interview Sentiment",
    subtitle: "Video mülakat duygu analizi",
    href: "/video-mulakat",
  },
  {
    id: "compliance_shield",
    title: "Labor Law & Compliance Shield",
    subtitle: "İş hukuku ve uyum kalkanı",
    href: "/uyum-kalkani",
  },
  {
    id: "skill_gap",
    title: "Employee Skill Gap & Learning Path",
    subtitle: "Beceri açığı ve öğrenme yolu",
    href: "/beceri-acigi",
  },
];

export function defaultAccessControl(): AccessControlMap {
  return {
    culture_fit: { enabled: true, visibility: "hr_managers" },
    flight_risk: { enabled: true, visibility: "admin_only" },
    salary_benchmark: { enabled: true, visibility: "admin_only" },
    video_sentiment: { enabled: true, visibility: "hr_managers" },
    compliance_shield: { enabled: true, visibility: "all_employees" },
    skill_gap: { enabled: true, visibility: "hr_managers" },
  };
}

export function asAppRole(value?: string | null): AppRole {
  if (value === "hr_manager" || value === "hr_specialist" || value === "employee" || value === "company_admin") {
    return value;
  }
  return "company_admin";
}

export function asVisibility(value?: string | null): ModuleVisibility {
  if (value === "admin_only" || value === "hr_managers" || value === "all_employees") return value;
  return "hr_managers";
}

export function canManageAccess(role: AppRole) {
  return role === "company_admin";
}

export function canViewModule(role: AppRole, access: ModuleAccess) {
  if (!access.enabled) return false;
  if (access.visibility === "admin_only") return role === "company_admin";
  if (access.visibility === "hr_managers") return role === "company_admin" || role === "hr_manager";
  return true;
}

export function parseAccessControl(raw: unknown): AccessControlMap {
  const next = defaultAccessControl();
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return next;
  const source = raw as Record<string, unknown>;
  for (const module of ENTERPRISE_MODULES) {
    const item = source[module.id];
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const row = item as { enabled?: unknown; visibility?: unknown };
    next[module.id] = {
      enabled: row.enabled !== false,
      visibility: asVisibility(typeof row.visibility === "string" ? row.visibility : null),
    };
  }
  return next;
}

function missingColumn(message: string) {
  return message.match(/Could not find the '([^']+)' column/i)?.[1] ?? null;
}

function accessStorageKey(companyId: string) {
  return `nexus-access-control:${companyId}`;
}

function roleStorageKey(userId: string) {
  return `nexus-user-role:${userId}`;
}

function readLocalAccess(companyId: string): AccessControlMap | null {
  if (typeof window === "undefined" || !companyId) return null;
  try {
    const raw = window.localStorage.getItem(accessStorageKey(companyId));
    return raw ? parseAccessControl(JSON.parse(raw) as unknown) : null;
  } catch {
    return null;
  }
}

function writeLocalAccess(companyId: string, access: AccessControlMap) {
  if (typeof window === "undefined" || !companyId) return;
  window.localStorage.setItem(accessStorageKey(companyId), JSON.stringify(access));
}

function readLocalRole(userId: string): AppRole | null {
  if (typeof window === "undefined" || !userId) return null;
  try {
    return asAppRole(window.localStorage.getItem(roleStorageKey(userId)));
  } catch {
    return null;
  }
}

function writeLocalRole(userId: string, role: AppRole) {
  if (typeof window === "undefined" || !userId) return;
  window.localStorage.setItem(roleStorageKey(userId), role);
}

export async function fetchAccessBundle(client?: AppSupabase) {
  const supabase = client ?? getSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const companyId = await getCompanyId(supabase);
  const localAccess = readLocalAccess(companyId);
  const localRole = user?.id ? readLocalRole(user.id) : null;

  const [{ data: company }, { data: profile }] = await Promise.all([
    supabase.from("companies").select("*").eq("id", companyId).maybeSingle(),
    supabase.from("profiles").select("*").eq("id", user?.id ?? "").maybeSingle(),
  ]);

  const companyRow = company as { access_control?: unknown } | null;
  const profileRow = profile as { role?: string | null } | null;
  const access = parseAccessControl(companyRow?.access_control ?? localAccess ?? defaultAccessControl());

  const role = asAppRole(profileRow?.role || localRole || "company_admin");

  return { companyId, userId: user?.id ?? "", access, role };
}

export async function updateAccessControl(access: AccessControlMap, client?: AppSupabase) {
  const supabase = client ?? getSupabase();
  const companyId = await getCompanyId(supabase);
  writeLocalAccess(companyId, access);

  const { error } = await supabase
    .from("companies")
    .update({ access_control: access as unknown as Json })
    .eq("id", companyId);
  if (error) {
    const column = missingColumn(error.message);
    if (column === "access_control" || /access_control|schema cache|column/i.test(error.message)) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent(ACCESS_UPDATED_EVENT, { detail: access }));
      }
      return { access, persisted: "local" as const };
    }
    throw new Error(error.message);
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(ACCESS_UPDATED_EVENT, { detail: access }));
  }
  return { access, persisted: "remote" as const };
}

export async function updateCurrentRole(role: AppRole, client?: AppSupabase) {
  const supabase = client ?? getSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Oturum bulunamadı.");
  writeLocalRole(user.id, role);

  const { error } = await supabase.from("profiles").update({ role }).eq("id", user.id);
  if (error) {
    const column = missingColumn(error.message);
    if (column === "role" || /role|schema cache|column/i.test(error.message)) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent(ROLE_UPDATED_EVENT, { detail: role }));
      }
      return { role, persisted: "local" as const };
    }
    throw new Error(error.message);
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(ROLE_UPDATED_EVENT, { detail: role }));
  }
  return { role, persisted: "remote" as const };
}
