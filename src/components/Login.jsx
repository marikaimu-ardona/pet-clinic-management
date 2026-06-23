import { useState } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import pawIcon from "../assets/paw.svg";

// Login screen for the Kindred Paws clinic management app.
// Markup and styling mirror the Figma design "Clinic Log In - Desktop".
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState("signin"); // "signin" | "reset"

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!isSupabaseConfigured) {
      setError("Supabase is not configured. Add credentials to .env to enable sign in.");
      return;
    }

    setSubmitting(true);

    if (mode === "reset") {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      setSubmitting(false);
      if (resetError) setError(resetError.message);
      else setNotice("If an account exists for that email, a password reset link is on its way.");
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setSubmitting(false);

    if (signInError) {
      setError(signInError.message);
    }
  }

  function switchMode() {
    setMode((m) => (m === "reset" ? "signin" : "reset"));
    setError("");
    setNotice("");
  }

  return (
    <div className="min-h-screen w-full bg-page flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-[1200px] min-h-[640px] md:h-[800px] bg-card border border-card-border rounded-[32px] md:rounded-[48px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] overflow-hidden flex items-center justify-center px-6 py-12 sm:px-12 md:px-24 md:py-12">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-[448px] flex flex-col gap-10"
        >
          {/* Brand anchor */}
          <div className="flex flex-col items-center">
            <div className="size-16 rounded-[32px] bg-brand flex items-center justify-center drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
              <img src={pawIcon} alt="" className="w-[30px] h-[28.5px]" />
            </div>
            <h1 className="mt-3 font-quicksand font-bold text-2xl leading-8 tracking-[-0.6px] text-brand-dark">
              Kindred Paws
            </h1>
            <p className="mt-1 font-nunito font-bold text-xs leading-4 tracking-[1.2px] uppercase text-muted">
              Clinic Management
            </p>
          </div>

          {/* Login fields */}
          <div className="flex flex-col gap-6 pb-6">
            {/* Email */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="email"
                className="font-nunito font-bold text-xs leading-4 tracking-[0.6px] text-ink"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@clinic.com"
                className="h-12 w-full rounded-full bg-input px-6 font-nunito text-base text-ink placeholder:text-muted/50 outline-none focus:ring-2 focus:ring-brand/60"
              />
            </div>

            {/* Password (sign-in only) */}
            {mode === "signin" && (
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="password"
                  className="px-2 font-nunito font-bold text-xs leading-4 tracking-[0.6px] text-ink"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-12 w-full rounded-full bg-input pl-6 pr-12 font-nunito text-base text-ink placeholder:text-muted/50 outline-none focus:ring-2 focus:ring-brand/60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>
            )}

            {mode === "reset" && (
              <p className="font-nunito text-sm text-subtle">
                Enter your email and we will send you a link to set a new password.
              </p>
            )}

            {error && (
              <p className="font-nunito text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
            {notice && (
              <p className="font-nunito text-sm text-brand-dark" role="status">
                {notice}
              </p>
            )}

            {/* CTA */}
            <button
              type="submit"
              disabled={submitting}
              className="h-14 w-full rounded-full bg-cta font-quicksand font-semibold text-lg leading-6 text-cta-text shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] transition hover:brightness-105 active:brightness-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {submitting
                ? mode === "reset"
                  ? "SENDING..."
                  : "SIGNING IN..."
                : mode === "reset"
                  ? "SEND RESET LINK"
                  : "LOG IN"}
            </button>

            <button
              type="button"
              onClick={switchMode}
              className="font-nunito text-sm text-brand-dark hover:underline"
            >
              {mode === "reset" ? "Back to sign in" : "Forgot password?"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c6.5 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.5 13.5 0 0 0 2 12s3.5 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}

export default Login;
