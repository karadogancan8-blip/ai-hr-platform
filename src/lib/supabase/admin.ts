import { createClient } from "@supabase/supabase-js";
import type { Database } from "../database.types";
import { supabaseUrl } from "./config";

export function createServiceSupabase() {
  const url = supabaseUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || "";
  if (!url || !key) return null;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
