import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "../database.types";
import { supabaseEnvOrPlaceholder } from "./config";

export function createBrowserSupabase() {
  const { url, key } = supabaseEnvOrPlaceholder();
  return createBrowserClient<Database>(url, key);
}
