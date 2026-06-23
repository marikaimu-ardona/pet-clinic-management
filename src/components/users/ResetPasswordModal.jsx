import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { supabase } from "../../lib/supabase";
import { logActivity } from "../../lib/audit";
import { useToast } from "../../lib/toast";
import Modal from "../ui/Modal";

// Admin sets a temporary password for a staff member; they must change it on
// their next sign-in.
function ResetPasswordModal({ open, onClose, member, actorName }) {
  const toast = useToast();
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setPassword("");
    setError("");
  }, [open]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (password.length < 6) return setError("Password must be at least 6 characters.");

    setSaving(true);
    const { data, error: fnError } = await supabase.functions.invoke("reset-staff-password", {
      body: { userId: member?.user_id, password },
    });
    setSaving(false);

    if (fnError) {
      let message = fnError.message;
      try {
        const body = await fnError.context?.json();
        if (body?.error) message = body.error;
      } catch {
        /* keep default */
      }
      return setError(message);
    }
    if (data?.error) return setError(data.error);

    await logActivity(`Reset Password (${member?.full_name ?? ""})`, "password", actorName);
    toast("Password reset");
    onClose();
  }

  const field =
    "h-12 w-full rounded-2xl bg-input px-4 font-nunito text-sm text-ink placeholder:text-muted/60 outline-none focus:ring-2 focus:ring-brand/60";

  return (
    <Modal open={open} onClose={onClose} title={`Reset Password${member ? ` — ${member.full_name}` : ""}`}>
      <p className="-mt-2 pb-4 font-nunito text-xs text-subtle">
        Sets a temporary password. {member?.full_name?.split(" ")[0] || "The staff member"} will be
        asked to set their own password on next sign-in.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="font-nunito font-bold text-xs tracking-[0.6px] text-ink">Temporary Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            placeholder="At least 6 characters"
            className={field}
          />
        </label>

        {error && <p className="font-nunito text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="rounded-full px-5 py-2.5 font-quicksand font-semibold text-sm text-subtle transition hover:bg-surface">
            Close
          </button>
          <button type="submit" disabled={saving} className="rounded-full bg-brand-dark px-6 py-2.5 font-quicksand font-semibold text-sm text-white shadow-md transition hover:brightness-110 disabled:opacity-70">
            {saving ? "Resetting..." : "Reset Password"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

ResetPasswordModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  member: PropTypes.object,
  actorName: PropTypes.string,
};

export default ResetPasswordModal;
