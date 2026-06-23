import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { supabase } from "../../lib/supabase";
import { timeOfDay } from "../../lib/format";
import Modal from "../ui/Modal";
import Skeleton from "../ui/Skeleton";

const STATUS_STYLE = {
  completed: "bg-green-100 text-green-700",
  scheduled: "bg-input text-brand-dark",
  cancelled: "bg-cta/20 text-accent-rust",
};

function fullDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Read-only timeline of a pet's appointments (most recent first).
function PetHistoryModal({ open, onClose, pet }) {
  const [appts, setAppts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open || !pet?.id) return;
    let active = true;
    setLoading(true);
    supabase
      .from("appointments")
      .select("id, type, title, service, scheduled_at, duration_minutes, status, vet")
      .eq("pet_id", pet.id)
      .order("scheduled_at", { ascending: false })
      .then(({ data }) => {
        if (!active) return;
        setAppts(data ?? []);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [open, pet]);

  return (
    <Modal open={open} onClose={onClose} title={`${pet?.name ?? "Pet"} — Visit History`}>
      {loading ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : appts.length === 0 ? (
        <p className="py-6 text-center font-nunito text-sm text-subtle">
          No appointments on record for {pet?.name}.
        </p>
      ) : (
        <ul className="flex max-h-[60vh] flex-col gap-3 overflow-auto">
          {appts.map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-3 rounded-2xl bg-surface px-4 py-3">
              <div className="min-w-0">
                <p className="font-nunito font-semibold text-sm text-ink">
                  {a.title || a.service || a.type}
                </p>
                <p className="font-nunito text-xs text-subtle">
                  {fullDate(a.scheduled_at)} · {timeOfDay(a.scheduled_at)}
                  {a.vet ? ` · ${a.vet}` : ""}
                </p>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 font-nunito font-bold text-[10px] uppercase ${STATUS_STYLE[a.status] ?? STATUS_STYLE.scheduled}`}>
                {a.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}

PetHistoryModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  pet: PropTypes.object,
};

export default PetHistoryModal;
