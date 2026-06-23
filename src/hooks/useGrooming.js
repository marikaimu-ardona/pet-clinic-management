import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { rangeFor } from "../lib/calendar";
import { useDataVersion } from "../lib/refresh";

const UNDEFINED_TABLE = "42P01";
const UNDEFINED_COLUMN = "42703";

const GROOMING_SELECT =
  "id, type, category, service, note, title, scheduled_at, duration_minutes, status, pets(name, breed, species, photo_url), staff(full_name, role, avatar_url)";

// Loads grooming data for the selected day (agenda) plus staff on duty, the
// day's load, and a quick note. In month view it also loads the month's
// grooming appointments for the grid.
export function useGrooming(view, selectedDate) {
  const dataVersion = useDataVersion();
  const [state, setState] = useState({
    loading: true,
    error: null,
    needsSetup: false,
    dayAppointments: [],
    rangeAppointments: [],
    staff: [],
    load: { total: 0, completed: 0, pending: 0 },
    note: null,
  });

  const dateKey = new Date(selectedDate).toDateString();

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;
    setState((prev) => ({ ...prev, loading: true }));

    async function load() {
      const day = rangeFor("day", selectedDate);
      // Week and month views need the wider range; day view does not.
      const range = view === "day" ? null : rangeFor(view, selectedDate);

      try {
        const [dayRes, staffRes, rangeRes] = await Promise.all([
          supabase
            .from("appointments")
            .select(GROOMING_SELECT)
            .eq("type", "grooming")
            .gte("scheduled_at", day.start.toISOString())
            .lt("scheduled_at", day.end.toISOString())
            .order("scheduled_at", { ascending: true }),
          supabase
            .from("staff")
            .select("id, full_name, role, avatar_url, on_duty")
            .eq("on_duty", true)
            .in("role", ["Lead Groomer", "Assistant", "Groomer"])
            .order("role", { ascending: true }),
          range
            ? supabase
                .from("appointments")
                .select(GROOMING_SELECT)
                .eq("type", "grooming")
                .gte("scheduled_at", range.start.toISOString())
                .lt("scheduled_at", range.end.toISOString())
                .order("scheduled_at", { ascending: true })
            : Promise.resolve({ data: [], error: null }),
        ]);

        if (dayRes.error) throw dayRes.error;
        if (staffRes.error) throw staffRes.error;
        if (rangeRes.error) throw rangeRes.error;

        const dayAppointments = dayRes.data ?? [];
        const completed = dayAppointments.filter((a) => a.status === "completed").length;
        const noted = dayAppointments.find((a) => a.note);

        if (!active) return;
        setState({
          loading: false,
          error: null,
          needsSetup: false,
          dayAppointments,
          rangeAppointments: rangeRes.data ?? [],
          staff: staffRes.data ?? [],
          load: {
            total: dayAppointments.length,
            completed,
            pending: dayAppointments.length - completed,
          },
          note: noted ?? null,
        });
      } catch (err) {
        if (!active) return;
        const needsSetup =
          err?.code === UNDEFINED_TABLE ||
          err?.code === UNDEFINED_COLUMN ||
          /does not exist/i.test(err?.message ?? "");
        setState((prev) => ({
          ...prev,
          loading: false,
          needsSetup,
          error: needsSetup ? null : err?.message ?? "Failed to load grooming.",
        }));
      }
    }

    load();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, dateKey, dataVersion]);

  return state;
}
