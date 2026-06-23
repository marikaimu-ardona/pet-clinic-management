// @ts-nocheck -- Deno Edge Function (URL imports + Deno globals); your editor's
// Node/TypeScript checker flags these, but they are valid on Supabase's Deno runtime.
// Supabase Edge Function: create-staff
// Creates a login (auth user) with an admin-set initial password, plus the
// profile + staff directory rows. The new user must change their password on
// first login (profiles.must_change_password = true).
//
// Deploy: supabase functions deploy create-staff
// (SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY are injected
// automatically by Supabase.)

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
  const authHeader = req.headers.get("Authorization") ?? "";
  const caller = createClient(url, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user },
    error: authErr,
  } = await caller.auth.getUser();
  if (authErr || !user) return json({ error: "Unauthorized" }, 401);

  const admin = createClient(url, serviceKey);

  // Only admins may create staff accounts.
  const { data: callerProfile } = await admin
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  if (!callerProfile?.is_admin) return json({ error: "Admins only." }, 403);

  let payload: { fullName?: string; role?: string; email?: string; password?: string };
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }
  const { fullName, role, email, password } = payload;
  if (!fullName || !email || !password) {
    return json({ error: "Full name, email, and password are required." }, 400);
  }
  if (password.length < 6) {
    return json({ error: "Initial password must be at least 6 characters." }, 400);
  }

  // 1. Create the auth user with the initial password (email pre-confirmed).
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, role },
  });
  if (createErr) return json({ error: createErr.message }, 400);

  const avatar = `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(
    fullName
  )}&backgroundColor=b6e3f4`;
  const userId = created.user.id;

  // 2. Profile row (force a password change on first login).
  const { error: profErr } = await admin.from("profiles").upsert({
    id: userId,
    full_name: fullName,
    role,
    avatar_url: avatar,
    must_change_password: true,
  });
  if (profErr) {
    await admin.auth.admin.deleteUser(userId); // roll back the login
    return json({ error: `Profile: ${profErr.message}` }, 400);
  }

  // 3. Staff directory record (linked to the auth user).
  const { error: staffErr } = await admin.from("staff").insert({
    full_name: fullName,
    role,
    email,
    avatar_url: avatar,
    on_duty: true,
    user_id: userId,
  });
  if (staffErr) {
    await admin.auth.admin.deleteUser(userId); // roll back the login
    return json({ error: `Staff: ${staffErr.message}` }, 400);
  }

  return json({ ok: true });
});
