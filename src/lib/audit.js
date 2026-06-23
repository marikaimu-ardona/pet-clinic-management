import { supabase } from "./supabase";

// Write a row to the audit trail (the Activity Logs page + dashboard feed).
// Best-effort: never blocks the main action on a logging failure.
export async function logActivity(action, actionType, actorName, status = "success") {
  try {
    await supabase.from("audit_logs").insert({
      action,
      action_type: actionType,
      actor_name: actorName || "Staff",
      status,
    });
  } catch {
    /* ignore logging errors */
  }
}
