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

/** Build sırasında env yoksa çökme; gerçek istekler isSupabaseConfigured ile korunur. */
export function supabaseEnvOrPlaceholder() {
  return {
    url: supabaseUrl() || "https://placeholder.supabase.co",
    key: supabaseAnonKey() || "public-anon-placeholder",
  };
}

export function requireSupabaseEnv() {
  return supabaseEnvOrPlaceholder();
}
