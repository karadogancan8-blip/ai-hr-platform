import { getSupabase } from "./supabase";
import { resolveOptionalCompanyId, type AppSupabase } from "./tenant";
import type { OnboardingPlanRow } from "./database.types";

export type OnboardingTask = {
  id: string;
  week: number;
  day: number;
  title: string;
  done: boolean;
};

export type OnboardingWeek = {
  week: number;
  title: string;
  focus: string;
};

export type StoredOnboardingPlan = {
  id: string;
  employeeName: string;
  role: string;
  department: string;
  status: string;
  summary: string;
  weeks: OnboardingWeek[];
  tasks: OnboardingTask[];
  createdAt: string;
  persisted?: boolean;
};

export type OnboardingPlanPayload = {
  summary: string;
  weeks: OnboardingWeek[];
  tasks: OnboardingTask[];
};

function missingColumn(message: string) {
  return message.match(/Could not find the '([^']+)' column/i)?.[1] ?? null;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

export function fallbackOnboardingPlan(input: {
  employeeName: string;
  role: string;
  department: string;
}): OnboardingPlanPayload {
  const name = input.employeeName || "Yeni çalışan";
  const role = input.role || "pozisyon";
  const dept = input.department || "departman";

  const weeks: OnboardingWeek[] = [
    { week: 1, title: "Hafta 1 · Kurumsal uyum", focus: "Kültür, araçlar ve ekip tanışması" },
    { week: 2, title: "Hafta 2 · Gölge çalışma", focus: `${role} süreçlerini izleme ve küçük teslimat` },
    { week: 3, title: "Hafta 3 · Sahiplik", focus: "İlk bağımsız görev ve geri bildirim" },
    { week: 4, title: "Hafta 4 · Katkı", focus: "30. gün değerlendirme ve çeyrek hedefleri" },
  ];

  const tasks: OnboardingTask[] = [
    { id: "t1", week: 1, day: 1, title: `${name}: İK evrak, hesap ve güvenlik eğitimini tamamla`, done: false },
    { id: "t2", week: 1, day: 2, title: `${dept} ekibi ve paydaşlarla tanışma turu`, done: false },
    { id: "t3", week: 1, day: 3, title: "Şirket ürünü / müşteri yolculuğunu mentor ile incele", done: false },
    { id: "t4", week: 1, day: 5, title: "Kullanılan araçlara (iletişim, görev, dosya) erişim doğrula", done: false },
    { id: "t5", week: 2, day: 8, title: `${role} günlük iş akışını gölge olarak izle`, done: false },
    { id: "t6", week: 2, day: 10, title: "Küçük, gözetimli bir görev teslim et", done: false },
    { id: "t7", week: 2, day: 12, title: "Süreç dokümanındaki 3 belirsiz noktayı not al ve sor", done: false },
    { id: "t8", week: 3, day: 15, title: "Bağımsız bir iş paketi sahiplen ve planını yöneticinle paylaş", done: false },
    { id: "t9", week: 3, day: 18, title: "İlk geri bildirim görüşmesi (neler iyi / neler zor)", done: false },
    { id: "t10", week: 3, day: 21, title: `${dept} stand-up veya sprint ritmine aktif katıl`, done: false },
    { id: "t11", week: 4, day: 24, title: "30 günlük öğrenimleri tek sayfalık özetle", done: false },
    { id: "t12", week: 4, day: 28, title: "Gelecek çeyrek için 3 hedef öner ve yönetici onayı al", done: false },
    { id: "t13", week: 4, day: 30, title: "30. gün uyum değerlendirmesi ve mentor kapanış toplantısı", done: false },
  ];

  return {
    summary: `${name} için ${dept} / ${role} odaklı 30 günlük uyum planı. İlk hafta kültür, ikinci hafta gölge çalışma, üçüncü hafta sahiplik, dördüncü hafta katkı ve hedef netleştirme.`,
    weeks,
    tasks,
  };
}

