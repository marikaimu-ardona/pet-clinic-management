import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { supabase } from "../../lib/supabase";
import { bumpData } from "../../lib/refresh";
import { logActivity } from "../../lib/audit";
import { useToast } from "../../lib/toast";
import Modal from "../ui/Modal";

const ROLES = [
  "Veterinarian",
  "Vet Technician",
  "Lead Groomer",
  "Groomer",
  "Assistant",
  "Receptionist",
  "Practice Manager",
];

const empty = { fullName: "", role: ROLES[0], email: "", password: "" };

// Create a staff login (via the create-staff Edge Function) with an admin-set
// initial password. The new user must change it on first sign-in.
function StaffModal({ open, onClose, actorName, staff }) {
  const editingId = staff?.id ?? null;
  const toast = useToast();
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setError("");
    setForm(
      staff
        ? { fullName: staff.full_name ?? "", role: staff.role ?? ROLES[0], email: staff.email ?? "", password: "" }
        : empty
    );
  }, [open, staff]);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.fullName.trim()) return setError("Please enter the staff member's name.");
    if (!form.email.trim()) return setError("Please enter an email address.");

    // Edit: update the directory record only (login/password live in Auth).
    if (editingId) {
      setSaving(true);
      const { error: err } = await supabase
        .from("staff")
        .update({ full_name: form.fullName.trim(), role: form.role, email: form.email.trim() })
        .eq("id", editingId);
      setSaving(false);
      if (err) return setError(err.message);
      await logActivity(`Updated Staff (${form.fullName.trim()})`, "update", actorName);
      toast("Staff updated");
      bumpData();
      onClose();
      return;
    }

    if (form.password.length < 6) return setError("Initial password must be at least 6 characters.");

    setSaving(true);
    const { data, error: fnError } = await supabase.functions.invoke("create-staff", {
      body: {
        fullName: form.fullName.trim(),
        role: form.role,
        email: form.email.trim(),
        password: form.password,
      },
    });
    setSaving(false);

    if (fnError) {
      // Function not deployed (or unreachable): fall back to a directory-only
      // record so adding staff still works. Login provisioning needs the
      // create-staff Edge Function deployed.
      const notDeployed =
        fnError.name === "FunctionsFetchError" ||
        /failed to send a request|failed to fetch/i.test(fnError.message ?? "");
      if (notDeployed) {
        const { error: insErr } = await supabase.from("staff").insert({
          full_name: form.fullName.trim(),
          role: form.role,
          email: form.email.trim(),
          avatar_url: `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(form.fullName.trim())}&backgroundColor=b6e3f4`,
          on_duty: true,
        });
        if (insErr) return setError(insErr.message);
        await logActivity(`Added Staff (${form.fullName.trim()})`, "create", actorName);
        toast("Staff added to directory (login setup not deployed)");
        bumpData();
        onClose();
        return;
      }

      let message = fnError.message;
      try {
        const body = await fnError.context?.json();
        if (body?.error) message = body.error;
      } catch {
        /* keep default message */
      }
      return setError(message);
    }
    if (data?.error) return setError(data.error);

    await logActivity(`Created Staff Account (${form.fullName.trim()})`, "create", actorName);
    toast("Staff account created");
    bumpData();
    onClose();
  }

  const field =
    "h-12 w-full rounded-2xl bg-input px-4 font-nunito text-sm text-ink placeholder:text-muted/60 outline-none focus:ring-2 focus:ring-brand/60";
  const selectField =
    "h-12 w-full rounded-2xl bg-input pl-4 pr-10 font-nunito text-sm text-ink outline-none focus:ring-2 focus:ring-brand/60";
  const label = "font-nunito font-bold text-xs tracking-[0.6px] text-ink";

  return (
    <Modal open={open} onClose={onClose} title={editingId ? "Edit Staff" : "Add New Staff"}>
      <p className="-mt-2 pb-4 font-nunito text-xs text-subtle">
        {editingId
          ? "Updates the staff directory record. Login email/password are managed in Supabase Auth."
          : "Creates a login with an initial password. The staff member will be asked to set their own password on first sign-in."}
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className={label}>Full Name</span>
            <input value={form.fullName} onChange={update("fullName")} placeholder="Dr. Sarah Jenkins" className={field} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={label}>Role</span>
            <select value={form.role} onChange={update("role")} className={selectField}>
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={label}>Email Address</span>
            <input type="email" value={form.email} onChange={update("email")} placeholder="sarah.j@kindredpaws.com" className={field} />
          </label>
          {!editingId && (
            <label className="flex flex-col gap-1.5">
              <span className={label}>Initial Password</span>
              <input
                type="password"
                value={form.password}
                onChange={update("password")}
                autoComplete="new-password"
                placeholder="At least 6 characters"
                className={field}
              />
            </label>
          )}
        </div>

        {error && <p className="font-nunito text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="rounded-full px-5 py-2.5 font-quicksand font-semibold text-sm text-subtle transition hover:bg-surface">
            Close
          </button>
          <button type="submit" disabled={saving} className="rounded-full bg-brand-dark px-6 py-2.5 font-quicksand font-semibold text-sm text-white shadow-md transition hover:brightness-110 disabled:opacity-70">
            {saving ? "Saving..." : editingId ? "Save Changes" : "Create Account"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

StaffModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  actorName: PropTypes.string,
  staff: PropTypes.object,
};

export default StaffModal;
