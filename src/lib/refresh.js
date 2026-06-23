import { useEffect, useState } from "react";

// A tiny global "data changed" signal. After a write (create/edit/delete),
// call bumpData() and every hook using useDataVersion() in its effect deps
// will refetch. Keeps pages in sync without a full state-management library.

let version = 0;
const listeners = new Set();

export function bumpData() {
  version += 1;
  listeners.forEach((notify) => notify(version));
}

export function useDataVersion() {
  const [value, setValue] = useState(version);
  useEffect(() => {
    const notify = (v) => setValue(v);
    listeners.add(notify);
    return () => listeners.delete(notify);
  }, []);
  return value;
}
