import { getSupabase } from "./supabase";
import { resolveOptionalCompanyId, type AppSupabase } from "./tenant";
import type { PerformanceReviewRow } from "./database.types";

export type StoredPerformanceReview = {
  id: string;
  employeeName: string;
  period: string;
  notes: string;
  summary: string;
  strengths: string[];
  improvements: string[];
  goals: string[];
  score: number;
  createdAt: string;
  persisted?: boolean;
};

function missingColumn(message: string) {
  return message.match(/Could not find the '([^']+)' column/i)?.[1] ?? null;
}

export function fallbackPerformanceReview(input: {
  employeeName: string;
  period: string;
  notes: string;
}): Omit<StoredPerformanceReview, "id" | "createdAt"> {
  const name = input.employeeName || "Çalışan";
  const period = input.period || "Bu çeyrek";
  return {
    employeeName: name,
    period,
    notes: input.notes,
    summary: `${name} için ${period} dönemi değerlendirmesi. Notlara göre teslimat disiplini ve iş birliği öne çıkıyor; ölçülebilir hedef netliği geliştirilmeli.`,
    strengths: [
      "Sorumluluk aldığı işleri sonuca bağlama",
      "Ekip içi iletişim ve şeffaflık",
      "Öğrenme hızı ve geri bildirime açıklık",
    ],
    improvements: [
      "Önceliklendirme ve kapsamı erken daraltma",
      "Metriklerle ilerleme raporu",
      "Belirsizlikte proaktif paydaş bilgilendirme",
    ],
    goals: [
      "Gelecek çeyrekte 2 ölçülebilir teslimat hedefi yazılsın",
      "Aylık 1 geri bildirim görüşmesi takvime alınsın",
      "Bir süreç iyileştirme önerisi hayata geçirilsin",
    ],
    score: 3,
  };
}

export function mapPerformanceRow(row: PerformanceReviewRow): StoredPerformanceReview {
  return {
    id: String(row.id),
    employeeName: row.employee_name ?? "Çalışan",
    period: row.period ?? "Dönem",
    notes: row.notes ?? "",
    summary: row.summary ?? "",
    strengths: row.strengths ?? [],
    improvements: row.improvements ?? [],
    goals: row.goals ?? [],
    score: Math.min(5, Math.max(1, Math.round(Number(row.score) || 3))),
    createdAt: row.created_at ?? new Date().toISOString(),
    persisted: true,
  };
}

export function toLocalPerformanceReview(
  input: Omit<StoredPerformanceReview, "id" | "createdAt" | "persisted">,
): StoredPerformanceReview {
  return {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    persisted: false,
  };
}

export async function fetchPerformanceReviews(client?: AppSupabase) {
  const supabase = client ?? getSupabase();
  const companyId = await resolveOptionalCompanyId(supabase);
  let query = supabase.from("performance_reviews").select("*").order("created_at", { ascending: false });
  if (companyId) query = query.eq("company_id", companyId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapPerformanceRow);
}

function shouldDropCompanyId(message: string) {
  return /company_id|null value in column|invalid input syntax for type uuid|foreign key/i.test(message);
}

export async function insertPerformanceReview(
  input: Omit<StoredPerformanceReview, "id" | "createdAt" | "persisted">,
  client?: AppSupabase,
) {
  const supabase = client ?? getSupabase();
  const companyId = await resolveOptionalCompanyId(supabase);
  const payload: Record<string, unknown> = {
    company_id: companyId,
    employee_name: input.employeeName,
    period: input.period,
    notes: input.notes,
    summary: input.summary,
    strengths: input.strengths,
    improvements: input.improvements,
    goals: input.goals,
    score: input.score,
  };

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const { data, error } = await supabase.from("performance_reviews").insert(payload).select().single();
    if (!error) return mapPerformanceRow(data);
    const column = missingColumn(error.message);
    if (column && column in payload && column !== "company_id") {
      delete payload[column];
      continue;
    }
    if (shouldDropCompanyId(error.message) && "company_id" in payload) {
      delete payload.company_id;
      continue;
    }
    throw new Error(error.message);
  }
  throw new Error("Performans incelemesi kaydedilemedi.");
}
