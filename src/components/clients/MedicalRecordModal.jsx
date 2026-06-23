import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { supabase } from "../../lib/supabase";
import { bumpData } from "../../lib/refresh";
import { logActivity } from "../../lib/audit";
import { useToast } from "../../lib/toast";
import Modal from "../ui/Modal";

const TYPES = ["checkup", "vaccination", "dental", "surgery", "grooming"];

function todayStr() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// Add a medical record for one of the client's pets.
function MedicalRecordModal({ open, onClose, pets, presetPetId, actorName }) {
  const toast = useToast();
  const [form, setForm] = useState({
    petId: "",
    title: "",
    type: "checkup",
    record_date: todayStr(),
    attending: "",
    note: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setError("");
    setForm({
      petId: presetPetId || pets[0]?.id || "",
      title: "",
      type: "checkup",
      record_date: todayStr(),
      attending: "",
      note: "",
    });
  }, [open, presetPetId, pets]);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.petId) return setError("Please choose a pet.");
    if (!form.title.trim()) return setError("Please enter a title.");

    setSaving(true);
    const { error: err } = await supabase.from("medical_records").insert({
      pet_id: form.petId,
      title: form.title.trim(),
      type: form.type,
      record_date: form.record_date,
      attending: form.attending.trim() || null,
      note: form.note.trim() || null,
    });
    setSaving(false);
    if (err) return setError(err.message);

    const petName = pets.find((p) => p.id === form.petId)?.name ?? "";
    await logActivity(`Added Medical Record (${petName})`, "create", actorName);
    toast("Medical record added");
    bumpData();
    onClose();
  }

  const field =
    "h-11 w-full rounded-2xl bg-input px-4 font-nunito text-sm text-ink outline-none focus:ring-2 focus:ring-brand/60";
  const selectField =
    "h-11 w-full rounded-2xl bg-input pl-4 pr-10 font-nunito text-sm text-ink outline-none focus:ring-2 focus:ring-brand/60";
  const label = "font-nunito font-bold text-xs tracking-[0.6px] text-ink";

  return (
    <Modal open={open} onClose={onClose} title="Add Medical Record">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5">
            <span className={label}>Pet</span>
            <select value={form.petId} onChange={update("petId")} className={selectField}>
              <option value="">Select a pet...</option>
              {pets.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={label}>Type</span>
            <select value={form.type} onChange={update("type")} className={selectField}>
              {TYPES.map((t) => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </label>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className={label}>Title</span>
          <input value={form.title} onChange={update("title")} placeholder="Annual Checkup & Rabies Vax" className={field} />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5">
            <span className={label}>Date</span>
            <input type="date" max={todayStr()} value={form.record_date} onChange={update("record_date")} className={field} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={label}>Attending</span>
            <input value={form.attending} onChange={update("attending")} placeholder="Dr. Sarah Jenkins" className={field} />
          </label>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className={label}>Note</span>
          <textarea
            value={form.note}
            onChange={update("note")}
            rows={3}
            placeholder="Findings, recommendations..."
            className="w-full rounded-2xl bg-input px-4 py-3 font-nunito text-sm text-ink outline-none focus:ring-2 focus:ring-brand/60"
          />
        </label>

        {error && <p className="font-nunito text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="rounded-full px-5 py-2.5 font-quicksand font-semibold text-sm text-subtle transition hover:bg-surface">
            Close
          </button>
          <button type="submit" disabled={saving} className="rounded-full bg-brand-dark px-6 py-2.5 font-quicksand font-semibold text-sm text-white shadow-md transition hover:brightness-110 disabled:opacity-70">
            {saving ? "Saving..." : "Add Record"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

MedicalRecordModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  pets: PropTypes.array.isRequired,
  presetPetId: PropTypes.string,
  actorName: PropTypes.string,
};

export default MedicalRecordModal;
