import PropTypes from "prop-types";

// "Today's Load": daily progress bar + completed / pending tallies.
function TodaysLoadCard({ load }) {
  const { total, completed, pending } = load;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="rounded-[32px] border border-card-border/30 bg-card p-6 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
      <h2 className="font-quicksand font-bold text-lg text-ink">Today&apos;s Load</h2>

      <div className="mt-4 flex items-center justify-between">
        <span className="font-nunito text-sm text-subtle">Daily Progress</span>
        <span className="font-quicksand font-bold text-lg text-ink">
          {completed} / {total}
        </span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-input">
        <div className="h-full rounded-full bg-brand-dark transition-all" style={{ width: `${pct}%` }} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-3xl bg-brand/10 p-3">
          <p className="font-nunito font-bold text-xs text-brand-dark">Completed</p>
          <p className="font-quicksand font-bold text-2xl text-brand-dark">{completed}</p>
        </div>
        <div className="rounded-3xl bg-cta/15 p-3">
          <p className="font-nunito font-bold text-xs text-accent-rust">Pending</p>
          <p className="font-quicksand font-bold text-2xl text-accent-rust">{pending}</p>
        </div>
      </div>
    </div>
  );
}

TodaysLoadCard.propTypes = {
  load: PropTypes.shape({
    total: PropTypes.number,
    completed: PropTypes.number,
    pending: PropTypes.number,
  }).isRequired,
};

export default TodaysLoadCard;
