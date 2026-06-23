import PropTypes from "prop-types";
import { weekDates, isSameDay, isToday } from "../../lib/calendar";

const DOW = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

// Seven-day strip for the week containing `selectedDate`. Weekends are dimmed.
function WeekStrip({ selectedDate, onSelectDay }) {
  const days = weekDates(selectedDate);

  return (
    <div className="flex justify-between gap-2 rounded-[32px] border border-card-border/30 bg-card p-3">
      {days.map((day, i) => {
        const active = isSameDay(day, selectedDate);
        const weekend = i >= 5;
        return (
          <button
            key={day.toISOString()}
            onClick={() => onSelectDay(day)}
            className="flex flex-1 flex-col items-center gap-1 py-1"
          >
            <span
              className={`font-nunito font-extrabold text-[10px] uppercase ${weekend ? "text-subtle/40" : "text-subtle/70"}`}
            >
              {DOW[i]}
            </span>
            <span
              className={
                active
                  ? "flex size-9 items-center justify-center rounded-full bg-brand-dark font-quicksand font-bold text-base text-white"
                  : `flex size-9 items-center justify-center rounded-full font-quicksand font-semibold text-base ${
                      isToday(day) ? "text-brand-dark" : weekend ? "text-subtle/40" : "text-ink"
                    }`
              }
            >
              {day.getDate()}
            </span>
          </button>
        );
      })}
    </div>
  );
}

WeekStrip.propTypes = {
  selectedDate: PropTypes.instanceOf(Date).isRequired,
  onSelectDay: PropTypes.func.isRequired,
};

export default WeekStrip;
