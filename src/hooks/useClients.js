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

// The "Recent Clients" list.
export function useClients() {
  const dataVersion = useDataVersion();
  const [state, setState] = useState({
    loading: true,
    error: null,
    needsSetup: false,
    clients: [],
  });

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;

    supabase
      .from("owners")
      .select("id, full_name, email, phone, location, avatar_url, created_at")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          setState({
            loading: false,
            error: isSetupError(error) ? null : error.message,
            needsSetup: isSetupError(error),
            clients: [],
          });
          return;
        }
        setState({ loading: false, error: null, needsSetup: false, clients: data ?? [] });
      });

    return () => {
      active = false;
    };
  }, [dataVersion]);

  return state;
}

// Pets + medical history for the selected client.
export function useClientDetail(ownerId) {
  const dataVersion = useDataVersion();
  const [state, setState] = useState({
    loading: true,
    error: null,
    pets: [],
    records: [],
    nextVisit: null,
  });

  useEffect(() => {
    if (!isSupabaseConfigured || !ownerId) return;
    let active = true;
    setState((prev) => ({ ...prev, loading: true }));

    async function load() {
      const [petsRes, recordsRes] = await Promise.all([
        supabase
          .from("pets")
          .select("id, name, species, breed, age_years, status, tags, photo_url, next_visit")
          .eq("owner_id", ownerId)
          .order("name", { ascending: true }),
        supabase
          .from("medical_records")
          .select("id, title, record_date, type, attending, note, pets!inner(name, owner_id)")
          .eq("pets.owner_id", ownerId)
          .order("record_date", { ascending: false }),
      ]);

      if (!active) return;
      const error = petsRes.error || recordsRes.error;
      const pets = petsRes.data ?? [];
      const nextVisit = pets
        .map((p) => p.next_visit)
        .filter(Boolean)
        .sort()[0] ?? null;

      setState({
        loading: false,
        error: error && !isSetupError(error) ? error.message : null,
        pets,
        records: recordsRes.data ?? [],
        nextVisit,
      });
    }

    load();
    return () => {
      active = false;
    };
  }, [ownerId, dataVersion]);

  return state;
}
