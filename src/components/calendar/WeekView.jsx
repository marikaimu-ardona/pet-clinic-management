import PropTypes from "prop-types";
import {
  weekDates,
  groupByDay,
  dayKey,
  layoutDay,
  timelineBounds,
  categoryStyle,
  typeWord,
  isToday,
  isSameDay,
} from "../../lib/calendar";
import { timeOfDay } from "../../lib/format";
import { COMPACT_ACCENTS } from "./accents";

const HOUR_HEIGHT = 56;
const DOW = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

// Seven day-columns sharing one time axis. Clicking a day header opens it.
function WeekView({ selectedDate, appointments, loading, onSelectDay }) {
  const days = weekDates(selectedDate);
  const grouped = groupByDay(appointments);
  const { startHour, endHour } = timelineBounds(appointments);
  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);
  const trackHeight = (endHour - startHour) * HOUR_HEIGHT;

  return (
    <div className="overflow-hidden rounded-[32px] border border-card-border bg-card shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
      {/* Day headers */}
      <div className="flex border-b border-muted/10">
        <div className="w-14 shrink-0" />
        {days.map((day, i) => {
          const active = isSameDay(day, selectedDate);
          return (
            <button
              key={day.toISOString()}
              onClick={() => onSelectDay(day)}
              className="flex flex-1 flex-col items-center gap-0.5 py-3 transition hover:bg-surface/60"
            >
              <span className="font-nunito font-extrabold text-[10px] uppercase text-subtle/60">
                {DOW[i]}
              </span>
              <span
                className={
                  active || isToday(day)
                    ? "flex size-7 items-center justify-center rounded-full bg-brand-dark font-quicksand font-semibold text-sm text-white"
                    : "flex size-7 items-center justify-center font-quicksand font-semibold text-sm text-ink"
                }
              >
                {day.getDate()}
              </span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <p className="p-8 font-nunito text-sm text-subtle">Loading schedule...</p>
      ) : (
        <div className="flex">
          {/* Time axis */}
          <div className="w-14 shrink-0">
            {hours.map((h) => (
              <div
                key={h}
                style={{ height: HOUR_HEIGHT }}
                className="border-b border-muted/10 pr-2 pt-1 text-right font-nunito font-bold text-[10px] text-subtle/60"
              >
                {String(h).padStart(2, "0")}:00
              </div>
            ))}
          </div>

          {/* Day columns */}
          <div className="flex flex-1">
            {days.map((day) => {
              const blocks = layoutDay(grouped[dayKey(day)] || []);
              return (
                <div
                  key={day.toISOString()}
                  className="relative flex-1 border-l border-muted/10"
                  style={{ height: trackHeight }}
                >
                  {hours.map((h, i) => (
                    <div
                      key={h}
                      style={{ top: i * HOUR_HEIGHT, height: HOUR_HEIGHT }}
                      className="absolute inset-x-0 border-b border-muted/10"
                    />
                  ))}
                  {blocks.map(({ appt, startMin, endMin, lane, lanes }) => {
                    const top = ((startMin - startHour * 60) / 60) * HOUR_HEIGHT;
                    const height = ((endMin - startMin) / 60) * HOUR_HEIGHT;
                    const widthPct = 100 / lanes;
                    const { accent } = categoryStyle(appt.category, appt.type);
                    return (
                      <button
                        key={appt.id}
                        onClick={() => onSelectDay(day)}
                        title={`${appt.pets?.name ?? ""} · ${timeOfDay(appt.scheduled_at)}`}
                        style={{
                          top: top + 2,
                          height: height - 4,
                          left: `calc(${lane * widthPct}% + 2px)`,
                          width: `calc(${widthPct}% - 4px)`,
                        }}
                        className={`absolute overflow-hidden rounded-r-lg border-l-2 px-1.5 py-1 text-left ${COMPACT_ACCENTS[accent]}`}
                      >
                        <p className="truncate font-nunito font-bold text-[10px] leading-tight">
                          {timeOfDay(appt.scheduled_at)}
                        </p>
                        <p className="truncate font-nunito text-[10px] leading-tight">
                          {appt.pets?.name
                            ? `${appt.pets.name}'s ${typeWord(appt.type)}`
                            : appt.title}
                        </p>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

WeekView.propTypes = {
  selectedDate: PropTypes.instanceOf(Date).isRequired,
  appointments: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  onSelectDay: PropTypes.func.isRequired,
};

export default WeekView;
