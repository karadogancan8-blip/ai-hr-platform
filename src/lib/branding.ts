import { getSupabase } from "./supabase";
import { getCompanyId, type AppSupabase } from "./tenant";

export const DEFAULT_PRIMARY_COLOR = "#123056";
export const BRANDING_UPDATED_EVENT = "nexus-branding-updated";

export type CompanyBranding = {
  companyId: string;
  companyName: string;
  logoUrl: string;
  primaryColor: string;
};

function missingColumn(message: string) {
  return message.match(/Could not find the '([^']+)' column/i)?.[1] ?? null;
}

export function normalizeHexColor(value: string, fallback = DEFAULT_PRIMARY_COLOR) {
  const trimmed = value.trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(trimmed)) return trimmed.toLowerCase();
  if (/^#[0-9A-Fa-f]{3}$/.test(trimmed)) {
    const r = trimmed[1];
    const g = trimmed[2];
    const b = trimmed[3];
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return fallback;
}

function mapRow(
  companyId: string,
  row: { name?: string | null; logo_url?: string | null; primary_color?: string | null } | null,
): CompanyBranding {
  return {
    companyId,
    companyName: row?.name?.trim() || "Şirket",
    logoUrl: row?.logo_url?.trim() || "",
    primaryColor: normalizeHexColor(row?.primary_color || DEFAULT_PRIMARY_COLOR),
  };
}

export async function fetchCompanyBranding(client?: AppSupabase): Promise<CompanyBranding> {
  const supabase = client ?? getSupabase();
  const companyId = await getCompanyId(supabase);
  const { data, error } = await supabase.from("companies").select("*").eq("id", companyId).maybeSingle();
  if (error) throw new Error(error.message);
  return mapRow(companyId, data as { name?: string | null; logo_url?: string | null; primary_color?: string | null } | null);
}

export async function updateCompanyBranding(
  input: { companyName?: string; logoUrl: string; primaryColor: string },
  client?: AppSupabase,
) {
  const supabase = client ?? getSupabase();
  const companyId = await getCompanyId(supabase);
  const payload: Record<string, string> = {
    logo_url: input.logoUrl.trim(),
    primary_color: normalizeHexColor(input.primaryColor),
  };
  const name = input.companyName?.trim();
  if (name) payload.name = name;

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const { data, error } = await supabase
      .from("companies")
      .update(payload)
      .eq("id", companyId)
      .select("*")
      .maybeSingle();

    if (!error) {
      const branding = mapRow(
        companyId,
        data as { name?: string | null; logo_url?: string | null; primary_color?: string | null } | null,
      );
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent(BRANDING_UPDATED_EVENT, { detail: branding }));
      }
      return branding;
    }

    const column = missingColumn(error.message);
    if (column === "logo_url" || column === "primary_color") {
      throw new Error(
        "companies tablosunda logo_url / primary_color kolonları yok. supabase/schema.sql içindeki ALTER TABLE komutlarını çalıştırın.",
      );
    }
    if (!column || !(column in payload)) throw new Error(error.message);
    delete payload[column];
  }

  throw new Error("Şirket markası kaydedilemedi.");
}
