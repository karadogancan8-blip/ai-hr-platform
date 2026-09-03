export function supabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
}

export function supabaseAnonKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    ""
  );
}

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl() && supabaseAnonKey());
}

export function requireSupabaseEnv() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase yapılandırılmamış. NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY değerlerini .env.local dosyasına ekleyin.",
    );
  }
  return { url: supabaseUrl(), key: supabaseAnonKey() };
}
