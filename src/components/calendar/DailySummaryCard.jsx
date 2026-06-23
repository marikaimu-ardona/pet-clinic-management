import PropTypes from "prop-types";
import { BarChart3 } from "lucide-react";

// Floating glass card summarising the selected range's appointments.
function DailySummaryCard({ summary, title = "Daily Summary" }) {
  const { total, completed, pending } = summary;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="w-80 rounded-[48px] border border-white/40 bg-surface/80 p-6 shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)] backdrop-blur-md">
      <div className="flex items-center gap-2">
        <BarChart3 className="size-[18px] text-brand-dark" strokeWidth={2.5} />
        <h2 className="font-quicksand font-semibold text-lg text-ink">{title}</h2>
      </div>

      <div className="mt-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="font-nunito text-sm text-ink">Total Appointments</span>
          <span className="font-nunito font-bold text-base text-brand-dark">{total}</span>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-[#d5ecf8]">
          <div className="h-full rounded-full bg-brand-dark transition-all" style={{ width: `${pct}%` }} />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="rounded-[32px] border border-muted/20 bg-card p-3 text-center">
            <p className="font-nunito font-extrabold text-[10px] uppercase text-ink/60">Completed</p>
            <p className="font-nunito font-bold text-lg text-brand-dark">{completed}</p>
          </div>
          <div className="rounded-[32px] border border-muted/20 bg-card p-3 text-center">
            <p className="font-nunito font-extrabold text-[10px] uppercase text-ink/60">Pending</p>
            <p className="font-nunito font-bold text-lg text-accent-rust">{pending}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

DailySummaryCard.propTypes = {
  summary: PropTypes.shape({
    total: PropTypes.number,
    completed: PropTypes.number,
    pending: PropTypes.number,
  }).isRequired,
  title: PropTypes.string,
};

export default DailySummaryCard;
