import { createClient } from "@supabase/supabase-js";

// Uses the service role key — bypasses RLS. Only call from server-side code.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
