import PropTypes from "prop-types";
import {
  PawPrint,
  Plus,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  History,
  Pencil,
} from "lucide-react";
import Avatar from "../dashboard/Avatar";

function StatusBadge({ status }) {
  const healthy = status === "Healthy";
  return (
    <span
      className={`rounded-full px-2.5 py-1 font-nunito font-bold text-[11px] ${
        healthy ? "bg-green-100 text-green-700" : "bg-cta/20 text-accent-rust"
      }`}
    >
      {status || "Unknown"}
    </span>
  );
}
StatusBadge.propTypes = { status: PropTypes.string };

function PetCard({ pet, onEdit, onRecords, onHistory }) {
  const healthy = pet.status === "Healthy";
  return (
    <div className="flex flex-col gap-4 rounded-[28px] bg-card p-5 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
      <div className="flex items-start gap-4">
        <Avatar
          name={pet.name}
          src={pet.photo_url}
          className="h-20 w-16 shrink-0 rounded-2xl bg-input"
          textClassName="text-lg"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-quicksand font-bold text-xl text-ink">{pet.name}</h3>
            <div className="flex items-center gap-1">
              <StatusBadge status={pet.status} />
              <button
                onClick={onEdit}
                aria-label="Edit pet"
                className="rounded-full p-1 text-subtle transition hover:bg-surface"
              >
                <Pencil className="size-3.5" strokeWidth={2} />
              </button>
            </div>
          </div>
          <p className="mt-1 font-nunito text-sm text-subtle">
            {[pet.breed, pet.age_years != null ? `${pet.age_years} Years Old` : null]
              .filter(Boolean)
              .join(" • ")}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(pet.tags || []).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-surface px-3 py-1 font-nunito font-bold text-[11px] text-brand-dark"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 border-t border-muted/15 pt-3">
        {healthy ? (
          <CheckCircle2 className="size-5 shrink-0 text-brand-dark" strokeWidth={2} />
        ) : (
          <AlertTriangle className="size-5 shrink-0 text-accent-rust" strokeWidth={2} />
        )}
        <button
          onClick={() => onRecords?.(pet)}
          className="flex items-center gap-1.5 font-nunito font-bold text-xs text-brand-dark hover:underline"
        >
          Medical Records
          <ExternalLink className="size-3.5" strokeWidth={2} />
        </button>
        <button
          onClick={() => onHistory?.(pet)}
          className="flex items-center gap-1.5 font-nunito font-bold text-xs text-subtle hover:underline"
        >
          History
          <History className="size-3.5" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
PetCard.propTypes = {
  pet: PropTypes.object.isRequired,
  onEdit: PropTypes.func,
  onRecords: PropTypes.func,
  onHistory: PropTypes.func,
};

// "Registered Pets" section: header + pet card grid.
function RegisteredPets({ pets, loading, onAddPet, onEditPet, onRecords, onHistory }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-quicksand font-bold text-2xl text-brand-dark">
          <PawPrint className="size-6" strokeWidth={2} />
          Registered Pets
        </h2>
        <button
          onClick={onAddPet}
          className="flex items-center gap-2 rounded-full bg-accent-rust px-4 py-2 font-quicksand font-semibold text-sm text-white shadow-sm transition hover:brightness-105"
        >
          <Plus className="size-4" strokeWidth={2.5} />
          Add Pet
        </button>
      </div>

      {loading ? (
        <p className="font-nunito text-sm text-subtle">Loading pets...</p>
      ) : pets.length === 0 ? (
        <p className="font-nunito text-sm text-subtle">No pets registered for this client.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {pets.map((pet) => (
            <PetCard
              key={pet.id}
              pet={pet}
              onEdit={() => onEditPet?.(pet)}
              onRecords={() => onRecords?.(pet)}
              onHistory={() => onHistory?.(pet)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

RegisteredPets.propTypes = {
  pets: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  onAddPet: PropTypes.func,
  onEditPet: PropTypes.func,
  onRecords: PropTypes.func,
  onHistory: PropTypes.func,
};

export default RegisteredPets;
