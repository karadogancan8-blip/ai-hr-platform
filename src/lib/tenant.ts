import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "./database.types";

export type AppSupabase = SupabaseClient<Database>;

export function companyIdFromUser(user: User | null | undefined) {
  const meta = user?.user_metadata as { company_id?: string } | undefined;
  return typeof meta?.company_id === "string" && meta.company_id ? meta.company_id : "";
}

export async function ensureCompanyForUser(
  supabase: AppSupabase,
  user: User,
  companyName?: string,
) {
  const existingMeta = companyIdFromUser(user);
  if (existingMeta) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", user.id)
      .maybeSingle();
    if (profile?.company_id) return profile.company_id;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.company_id) {
    await supabase.auth.updateUser({ data: { company_id: profile.company_id } });
    return profile.company_id;
  }

  const name =
    companyName?.trim() ||
    String((user.user_metadata as { company_name?: string } | undefined)?.company_name || "").trim() ||
    "Yeni Şirket";

  const { data: company, error: companyError } = await supabase
    .from("companies")
    .insert({ name })
    .select("id")
    .single();

  if (companyError) throw new Error(companyError.message);

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: user.id,
    company_id: company.id,
    email: user.email ?? null,
  });

  if (profileError) throw new Error(profileError.message);

  await supabase.auth.updateUser({
    data: {
      company_id: company.id,
      company_name: name,
    },
  });

  return company.id;
}

export async function getCompanyId(supabase: AppSupabase) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) throw new Error(error.message);
  if (!user) throw new Error("Oturum bulunamadı. Lütfen giriş yapın.");
  return ensureCompanyForUser(supabase, user);
}
