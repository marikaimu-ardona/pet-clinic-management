import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { useDataVersion } from "../lib/refresh";

const UNDEFINED_TABLE = "42P01";
const UNDEFINED_COLUMN = "42703";

function isSetupError(err) {
  return (
    err?.code === UNDEFINED_TABLE ||
    err?.code === UNDEFINED_COLUMN ||
    /does not exist/i.test(err?.message ?? "")
  );
}

// The full staff directory + total count, plus the set of admin user ids
// (profiles.is_admin) so the directory can flag who can manage staff.
export function useStaff() {
  const dataVersion = useDataVersion();
  const [state, setState] = useState({
    loading: true,
    error: null,
    needsSetup: false,
    staff: [],
    total: 0,
    adminIds: [],
  });

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;

    async function load() {
      const [staffRes, adminRes] = await Promise.all([
        supabase
          .from("staff")
          .select("id, full_name, role, email, avatar_url, on_duty, user_id")
          .order("on_duty", { ascending: false })
          .order("full_name", { ascending: true }),
        supabase.from("profiles").select("id").eq("is_admin", true),
      ]);

      if (!active) return;
      if (staffRes.error) {
        setState({
          loading: false,
          error: isSetupError(staffRes.error) ? null : staffRes.error.message,
          needsSetup: isSetupError(staffRes.error),
          staff: [],
          total: 0,
          adminIds: [],
        });
        return;
      }
      setState({
        loading: false,
        error: null,
        needsSetup: false,
        staff: staffRes.data ?? [],
        total: staffRes.data?.length ?? 0,
        adminIds: (adminRes.data ?? []).map((p) => p.id),
      });
    }

    load();
    return () => {
      active = false;
    };
  }, [dataVersion]);

  return state;
}
