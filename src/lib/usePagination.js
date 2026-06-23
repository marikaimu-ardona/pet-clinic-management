import { useEffect, useState } from "react";

// Client-side pagination over an array. Returns the current page's slice plus
// controls. Resets to page 1 when the list shrinks below the current page.
export function usePagination(items, pageSize = 8) {
  const [page, setPage] = useState(1);
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  const startIndex = (page - 1) * pageSize;
  const pageItems = items.slice(startIndex, startIndex + pageSize);

  return { page, setPage, totalPages, total, pageItems, startIndex, pageSize };
}
