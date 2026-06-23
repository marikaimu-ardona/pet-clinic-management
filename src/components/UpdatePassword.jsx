import { useState } from "react";
import PropTypes from "prop-types";
import { supabase } from "../lib/supabase";
import pawIcon from "../assets/paw.svg";

// Shown when a user arrives via a password-reset email. They set a new
// password, after which they're signed in.
function UpdatePassword({ onDone }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (password !== confirm) return setError("Passwords do not match.");

    setSaving(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (err) return setError(err.message);
    onDone?.();
  }

  const fieldClass =
    "h-12 w-full rounded-full bg-input px-6 font-nunito text-base text-ink placeholder:text-muted/50 outline-none focus:ring-2 focus:ring-brand/60";

  return (
    <div className="min-h-screen w-full bg-page flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md rounded-[32px] border border-card-border bg-card p-8 shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1)]">
        <div className="flex flex-col items-center pb-8">
          <div className="size-16 rounded-[32px] bg-brand flex items-center justify-center">
            <img src={pawIcon} alt="" className="w-[30px] h-[28.5px]" />
          </div>
          <h1 className="mt-3 font-quicksand font-bold text-2xl tracking-[-0.6px] text-brand-dark">
            Set a new password
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            className={fieldClass}
          />
          <input
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm new password"
            className={fieldClass}
          />
          {error && <p className="font-nunito text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="h-14 w-full rounded-full bg-cta font-quicksand font-semibold text-lg text-cta-text shadow-md transition hover:brightness-105 disabled:opacity-70"
          >
            {saving ? "SAVING..." : "SAVE PASSWORD"}
          </button>
        </form>
      </div>
    </div>
  );
}

UpdatePassword.propTypes = {
  onDone: PropTypes.func,
};

export default UpdatePassword;
