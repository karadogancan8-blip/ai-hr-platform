import { createBrowserSupabase } from "./supabase/client";
import { isSupabaseConfigured } from "./supabase/config";
import type { Database } from "./database.types";
import type { SupabaseClient } from "@supabase/supabase-js";

export { isSupabaseConfigured } from "./supabase/config";
export { createBrowserSupabase } from "./supabase/client";

let client: SupabaseClient<Database> | undefined;

export function getSupabase() {
  client ??= createBrowserSupabase();
  return client;
}

export const supabase: SupabaseClient<Database> = new Proxy({} as SupabaseClient<Database>, {
  get(_target, property, receiver) {
    const instance = getSupabase();
    const value = Reflect.get(instance, property, receiver);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});
