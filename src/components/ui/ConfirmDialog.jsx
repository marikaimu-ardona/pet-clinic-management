import { useEffect } from "react";
import PropTypes from "prop-types";
import { AlertTriangle } from "lucide-react";

// A small confirmation alert shown above other modals. Use for actions that
// need an explicit yes/no (create, save, delete).
function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "primary",
  loading = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onCancel();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  const confirmClass =
    variant === "danger"
      ? "bg-accent-rust text-white hover:brightness-110"
      : "bg-brand-dark text-white hover:brightness-110";
  const iconClass =
    variant === "danger" ? "bg-cta/20 text-accent-rust" : "bg-brand/15 text-brand-dark";

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/40 p-4"
      onMouseDown={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        className="w-full max-w-sm rounded-[24px] bg-card p-6 shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <span className={`flex size-10 shrink-0 items-center justify-center rounded-full ${iconClass}`}>
            <AlertTriangle className="size-5" strokeWidth={2} />
          </span>
          <div>
            <h3 className="font-quicksand font-bold text-lg text-ink">{title}</h3>
            <p className="mt-1 font-nunito text-sm text-subtle">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="rounded-full px-5 py-2.5 font-quicksand font-semibold text-sm text-subtle transition hover:bg-surface disabled:opacity-70"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-full px-6 py-2.5 font-quicksand font-semibold text-sm shadow-md transition disabled:opacity-70 ${confirmClass}`}
          >
            {loading ? "Working..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

ConfirmDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string,
  confirmLabel: PropTypes.string,
  cancelLabel: PropTypes.string,
  variant: PropTypes.oneOf(["primary", "danger"]),
  loading: PropTypes.bool,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default ConfirmDialog;
