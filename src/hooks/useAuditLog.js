import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { useDataVersion } from "../lib/refresh";

const UNDEFINED_TABLE = "42P01";

// Audit trail for the Activity Logs page.
export function useAuditLog() {
  const dataVersion = useDataVersion();
  const [state, setState] = useState({
    loading: true,
    error: null,
    needsSetup: false,
    logs: [],
  });

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;

    supabase
      .from("audit_logs")
      .select("id, action, action_type, actor_name, actor_avatar, status, created_at")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          const needsSetup =
            error.code === UNDEFINED_TABLE || /does not exist/i.test(error.message ?? "");
          setState({
            loading: false,
            error: needsSetup ? null : error.message,
            needsSetup,
            logs: [],
          });
          return;
        }
        setState({ loading: false, error: null, needsSetup: false, logs: data ?? [] });
      });

    return () => {
      active = false;
    };
  }, [dataVersion]);

  return state;
}
