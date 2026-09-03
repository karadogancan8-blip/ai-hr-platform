import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "../database.types";
import { requireSupabaseEnv } from "./config";

export async function createServerSupabase() {
  const { url, key } = requireSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot always set cookies; proxy handles refresh.
        }
      },
    },
  });
}
