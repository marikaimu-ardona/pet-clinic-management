import PropTypes from "prop-types";
import {
  monthGridDates,
  groupByDay,
  dayKey,
  categoryStyle,
  typeWord,
  isToday,
} from "../../lib/calendar";
import { timeOfDay } from "../../lib/format";
import { CHIP_ACCENTS } from "./accents";

const DOW = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const MAX_CHIPS = 3;

// Month calendar grid. Each cell lists that day's appointments; clicking a cell
// opens the Day view for that date.
function MonthView({ selectedDate, appointments, loading, onSelectDay }) {
  const cells = monthGridDates(selectedDate);
  const grouped = groupByDay(appointments);
  const month = selectedDate.getMonth();

  return (
    <div className="overflow-hidden rounded-[32px] border border-card-border bg-card shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
      {/* Weekday header */}
      <div className="grid grid-cols-7 border-b border-muted/10 bg-surface/40">
        {DOW.map((d) => (
          <div
            key={d}
            className="py-2 text-center font-nunito font-extrabold text-[10px] uppercase tracking-wide text-subtle/60"
          >
            {d}
          </div>
        ))}
      </div>

      {loading ? (
        <p className="p-8 font-nunito text-sm text-subtle">Loading...</p>
      ) : (
        <div className="grid grid-cols-7">
          {cells.map((cell) => {
            const inMonth = cell.getMonth() === month;
            const items = (grouped[dayKey(cell)] || []).sort(
              (a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at)
            );
            return (
              <button
                key={cell.toISOString()}
                onClick={() => onSelectDay(cell)}
                className={`flex min-h-[7rem] flex-col gap-1 border-b border-r border-muted/10 p-2 text-left transition hover:bg-surface/40 ${
                  inMonth ? "bg-card" : "bg-surface/20"
                }`}
              >
                <span
                  className={
                    isToday(cell)
                      ? "flex size-6 items-center justify-center self-end rounded-full bg-brand-dark font-quicksand font-semibold text-xs text-white"
                      : `self-end font-quicksand font-semibold text-xs ${inMonth ? "text-ink" : "text-subtle/40"}`
                  }
                >
                  {cell.getDate()}
                </span>
                {items.slice(0, MAX_CHIPS).map((appt) => {
                  const { accent } = categoryStyle(appt.category, appt.type);
                  return (
                    <span
                      key={appt.id}
                      className={`truncate rounded-md px-1.5 py-0.5 font-nunito font-bold text-[10px] ${CHIP_ACCENTS[accent]}`}
                    >
                      {timeOfDay(appt.scheduled_at)}{" "}
                      {appt.pets?.name ? `${appt.pets.name}'s ${typeWord(appt.type)}` : appt.title}
                    </span>
                  );
                })}
                {items.length > MAX_CHIPS && (
                  <span className="px-1.5 font-nunito font-bold text-[10px] text-subtle">
                    +{items.length - MAX_CHIPS} more
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

MonthView.propTypes = {
  selectedDate: PropTypes.instanceOf(Date).isRequired,
  appointments: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  onSelectDay: PropTypes.func.isRequired,
};

export default MonthView;
