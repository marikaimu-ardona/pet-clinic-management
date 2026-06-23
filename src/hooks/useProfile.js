import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

// Loads the signed-in user's profile (name, role, avatar) for the app shell.
export function useProfile(session) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!isSupabaseConfigured || !session) return;
    let active = true;

    supabase
      .from("profiles")
      .select("full_name, role, avatar_url, must_change_password, is_admin")
      .eq("id", session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (active) setProfile(data);
      });

    return () => {
      active = false;
    };
  }, [session]);

  return profile;
}
