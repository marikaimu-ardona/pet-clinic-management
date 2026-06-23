import { useCallback, useState } from "react";
import PropTypes from "prop-types";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { ToastContext } from "../../lib/toast";

let nextId = 0;

// Renders transient toasts (bottom-right) and exposes toast() via context.
function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const toast = useCallback(
    (message, type = "success") => {
      const id = ++nextId;
      setToasts((t) => [...t, { id, message, type }]);
      setTimeout(() => dismiss(id), 3500);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed top-6 right-6 z-[80] flex flex-col gap-3">
        {toasts.map((t) => {
          const Icon = t.type === "error" ? AlertCircle : CheckCircle2;
          const bg = t.type === "error" ? "bg-red-600" : "bg-brand-dark";
          return (
            <div
              key={t.id}
              role="status"
              className={`toast-enter flex min-w-[280px] items-center gap-3 rounded-2xl ${bg} px-5 py-4 text-white shadow-2xl ring-1 ring-black/5`}
            >
              <Icon className="size-6 shrink-0" strokeWidth={2.5} />
              <span className="flex-1 font-nunito font-semibold text-sm">{t.message}</span>
              <button
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss"
                className="rounded-full p-1 text-white/80 transition hover:bg-white/20 hover:text-white"
              >
                <X className="size-4" strokeWidth={2.5} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

ToastProvider.propTypes = {
  children: PropTypes.node,
};

export default ToastProvider;
