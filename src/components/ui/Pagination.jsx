import PropTypes from "prop-types";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Footer control: "Showing X-Y of N" + Prev / Next. Pair with usePagination.
function Pagination({ page, setPage, totalPages, total, startIndex, pageSize }) {
  if (total === 0) return null;
  const from = startIndex + 1;
  const to = Math.min(startIndex + pageSize, total);

  return (
    <div className="flex items-center justify-between gap-4 px-6 py-4">
      <span className="font-nunito text-xs text-subtle">
        Showing {from}-{to} of {total}
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
          className="flex items-center gap-1 rounded-full border border-muted/30 px-3 py-1.5 font-nunito font-bold text-xs text-subtle transition hover:bg-surface disabled:opacity-40"
        >
          <ChevronLeft className="size-3.5" strokeWidth={2.5} />
          Prev
        </button>
        <span className="font-nunito font-bold text-xs text-ink">
          {page} / {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
          className="flex items-center gap-1 rounded-full border border-muted/30 px-3 py-1.5 font-nunito font-bold text-xs text-subtle transition hover:bg-surface disabled:opacity-40"
        >
          Next
          <ChevronRight className="size-3.5" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

Pagination.propTypes = {
  page: PropTypes.number.isRequired,
  setPage: PropTypes.func.isRequired,
  totalPages: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  startIndex: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
};

export default Pagination;