export function mapOnboardingRow(row: OnboardingPlanRow): StoredOnboardingPlan {
  const plan = asRecord(row.plan);
  const fallback = fallbackOnboardingPlan({
    employeeName: row.employee_name ?? "Çalışan",
    role: row.role ?? "Pozisyon",
    department: row.department ?? "Departman",
  });
  const weeks = Array.isArray(plan.weeks) ? (plan.weeks as OnboardingWeek[]) : fallback.weeks;
  const tasks = Array.isArray(plan.tasks) ? (plan.tasks as OnboardingTask[]) : fallback.tasks;
  return {
    id: String(row.id),
    employeeName: row.employee_name ?? "Çalışan",
    role: row.role ?? "Pozisyon",
    department: row.department ?? "Departman",
    status: row.status ?? "aktif",
    summary: typeof plan.summary === "string" ? plan.summary : fallback.summary,
    weeks,
    tasks,
    createdAt: row.created_at ?? new Date().toISOString(),
    persisted: true,
  };
}

export function toLocalOnboardingPlan(input: {
  employeeName: string;
  role: string;
  department: string;
  payload: OnboardingPlanPayload;
}): StoredOnboardingPlan {
  return {
    id: crypto.randomUUID(),
    employeeName: input.employeeName,
    role: input.role,
    department: input.department,
    status: "aktif",
    summary: input.payload.summary,
    weeks: input.payload.weeks,
    tasks: input.payload.tasks,
    createdAt: new Date().toISOString(),
    persisted: false,
  };
}

export async function fetchOnboardingPlans(client?: AppSupabase) {
  const supabase = client ?? getSupabase();
  const companyId = await resolveOptionalCompanyId(supabase);
  let query = supabase.from("onboarding_plans").select("*").order("created_at", { ascending: false });
  if (companyId) query = query.eq("company_id", companyId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapOnboardingRow);
}

function shouldDropCompanyId(message: string) {
  return /company_id|null value in column|invalid input syntax for type uuid|foreign key/i.test(message);
}

export async function insertOnboardingPlan(
  input: {
    employeeName: string;
    role: string;
    department: string;
    payload: OnboardingPlanPayload;
  },
  client?: AppSupabase,
) {
  const supabase = client ?? getSupabase();
  const companyId = await resolveOptionalCompanyId(supabase);
  const record: Record<string, unknown> = {
    company_id: companyId,
    employee_name: input.employeeName,
    role: input.role,
    department: input.department,
    plan: input.payload,
    status: "aktif",
  };

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const { data, error } = await supabase.from("onboarding_plans").insert(record).select().single();
    if (!error) return mapOnboardingRow(data);

    const column = missingColumn(error.message);
    if (column && column in record && column !== "company_id") {
      delete record[column];
      continue;
    }
    if (shouldDropCompanyId(error.message) && "company_id" in record) {
      delete record.company_id;
      continue;
    }
    throw new Error(error.message);
  }
  throw new Error("Onboarding planı kaydedilemedi.");
}

export async function updateOnboardingTasks(id: string, tasks: OnboardingTask[], client?: AppSupabase) {
  const supabase = client ?? getSupabase();
  const companyId = await resolveOptionalCompanyId(supabase);
  let read = supabase.from("onboarding_plans").select("*").eq("id", id);
  if (companyId) read = read.eq("company_id", companyId);
  const { data: existing, error: readError } = await read.maybeSingle();
  if (readError) throw new Error(readError.message);
  if (!existing) throw new Error("Plan bulunamadı.");
  const mapped = mapOnboardingRow(existing);
  const plan = { summary: mapped.summary, weeks: mapped.weeks, tasks };
  let write = supabase.from("onboarding_plans").update({ plan }).eq("id", id);
  if (companyId) write = write.eq("company_id", companyId);
  const { data, error } = await write.select().single();
  if (error) throw new Error(error.message);
  return mapOnboardingRow(data);
}
