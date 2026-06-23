import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { startOfWeek, addDays } from "../lib/calendar";
import { useDataVersion } from "../lib/refresh";

// Postgres error code for "relation does not exist" — i.e. setup.sql
// has not been run yet. We treat this as "needs setup" rather than a crash.
const UNDEFINED_TABLE = "42P01";

// Bounds for the current range (range="today"|"week"), `periodsAgo` steps back
// whole periods so we can compare against the previous one for the trend.
function bounds(range, periodsAgo = 0) {
  if (range === "week") {
    const start = addDays(startOfWeek(new Date()), -7 * periodsAgo);
    return { start: start.toISOString(), end: addDays(start, 7).toISOString() };
  }
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - periodsAgo);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

async function countAppointments(type, { start, end }) {
  const { count, error } = await supabase
    .from("appointments")
    .select("*", { count: "exact", head: true })
    .eq("type", type)
    .gte("scheduled_at", start)
    .lt("scheduled_at", end);
  if (error) throw error;
  return count ?? 0;
}

async function countNewOwners({ start, end }) {
  const { count, error } = await supabase
    .from("owners")
    .select("*", { count: "exact", head: true })
    .gte("created_at", start)
    .lt("created_at", end);
  if (error) throw error;
  return count ?? 0;
}

// Loads everything the dashboard needs for the selected range in parallel.
export function useDashboard(session, range = "today") {
  const dataVersion = useDataVersion();
  const [state, setState] = useState({
    loading: true,
    needsSetup: false,
    error: null,
    stats: { checkups: 0, checkupTrend: null, groomings: 0, surgeries: 0, newClients: 0 },
    surgery: null,
    activity: [],
    schedule: [],
  });

  useEffect(() => {
    if (!isSupabaseConfigured || !session) return;
    let active = true;
    setState((prev) => ({ ...prev, loading: true }));

    async function load() {
      const current = bounds(range, 0);
      const previous = bounds(range, 1);

      try {
        const [
          checkups,
          checkupsPrev,
          groomings,
          surgeries,
          newClients,
          surgeryRes,
          activityRes,
          scheduleRes,
        ] = await Promise.all([
          countAppointments("checkup", current),
          countAppointments("checkup", previous),
          countAppointments("grooming", current),
          countAppointments("surgery", current),
          countNewOwners(current),
          supabase
            .from("appointments")
            .select("title, scheduled_at, pets(name, species, breed, photo_url)")
            .eq("type", "surgery")
            .gte("scheduled_at", current.start)
            .lt("scheduled_at", current.end)
            .order("scheduled_at", { ascending: true })
            .limit(1)
            .maybeSingle(),
          supabase
            .from("audit_logs")
            .select("id, action, action_type, actor_name, created_at")
            .order("created_at", { ascending: false })
            .limit(6),
          supabase
            .from("appointments")
            .select(
              "id, type, title, scheduled_at, pets(name, breed, species, owners(full_name))"
            )
            .gte("scheduled_at", current.start)
            .lt("scheduled_at", current.end)
            .order("scheduled_at", { ascending: false }),
        ]);

        if (surgeryRes.error) throw surgeryRes.error;
        if (activityRes.error) throw activityRes.error;
        if (scheduleRes.error) throw scheduleRes.error;

        const checkupTrend =
          checkupsPrev > 0
            ? Math.round(((checkups - checkupsPrev) / checkupsPrev) * 100)
            : null;

        if (!active) return;
        setState({
          loading: false,
          needsSetup: false,
          error: null,
          stats: { checkups, checkupTrend, groomings, surgeries, newClients },
          surgery: surgeryRes.data,
          activity: activityRes.data ?? [],
          schedule: scheduleRes.data ?? [],
        });
      } catch (err) {
        if (!active) return;
        const needsSetup =
          err?.code === UNDEFINED_TABLE ||
          /does not exist/i.test(err?.message ?? "");
        setState((prev) => ({
          ...prev,
          loading: false,
          needsSetup,
          error: needsSetup ? null : err?.message ?? "Failed to load dashboard.",
        }));
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [session, range, dataVersion]);

  return state;
}
