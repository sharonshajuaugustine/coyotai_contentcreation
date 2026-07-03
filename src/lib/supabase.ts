import { createClient } from "@supabase/supabase-js";

// Server-side client using the service role key — only ever imported
// from API routes / server components, never sent to the browser.
export function supabaseServer() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
