import { createContext, useContext } from "react";

// Context holds the `toast(message, type)` function provided by ToastProvider.
export const ToastContext = createContext(() => {});

export function useToast() {
  return useContext(ToastContext);
}
