import PropTypes from "prop-types";
import { Syringe, Stethoscope, Bone, Scissors, FileText, Plus } from "lucide-react";

const TYPE_ICON = {
  vaccination: Syringe,
  checkup: Stethoscope,
  dental: Bone,
  surgery: Stethoscope,
  grooming: Scissors,
};

function recordDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

// Timeline of a client's recent medical records (across all their pets).
function MedicalHistory({ records, loading, onAdd }) {
  return (
    <div className="rounded-[32px] bg-card p-6 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between">
        <h2 className="font-quicksand font-bold text-xl text-ink">Recent Medical History</h2>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 rounded-full bg-brand-dark px-4 py-2 font-quicksand font-semibold text-sm text-white shadow-sm transition hover:brightness-110"
        >
          <Plus className="size-4" strokeWidth={2.5} />
          Add Record
        </button>
      </div>

      {loading ? (
        <p className="mt-4 font-nunito text-sm text-subtle">Loading history...</p>
      ) : records.length === 0 ? (
        <p className="mt-4 font-nunito text-sm text-subtle">No medical history on record.</p>
      ) : (
        <ul className="mt-5 flex flex-col">
          {records.map((rec, i) => {
            const Icon = TYPE_ICON[rec.type] ?? FileText;
            const last = i === records.length - 1;
            return (
              <li key={rec.id} className="flex gap-4">
                {/* Timeline rail */}
                <div className="flex flex-col items-center">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand-dark">
                    <Icon className="size-4" strokeWidth={2} />
                  </span>
                  {!last && <span className="w-px flex-1 bg-muted/20" />}
                </div>

                <div className={`min-w-0 flex-1 ${last ? "" : "pb-6"}`}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="font-quicksand font-semibold text-base text-brand-dark">
                      {rec.title}
                    </h3>
                    <span className="font-nunito font-bold text-xs text-subtle">
                      {recordDate(rec.record_date)}
                    </span>
                  </div>
                  <p className="mt-0.5 font-nunito text-sm text-subtle">
                    Patient: {rec.pets?.name ?? "—"}
                    {rec.attending ? ` • Attending: ${rec.attending}` : ""}
                  </p>
                  {rec.note && (
                    <p className="mt-2 rounded-2xl bg-surface px-4 py-3 font-nunito text-sm italic text-ink">
                      &ldquo;{rec.note}&rdquo;
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

MedicalHistory.propTypes = {
  records: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  onAdd: PropTypes.func,
};

export default MedicalHistory;
