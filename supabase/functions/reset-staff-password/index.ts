// @ts-nocheck -- Deno Edge Function (URL imports + Deno globals); your editor's
// Node/TypeScript checker flags these, but they are valid on Supabase's Deno runtime.
// Supabase Edge Function: reset-staff-password
// An admin sets a new password for a staff member's login, and flags the
// account so the user must set their own password on next sign-in.
//
// Deploy: supabase functions deploy reset-staff-password

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const url = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // Require a signed-in caller.
  const caller = createClient(url, anonKey, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
  });
  const {
    data: { user },
    error: authErr,
  } = await caller.auth.getUser();
  if (authErr || !user) return json({ error: "Unauthorized" }, 401);

  const admin = createClient(url, serviceKey);

  // Only admins may reset passwords.
  const { data: callerProfile } = await admin
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  if (!callerProfile?.is_admin) return json({ error: "Admins only." }, 403);

  let payload: { userId?: string; password?: string };
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }
  const { userId, password } = payload;
  if (!userId || !password) return json({ error: "Missing user or password." }, 400);
  if (password.length < 6) return json({ error: "Password must be at least 6 characters." }, 400);

  const { error: updateErr } = await admin.auth.admin.updateUserById(userId, { password });
  if (updateErr) return json({ error: updateErr.message }, 400);

  // Force the user to change it on next sign-in.
  await admin.from("profiles").update({ must_change_password: true }).eq("id", userId);

  return json({ ok: true });
});
