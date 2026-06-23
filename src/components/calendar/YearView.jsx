import PropTypes from "prop-types";
import {
  yearMonths,
  monthGridDates,
  groupByDay,
  dayKey,
  isToday,
} from "../../lib/calendar";

const DOW = ["M", "T", "W", "T", "F", "S", "S"];

// Twelve mini-months. Days with appointments are filled (darker = busier).
// Clicking a month opens Month view; clicking a day opens Day view.
function MiniMonth({ monthDate, grouped, onSelectDay, onSelectMonth }) {
  const cells = monthGridDates(monthDate);
  const month = monthDate.getMonth();

  return (
    <div className="rounded-3xl border border-card-border/40 bg-card p-4">
      <button
        onClick={() => onSelectMonth(monthDate)}
        className="mb-2 font-quicksand font-semibold text-sm text-brand-dark hover:underline"
      >
        {monthDate.toLocaleDateString(undefined, { month: "long" })}
      </button>
      <div className="grid grid-cols-7 gap-0.5">
        {DOW.map((d, i) => (
          <span
            key={i}
            className="text-center font-nunito font-extrabold text-[9px] text-subtle/50"
          >
            {d}
          </span>
        ))}
        {cells.map((cell) => {
          const inMonth = cell.getMonth() === month;
          const count = inMonth ? (grouped[dayKey(cell)] || []).length : 0;
          let cls = "text-subtle/40";
          if (inMonth) cls = "text-ink";
          if (count > 0)
            cls =
              count >= 3
                ? "bg-brand-dark text-white"
                : "bg-brand/30 text-brand-dark";
          return (
            <button
              key={cell.toISOString()}
              onClick={() => inMonth && onSelectDay(cell)}
              disabled={!inMonth}
              className={`flex aspect-square items-center justify-center rounded-full font-nunito text-[10px] ${cls} ${
                isToday(cell) && inMonth ? "ring-1 ring-accent-rust" : ""
              }`}
            >
              {cell.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

MiniMonth.propTypes = {
  monthDate: PropTypes.instanceOf(Date).isRequired,
  grouped: PropTypes.object.isRequired,
  onSelectDay: PropTypes.func.isRequired,
  onSelectMonth: PropTypes.func.isRequired,
};

function YearView({ selectedDate, appointments, loading, onSelectDay, onSelectMonth }) {
  const months = yearMonths(selectedDate);
  const grouped = groupByDay(appointments);

  if (loading) {
    return (
      <div className="rounded-[32px] border border-card-border bg-card p-8">
        <p className="font-nunito text-sm text-subtle">Loading...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {months.map((m) => (
        <MiniMonth
          key={m.toISOString()}
          monthDate={m}
          grouped={grouped}
          onSelectDay={onSelectDay}
          onSelectMonth={onSelectMonth}
        />
      ))}
    </div>
  );
}

YearView.propTypes = {
  selectedDate: PropTypes.instanceOf(Date).isRequired,
  appointments: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  onSelectDay: PropTypes.func.isRequired,
  onSelectMonth: PropTypes.func.isRequired,
};

export default YearView;
