import type { LeaveRequest, LeaveStatus, LeaveType } from "./types";
import { getSupabase } from "./supabase";
import { getCompanyId, type AppSupabase } from "./tenant";
import type { LeaveRequestRow } from "./database.types";

const leaveTypes: LeaveType[] = ["yillik", "mazeret", "hastalik", "ucretsiz"];
const leaveStatuses: LeaveStatus[] = ["beklemede", "onaylandi", "reddedildi"];

function asLeaveType(value?: string | null): LeaveType {
  return leaveTypes.includes(value as LeaveType) ? (value as LeaveType) : "yillik";
}

function asLeaveStatus(value?: string | null): LeaveStatus {
  return leaveStatuses.includes(value as LeaveStatus) ? (value as LeaveStatus) : "beklemede";
}

function computeDays(start?: string | null, end?: string | null, stored?: number | null) {
  if (typeof stored === "number" && stored > 0) return stored;
  if (!start || !end) return 1;
  const a = new Date(start);
  const b = new Date(end);
  const diff = Math.round((b.getTime() - a.getTime()) / 86400000) + 1;
  return Number.isFinite(diff) && diff > 0 ? diff : 1;
}

function missingColumn(message: string) {
  return message.match(/Could not find the '([^']+)' column/i)?.[1] ?? null;
}

export function mapLeaveRow(row: LeaveRequestRow): LeaveRequest {
  return {
    id: String(row.id),
    employee: row.employee ?? row.employee_name ?? "",
    department: row.department ?? "—",
    type: asLeaveType(row.type ?? row.leave_type),
    startDate: row.start_date ?? "",
    endDate: row.end_date ?? "",
    days: computeDays(row.start_date, row.end_date, row.days),
    reason: row.reason ?? "",
    status: asLeaveStatus(row.status),
  };
}

export async function fetchLeaveRequests(client?: AppSupabase) {
  const supabase = client ?? getSupabase();
  const companyId = await getCompanyId(supabase);
  let query = supabase.from("leave_requests").select("*").order("created_at", { ascending: false });
  query = query.eq("company_id", companyId);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapLeaveRow);
}

export async function insertLeaveRequest(input: Omit<LeaveRequest, "id">, client?: AppSupabase) {
  const supabase = client ?? getSupabase();
  const companyId = await getCompanyId(supabase);
  const payload: Record<string, string | number> = {
    company_id: companyId,
    employee: input.employee,
    employee_name: input.employee,
    department: input.department,
    type: input.type,
    leave_type: input.type,
    start_date: input.startDate,
    end_date: input.endDate,
    reason: input.reason,
    status: input.status,
  };

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const { data, error } = await supabase.from("leave_requests").insert(payload).select().single();

    if (!error) return mapLeaveRow(data);

    const column = missingColumn(error.message);
    if (!column || column === "company_id" || !(column in payload)) throw new Error(error.message);
    delete payload[column];
  }

  throw new Error("İzin talebi kaydedilemedi.");
}

export async function updateLeaveStatus(id: string, status: LeaveStatus, client?: AppSupabase) {
  const supabase = client ?? getSupabase();
  const companyId = await getCompanyId(supabase);
  const { data, error } = await supabase
    .from("leave_requests")
    .update({ status })
    .eq("id", id)
    .eq("company_id", companyId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapLeaveRow(data);
}

export async function deleteLeaveRequest(id: string, client?: AppSupabase) {
  const supabase = client ?? getSupabase();
  const companyId = await getCompanyId(supabase);
  const { error } = await supabase.from("leave_requests").delete().eq("id", id).eq("company_id", companyId);
  if (error) throw new Error(error.message);
}
