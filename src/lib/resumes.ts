import { getSupabase } from "./supabase";
import { getCompanyId, type AppSupabase } from "./tenant";
import type { ResumeRow } from "./database.types";

export type StoredResume = {
  id: string;
  name: string;
  role: string;
  matchScore: number;
  summary: string;
  skills: string[];
  strengths: string[];
  weaknesses: string[];
  createdAt: string;
};

export type ResumeInsert = {
  name: string;
  role?: string;
  matchScore: number;
  summary: string;
  skills?: string[];
  strengths?: string[];
  weaknesses?: string[];
};

function missingColumn(message: string) {
  return message.match(/Could not find the '([^']+)' column/i)?.[1] ?? null;
}

export function mapResumeRow(row: ResumeRow): StoredResume {
  const name = row.candidate_name ?? row.name ?? "Aday";
  const score = row.match_score ?? row.score ?? 0;
  return {
    id: String(row.id),
    name,
    role: row.role ?? "Aday",
    matchScore: Math.round(Number(score) || 0),
    summary: row.summary ?? row.analysis_summary ?? "",
    skills: row.skills ?? [],
    strengths: row.strengths ?? [],
    weaknesses: row.weaknesses ?? [],
    createdAt: row.created_at ?? new Date().toISOString(),
  };
}

export async function fetchResumes(client?: AppSupabase) {
  const supabase = client ?? getSupabase();
  const companyId = await getCompanyId(supabase);
  const { data, error } = await supabase
    .from("resumes")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapResumeRow);
}

export async function insertResume(input: ResumeInsert, client?: AppSupabase) {
  const supabase = client ?? getSupabase();
  const companyId = await getCompanyId(supabase);
  const payload: Record<string, string | number | string[] | null> = {
    company_id: companyId,
    candidate_name: input.name,
    name: input.name,
    match_score: input.matchScore,
    score: input.matchScore,
    summary: input.summary,
    analysis_summary: input.summary,
    role: input.role ?? null,
    skills: input.skills ?? [],
    strengths: input.strengths ?? [],
    weaknesses: input.weaknesses ?? [],
  };

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const { data, error } = await supabase.from("resumes").insert(payload).select().single();
    if (!error) {
      const mapped = mapResumeRow(data);
      return {
        ...mapped,
        name: input.name || mapped.name,
        role: input.role || mapped.role,
        matchScore: input.matchScore,
        summary: input.summary || mapped.summary,
        skills: mapped.skills.length ? mapped.skills : (input.skills ?? []),
        strengths: mapped.strengths.length ? mapped.strengths : (input.strengths ?? []),
        weaknesses: mapped.weaknesses.length ? mapped.weaknesses : (input.weaknesses ?? []),
      };
    }

    const column = missingColumn(error.message);
    if (!column || column === "company_id" || !(column in payload)) throw new Error(error.message);
    delete payload[column];
  }

  throw new Error("CV analizi resumes tablosuna kaydedilemedi.");
}
