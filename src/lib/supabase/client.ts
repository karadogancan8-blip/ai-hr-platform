import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "../database.types";
import { requireSupabaseEnv } from "./config";

export function createBrowserSupabase() {
  const { url, key } = requireSupabaseEnv();
  return createBrowserClient<Database>(url, key);
}
