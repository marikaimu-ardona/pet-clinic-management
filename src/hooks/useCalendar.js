import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { useDataVersion } from "../lib/refresh";

// Loads appointments within a [start, end) date range plus a
// completed/pending summary. Used by every calendar view.
export function useCalendar(start, end) {
  const dataVersion = useDataVersion();
  const [state, setState] = useState({
    loading: true,
    error: null,
    appointments: [],
    summary: { total: 0, completed: 0, pending: 0 },
  });

  const startISO = start.toISOString();
  const endISO = end.toISOString();

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;
    setState((prev) => ({ ...prev, loading: true }));

    supabase
      .from("appointments")
      .select(
        "id, type, category, title, scheduled_at, duration_minutes, status, vet, room, pets(name, species, breed, photo_url)"
      )
      .gte("scheduled_at", startISO)
      .lt("scheduled_at", endISO)
      .order("scheduled_at", { ascending: true })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          setState({
            loading: false,
            error: error.message,
            appointments: [],
            summary: { total: 0, completed: 0, pending: 0 },
          });
          return;
        }
        const appointments = data ?? [];
        const completed = appointments.filter((a) => a.status === "completed").length;
        setState({
          loading: false,
          error: null,
          appointments,
          summary: {
            total: appointments.length,
            completed,
            pending: appointments.length - completed,
          },
        });
      });

    return () => {
      active = false;
    };
  }, [startISO, endISO, dataVersion]);

  return state;
}
