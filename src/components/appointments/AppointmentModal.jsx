import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Trash2, CircleCheck, RotateCcw } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { bumpData } from "../../lib/refresh";
import { logActivity } from "../../lib/audit";
import { useToast } from "../../lib/toast";
import Modal from "../ui/Modal";
import ConfirmDialog from "../ui/ConfirmDialog";

const TYPES = [
  { value: "checkup", label: "Check-up" },
  { value: "grooming", label: "Grooming" },
  { value: "surgery", label: "Surgery" },
];

const CATEGORIES = {
  checkup: ["routine", "vaccination"],
  grooming: ["grooming"],
  surgery: ["surgery"],
};

const GROOMING_SERVICES = ["Full Grooming", "Nail Trimming", "Bath & Brush", "Haircut & Style", "De-shedding"];
const GROOMER_ROLES = ["Lead Groomer", "Assistant", "Groomer"];
const OPERATING_ROOMS = ["OR-1", "OR-2", "OR-3"];

const pad = (n) => String(n).padStart(2, "0");
const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const toDateInput = (iso) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const toTimeInput = (iso) => {
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const emptyForm = {
  petId: "",
  type: "checkup",
  category: "routine",
  date: todayStr(),
  time: "09:00",
  duration: 30,
  service: GROOMING_SERVICES[0],
  staffId: "",
  vet: "",
  room: "",
  status: "scheduled",
};

// Create or edit an appointment. Pass `appointment` (with at least an id) to
// edit; omit it to create. Edit mode also offers Cancel Appointment (delete).
function AppointmentModal({ open, onClose, actorName, appointment }) {
  const editingId = appointment?.id ?? null;
  const toast = useToast();
  const [pets, setPets] = useState([]);
  const [staff, setStaff] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState({ open: false, kind: null });
  const [originalStart, setOriginalStart] = useState(null);

  const LEAD_MS = 2 * 60 * 60 * 1000; // appointments must be >= 2h out

  useEffect(() => {
    if (!open) return;
    setError("");
    setForm(emptyForm);
    setConfirm({ open: false, kind: null });
    setOriginalStart(null);

    supabase.from("pets").select("id, name, breed").order("name").then(({ data }) => setPets(data ?? []));
    supabase
      .from("staff")
      .select("id, full_name, role, on_duty")
      .eq("on_duty", true)
      .order("full_name")
      .then(({ data }) => setStaff(data ?? []));

    // Edit mode: load the full row and prefill.
    if (editingId) {
      supabase
        .from("appointments")
        .select("pet_id, type, category, scheduled_at, duration_minutes, service, staff_id, vet, room, status")
        .eq("id", editingId)
        .maybeSingle()
        .then(({ data: a }) => {
          if (!a) return;
          setOriginalStart(a.scheduled_at);
          setForm({
            petId: a.pet_id ?? "",
            type: a.type,
            category: a.category ?? CATEGORIES[a.type]?.[0] ?? "routine",
            date: toDateInput(a.scheduled_at),
            time: toTimeInput(a.scheduled_at),
            duration: a.duration_minutes ?? 30,
            service: a.service ?? GROOMING_SERVICES[0],
            staffId: a.staff_id ?? "",
            vet: a.vet ?? "",
            room: a.room ?? "",
            status: a.status ?? "scheduled",
          });
        });
    }
  }, [open, editingId]);

  const groomers = staff.filter((s) => GROOMER_ROLES.includes(s.role));
  const vets = staff.filter((s) => s.role === "Veterinarian");

  const update = (key) => (e) => {
    const value = e.target.value;
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === "type") {
        next.category = CATEGORIES[value][0];
        next.duration = value === "surgery" ? 120 : value === "grooming" ? 45 : 30;
      }
      return next;
    });
  };

  // Validate, then ask for confirmation before writing.
  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.petId) {
      setError("Please choose a patient.");
      return;
    }
    if (form.type === "surgery") {
      if (!form.vet) return setError("Please select a vet for the surgery.");
      if (!form.room) return setError("Please select an operating room.");
    }

    // Can't book in the past, and must be at least 2 hours out. Only enforced
    // when the time actually changes (so editing other fields stays allowed).
    const start = new Date(`${form.date}T${form.time}`);
    const timeChanged = !editingId || start.toISOString() !== originalStart;
    if (timeChanged && start.getTime() < Date.now() + LEAD_MS) {
      return setError("Appointments must be booked at least 2 hours from now.");
    }

    setConfirm({ open: true, kind: editingId ? "save" : "create" });
  }

  async function performSave() {
    setError("");

    const start = new Date(`${form.date}T${form.time}`);
    const duration = Number(form.duration) || 30;
    const end = new Date(start.getTime() + duration * 60000);
    const scheduledAt = start.toISOString();
    const isGrooming = form.type === "grooming";
    const isSurgery = form.type === "surgery";

    const dayStart = new Date(start);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    const overlaps = (a) => {
      const s = new Date(a.scheduled_at);
      const ee = new Date(s.getTime() + (a.duration_minutes || 0) * 60000);
      return s < end && ee > start;
    };
    const timeOf = (a) =>
      new Date(a.scheduled_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

    // Conflict queries exclude the appointment being edited.
    const dayWindow = (q) => {
      let query = q
        .gte("scheduled_at", dayStart.toISOString())
        .lt("scheduled_at", dayEnd.toISOString());
      if (editingId) query = query.neq("id", editingId);
      return query;
    };

    if (isSurgery) {
      if (!form.vet) return setError("Please select a vet for the surgery.");
      if (!form.room) return setError("Please select an operating room.");

      setSaving(true);
      const { data: existing, error: clashError } = await dayWindow(
        supabase
          .from("appointments")
          .select("scheduled_at, duration_minutes, room, vet, pets(name)")
          .eq("type", "surgery")
      );
      if (clashError) return finishWithError(clashError.message);

      const roomClash = (existing ?? []).find((a) => a.room === form.room && overlaps(a));
      if (roomClash)
        return finishWithError(
          `${form.room} is already booked at ${timeOf(roomClash)}${roomClash.pets?.name ? ` for ${roomClash.pets.name}` : ""}. Choose another room or time.`
        );

      const vetClash = (existing ?? []).find((a) => a.vet === form.vet && overlaps(a));
      if (vetClash)
        return finishWithError(
          `${form.vet} is already in surgery at ${timeOf(vetClash)}${vetClash.pets?.name ? ` (${vetClash.pets.name})` : ""}. Choose another vet or time.`
        );
    }

    if (isGrooming && form.staffId) {
      setSaving(true);
      const { data: existing, error: clashError } = await dayWindow(
        supabase.from("appointments").select("scheduled_at, duration_minutes, pets(name)").eq("staff_id", form.staffId)
      );
      if (clashError) return finishWithError(clashError.message);

      const clash = (existing ?? []).find(overlaps);
      if (clash) {
        const groomer = groomers.find((g) => g.id === form.staffId);
        return finishWithError(
          `${groomer?.full_name ?? "That groomer"} is already booked at ${timeOf(clash)}${clash.pets?.name ? ` (${clash.pets.name})` : ""}. Choose another groomer or time.`
        );
      }
    }

    const title = isGrooming
      ? form.service
      : isSurgery
        ? "Surgery"
        : form.category === "vaccination"
          ? "Vaccination"
          : "Routine Check-up";

    const row = {
      pet_id: form.petId,
      type: form.type,
      category: form.category,
      title,
      scheduled_at: scheduledAt,
      duration_minutes: duration,
      service: isGrooming ? form.service : null,
      staff_id: isGrooming && form.staffId ? form.staffId : null,
      vet: isSurgery ? form.vet || null : null,
      room: isSurgery ? form.room || null : null,
    };

    setSaving(true);
    const { error: writeError } = editingId
      ? await supabase.from("appointments").update(row).eq("id", editingId)
      : await supabase.from("appointments").insert({ ...row, status: "scheduled" });

    if (writeError) return finishWithError(writeError.message);

    await supabase.from("audit_logs").insert({
      action: editingId ? "Updated Appointment" : "Created New Appointment",
      action_type: editingId ? "update" : "create",
      actor_name: actorName || "Staff",
      status: "success",
    });

    setSaving(false);
    toast(editingId ? "Appointment updated" : "Appointment created");
    bumpData();
    onClose();
  }

  async function setStatus(next) {
    setSaving(true);
    const { error: err } = await supabase
      .from("appointments")
      .update({ status: next })
      .eq("id", editingId);
    setSaving(false);
    if (err) return setError(err.message);
    await logActivity(
      `${next === "completed" ? "Completed" : "Reopened"} Appointment`,
      "update",
      actorName
    );
    toast(next === "completed" ? "Marked as completed" : "Reopened");
    bumpData();
    onClose();
  }

  function finishWithError(message) {
    setSaving(false);
    setError(message);
  }

  async function performDelete() {
    if (!editingId) return;
    setSaving(true);
    const { error: delError } = await supabase.from("appointments").delete().eq("id", editingId);
    if (delError) return finishWithError(delError.message);
    await supabase.from("audit_logs").insert({
      action: "Cancelled Appointment",
      action_type: "delete",
      actor_name: actorName || "Staff",
      status: "success",
    });
    setSaving(false);
    toast("Appointment cancelled");
    bumpData();
    onClose();
  }

  async function runConfirmed() {
    if (confirm.kind === "cancel") await performDelete();
    else await performSave();
    setConfirm({ open: false, kind: null });
  }

  const CONFIRM_TEXT = {
    create: { title: "Create appointment", message: "Create this appointment?", confirmLabel: "Create", variant: "primary" },
    save: { title: "Save changes", message: "Save changes to this appointment?", confirmLabel: "Save changes", variant: "primary" },
    cancel: {
      title: "Cancel appointment",
      message: "Cancel this appointment? This cannot be undone.",
      confirmLabel: "Cancel appointment",
      variant: "danger",
    },
  };
  const confirmText = CONFIRM_TEXT[confirm.kind] ?? CONFIRM_TEXT.create;

  const field =
    "h-11 w-full rounded-2xl bg-input px-4 font-nunito text-sm text-ink outline-none focus:ring-2 focus:ring-brand/60";
  const selectField =
    "h-11 w-full rounded-2xl bg-input pl-4 pr-10 font-nunito text-sm text-ink outline-none focus:ring-2 focus:ring-brand/60";
  const label = "font-nunito font-bold text-xs tracking-[0.6px] text-ink";

  return (
    <>
    <Modal open={open} onClose={onClose} title={editingId ? "Edit Appointment" : "New Appointment"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className={label}>Patient</span>
          <select value={form.petId} onChange={update("petId")} className={selectField}>
            <option value="">Select a pet...</option>
            {pets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
                {p.breed ? ` (${p.breed})` : ""}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5">
            <span className={label}>Type</span>
            <select value={form.type} onChange={update("type")} className={selectField}>
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={label}>Category</span>
            <select value={form.category} onChange={update("category")} className={selectField}>
              {CATEGORIES[form.type].map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <label className="flex flex-col gap-1.5">
            <span className={label}>Date</span>
            <input type="date" min={todayStr()} value={form.date} onChange={update("date")} className={field} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={label}>Time</span>
            <input type="time" value={form.time} onChange={update("time")} className={field} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={label}>Minutes</span>
            <input type="number" min="5" step="5" value={form.duration} onChange={update("duration")} className={field} />
          </label>
        </div>

        {form.type === "grooming" && (
          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5">
              <span className={label}>Service</span>
              <select value={form.service} onChange={update("service")} className={selectField}>
                {GROOMING_SERVICES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={label}>Groomer</span>
              <select value={form.staffId} onChange={update("staffId")} className={selectField}>
                <option value="">Unassigned</option>
                {groomers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        {form.type === "surgery" && (
          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5">
              <span className={label}>Vet</span>
              <select value={form.vet} onChange={update("vet")} className={selectField}>
                <option value="">Select a vet...</option>
                {vets.map((v) => (
                  <option key={v.id} value={v.full_name}>
                    {v.full_name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={label}>Operating Room</span>
              <select value={form.room} onChange={update("room")} className={selectField}>
                <option value="">Select a room...</option>
                {OPERATING_ROOMS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        {error && <p className="font-nunito text-sm text-red-600">{error}</p>}

        <div className="flex items-center justify-between gap-3 pt-2">
          {editingId ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setStatus(form.status === "completed" ? "scheduled" : "completed")}
                disabled={saving}
                className="flex items-center gap-2 rounded-full px-4 py-2.5 font-quicksand font-semibold text-sm text-brand-dark transition hover:bg-brand/10 disabled:opacity-70"
              >
                {form.status === "completed" ? (
                  <>
                    <RotateCcw className="size-4" strokeWidth={2} />
                    Reopen
                  </>
                ) : (
                  <>
                    <CircleCheck className="size-4" strokeWidth={2} />
                    Mark completed
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setConfirm({ open: true, kind: "cancel" })}
                disabled={saving}
                className="flex items-center gap-2 rounded-full px-4 py-2.5 font-quicksand font-semibold text-sm text-accent-rust transition hover:bg-cta/10 disabled:opacity-70"
              >
                <Trash2 className="size-4" strokeWidth={2} />
                Cancel
              </button>
            </div>
          ) : (
            <span />
          )}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-5 py-2.5 font-quicksand font-semibold text-sm text-subtle transition hover:bg-surface"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-brand-dark px-6 py-2.5 font-quicksand font-semibold text-sm text-white shadow-md transition hover:brightness-110 disabled:opacity-70"
            >
              {saving ? "Saving..." : editingId ? "Save Changes" : "Create Appointment"}
            </button>
          </div>
        </div>
      </form>
    </Modal>

      <ConfirmDialog
        open={confirm.open}
        title={confirmText.title}
        message={confirmText.message}
        confirmLabel={confirmText.confirmLabel}
        variant={confirmText.variant}
        loading={saving}
        onConfirm={runConfirmed}
        onCancel={() => setConfirm({ open: false, kind: null })}
      />
    </>
  );
}

AppointmentModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  actorName: PropTypes.string,
  appointment: PropTypes.object,
};

export default AppointmentModal;
