import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Trash2 } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { bumpData } from "../../lib/refresh";
import { logActivity } from "../../lib/audit";
import { useToast } from "../../lib/toast";
import Modal from "../ui/Modal";
import ConfirmDialog from "../ui/ConfirmDialog";

const STATUSES = ["Healthy", "Pending Vax", "Under Treatment", "Senior Care"];
const SPECIES = ["Dog", "Cat", "Bird", "Rabbit", "Other"];

const empty = { name: "", species: "Dog", breed: "", age_years: "", status: "Healthy", tags: "" };

function avatarFor(name) {
  return `https://api.dicebear.com/9.x/big-ears/svg?seed=${encodeURIComponent(name.trim())}&backgroundColor=dbf1fe`;
}

// Create / edit / remove a pet for a given owner.
function PetModal({ open, onClose, pet, ownerId, actorName }) {
  const editingId = pet?.id ?? null;
  const toast = useToast();
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError("");
    setConfirmDelete(false);
    setForm(
      pet
        ? {
            name: pet.name ?? "",
            species: pet.species ?? "Dog",
            breed: pet.breed ?? "",
            age_years: pet.age_years ?? "",
            status: pet.status ?? "Healthy",
            tags: (pet.tags ?? []).join(", "),
          }
        : empty
    );
  }, [open, pet]);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) return setError("Please enter the pet's name.");

    const row = {
      name: form.name.trim(),
      species: form.species,
      breed: form.breed.trim() || null,
      age_years: form.age_years === "" ? null : Number(form.age_years),
      status: form.status,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      photo_url: avatarFor(form.name),
      owner_id: ownerId,
    };

    setSaving(true);
    const { error: err } = editingId
      ? await supabase.from("pets").update(row).eq("id", editingId)
      : await supabase.from("pets").insert(row);
    if (err) return finish(err.message);
    await logActivity(
      editingId ? `Updated Pet (${row.name})` : `Added New Pet (${row.name})`,
      editingId ? "update" : "create",
      actorName
    );
    setSaving(false);
    toast(editingId ? "Pet updated" : "Pet added");
    bumpData();
    onClose();
  }

  async function performDelete() {
    setSaving(true);
    const { error: err } = await supabase.from("pets").delete().eq("id", editingId);
    if (err) return finish(err.message);
    await logActivity(`Removed Pet (${pet?.name ?? ""})`, "delete", actorName);
    setSaving(false);
    setConfirmDelete(false);
    toast("Pet removed");
    bumpData();
    onClose();
  }

  function finish(message) {
    setSaving(false);
    setError(message);
  }

  const field =
    "h-11 w-full rounded-2xl bg-input px-4 font-nunito text-sm text-ink outline-none focus:ring-2 focus:ring-brand/60";
  const selectField =
    "h-11 w-full rounded-2xl bg-input pl-4 pr-10 font-nunito text-sm text-ink outline-none focus:ring-2 focus:ring-brand/60";
  const label = "font-nunito font-bold text-xs tracking-[0.6px] text-ink";

  return (
    <>
      <Modal open={open} onClose={onClose} title={editingId ? "Edit Pet" : "Add Pet"}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5">
              <span className={label}>Name</span>
              <input value={form.name} onChange={update("name")} placeholder="Luna" className={field} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={label}>Species</span>
              <select value={form.species} onChange={update("species")} className={selectField}>
                {SPECIES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5">
              <span className={label}>Breed</span>
              <input value={form.breed} onChange={update("breed")} placeholder="Golden Retriever" className={field} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={label}>Age (years)</span>
              <input type="number" min="0" value={form.age_years} onChange={update("age_years")} className={field} />
            </label>
          </div>
          <label className="flex flex-col gap-1.5">
            <span className={label}>Status</span>
            <select value={form.status} onChange={update("status")} className={selectField}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={label}>Tags (comma separated)</span>
            <input value={form.tags} onChange={update("tags")} placeholder="Vaccinated, Neutered" className={field} />
          </label>

          {error && <p className="font-nunito text-sm text-red-600">{error}</p>}

          <div className="flex items-center justify-between gap-3 pt-2">
            {editingId ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                disabled={saving}
                className="flex items-center gap-2 rounded-full px-4 py-2.5 font-quicksand font-semibold text-sm text-accent-rust transition hover:bg-cta/10 disabled:opacity-70"
              >
                <Trash2 className="size-4" strokeWidth={2} />
                Remove Pet
              </button>
            ) : (
              <span />
            )}
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="rounded-full px-5 py-2.5 font-quicksand font-semibold text-sm text-subtle transition hover:bg-surface">
                Close
              </button>
              <button type="submit" disabled={saving} className="rounded-full bg-brand-dark px-6 py-2.5 font-quicksand font-semibold text-sm text-white shadow-md transition hover:brightness-110 disabled:opacity-70">
                {saving ? "Saving..." : editingId ? "Save Changes" : "Add Pet"}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmDelete}
        title="Remove pet"
        message={`Remove ${pet?.name ?? "this pet"}? This also removes their appointments and records.`}
        confirmLabel="Remove pet"
        variant="danger"
        loading={saving}
        onConfirm={performDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}

PetModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  pet: PropTypes.object,
  ownerId: PropTypes.string,
  actorName: PropTypes.string,
};

export default PetModal;
