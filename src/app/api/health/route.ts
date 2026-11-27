import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { supabaseEnv } from "@/lib/supabase/env";

// For the release workflow's check after each deploy, and for an uptime monitor:
// the Worker answers, and it can reach the database. It reveals no data.
export async function GET() {
  const env = supabaseEnv();
  const headers = { "Cache-Control": "no-store" };
  if (!env) return NextResponse.json({ ok: true, database: "not configured" }, { headers });

  const supabase = createClient(env.url, env.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const { data, error } = await supabase.rpc("app_health");
  const ok = !error && data === true;
  return NextResponse.json({ ok, database: ok ? "ok" : "unreachable" }, { status: ok ? 200 : 503, headers });
}
