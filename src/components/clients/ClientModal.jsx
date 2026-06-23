import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { supabase } from "../../lib/supabase";
import { bumpData } from "../../lib/refresh";
import { logActivity } from "../../lib/audit";
import { useToast } from "../../lib/toast";
import Modal from "../ui/Modal";

const empty = { full_name: "", email: "", phone: "", location: "" };

function avatarFor(name) {
  const seed = encodeURIComponent(name.trim());
  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4`;
}

// Create or edit a client (owner). Pass `client` to edit; omit to create.
// On create, calls onCreated(newId) so the page can select the new client.
function ClientModal({ open, onClose, client, onCreated, actorName }) {
  const editingId = client?.id ?? null;
  const toast = useToast();
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setError("");
    setForm(
      client
        ? {
            full_name: client.full_name ?? "",
            email: client.email ?? "",
            phone: client.phone ?? "",
            location: client.location ?? "",
          }
        : empty
    );
  }, [open, client]);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.full_name.trim()) return setError("Please enter the client's name.");

    const row = {
      full_name: form.full_name.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      location: form.location.trim() || null,
      avatar_url: avatarFor(form.full_name),
    };

    setSaving(true);
    if (editingId) {
      const { error: err } = await supabase.from("owners").update(row).eq("id", editingId);
      if (err) return finish(err.message);
      await logActivity(`Updated Client (${row.full_name})`, "update", actorName);
    } else {
      const { data, error: err } = await supabase.from("owners").insert(row).select("id").single();
      if (err) return finish(err.message);
      await logActivity(`Added New Client (${row.full_name})`, "create", actorName);
      onCreated?.(data.id);
    }
    setSaving(false);
    toast(editingId ? "Client updated" : "Client added");
    bumpData();
    onClose();
  }

  function finish(message) {
    setSaving(false);
    setError(message);
  }

  const field =
    "h-11 w-full rounded-2xl bg-input px-4 font-nunito text-sm text-ink outline-none focus:ring-2 focus:ring-brand/60";
  const label = "font-nunito font-bold text-xs tracking-[0.6px] text-ink";

  return (
    <Modal open={open} onClose={onClose} title={editingId ? "Edit Client" : "New Client"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className={label}>Full Name</span>
          <input value={form.full_name} onChange={update("full_name")} placeholder="Alex Rivera" className={field} />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5">
            <span className={label}>Phone</span>
            <input value={form.phone} onChange={update("phone")} placeholder="(555) 012-3456" className={field} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={label}>Location</span>
            <input value={form.location} onChange={update("location")} placeholder="Downtown Brooklyn" className={field} />
          </label>
        </div>
        <label className="flex flex-col gap-1.5">
          <span className={label}>Email</span>
          <input type="email" value={form.email} onChange={update("email")} placeholder="alex.r@example.com" className={field} />
        </label>

        {error && <p className="font-nunito text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="rounded-full px-5 py-2.5 font-quicksand font-semibold text-sm text-subtle transition hover:bg-surface">
            Close
          </button>
          <button type="submit" disabled={saving} className="rounded-full bg-brand-dark px-6 py-2.5 font-quicksand font-semibold text-sm text-white shadow-md transition hover:brightness-110 disabled:opacity-70">
            {saving ? "Saving..." : editingId ? "Save Changes" : "Create Client"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

ClientModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  client: PropTypes.object,
  onCreated: PropTypes.func,
  actorName: PropTypes.string,
};

export default ClientModal;
