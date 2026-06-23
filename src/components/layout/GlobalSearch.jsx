import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, User, PawPrint } from "lucide-react";
import { supabase } from "../../lib/supabase";

// Top-bar search over clients (owners) and patients (pets). Selecting a result
// opens that client on the Clients page.
function GlobalSearch() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [results, setResults] = useState({ clients: [], pets: [] });
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setResults({ clients: [], pets: [] });
      return;
    }
    let active = true;
    const timer = setTimeout(async () => {
      const [owners, pets] = await Promise.all([
        supabase.from("owners").select("id, full_name, location").ilike("full_name", `%${term}%`).limit(5),
        supabase.from("pets").select("id, name, breed, owner_id").ilike("name", `%${term}%`).limit(5),
      ]);
      if (!active) return;
      setResults({ clients: owners.data ?? [], pets: pets.data ?? [] });
      setOpen(true);
    }, 200);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [q]);

  const go = (ownerId) => {
    if (!ownerId) return;
    navigate(`/clients?client=${ownerId}`);
    setQ("");
    setOpen(false);
    setResults({ clients: [], pets: [] });
  };

  const hasResults = results.clients.length > 0 || results.pets.length > 0;

  return (
    <div ref={boxRef} className="relative max-w-[384px] flex-1">
      <div className="flex items-center gap-2 rounded-full border border-muted/10 bg-surface px-4 py-2">
        <Search className="size-[18px] shrink-0 text-muted" strokeWidth={2} />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => hasResults && setOpen(true)}
          placeholder="Search patients or owners..."
          className="w-full bg-transparent font-nunito text-sm text-ink placeholder:text-muted outline-none"
        />
      </div>

      {open && q.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-80 overflow-auto rounded-2xl border border-card-border bg-card p-2 shadow-lg">
          {!hasResults && (
            <p className="px-3 py-3 font-nunito text-sm text-subtle">No matches.</p>
          )}
          {results.clients.length > 0 && (
            <>
              <p className="px-3 pb-1 pt-2 font-nunito font-extrabold text-[10px] uppercase tracking-wide text-subtle/60">
                Clients
              </p>
              {results.clients.map((c) => (
                <button
                  key={c.id}
                  onClick={() => go(c.id)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-surface"
                >
                  <User className="size-4 shrink-0 text-brand-dark" strokeWidth={2} />
                  <span className="min-w-0">
                    <span className="block truncate font-nunito font-bold text-sm text-ink">{c.full_name}</span>
                    {c.location && (
                      <span className="block truncate font-nunito text-xs text-subtle">{c.location}</span>
                    )}
                  </span>
                </button>
              ))}
            </>
          )}
          {results.pets.length > 0 && (
            <>
              <p className="px-3 pb-1 pt-2 font-nunito font-extrabold text-[10px] uppercase tracking-wide text-subtle/60">
                Patients
              </p>
              {results.pets.map((p) => (
                <button
                  key={p.id}
                  onClick={() => go(p.owner_id)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-surface"
                >
                  <PawPrint className="size-4 shrink-0 text-brand-dark" strokeWidth={2} />
                  <span className="min-w-0">
                    <span className="block truncate font-nunito font-bold text-sm text-ink">{p.name}</span>
                    {p.breed && (
                      <span className="block truncate font-nunito text-xs text-subtle">{p.breed}</span>
                    )}
                  </span>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default GlobalSearch;
