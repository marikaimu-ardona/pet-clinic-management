import PropTypes from "prop-types";
import { layoutDay, timelineBounds } from "../../lib/calendar";
import AppointmentBlock from "./AppointmentBlock";

const HOUR_HEIGHT = 120; // px per hour
const GUTTER = 8; // px gap between side-by-side (overlapping) blocks

function label(hour) {
  return `${String(hour).padStart(2, "0")}:00`;
}

// Day view: a fixed time column plus an absolutely-positioned appointment layer.
function DayTimeline({ appointments, loading, onEdit }) {
  const { startHour, endHour } = timelineBounds(appointments);
  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);
  const trackHeight = (endHour - startHour) * HOUR_HEIGHT;
  const blocks = layoutDay(appointments);

  return (
    <div className="overflow-hidden rounded-[32px] border border-card-border bg-card shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
      {loading ? (
        <p className="p-8 font-nunito text-sm text-subtle">Loading schedule...</p>
      ) : appointments.length === 0 ? (
        <p className="p-8 font-nunito text-sm text-subtle">
          No appointments scheduled for this day.
        </p>
      ) : (
        <div className="flex">
          {/* Time column */}
          <div className="w-20 shrink-0 bg-surface/30">
            {hours.map((h) => (
              <div
                key={h}
                style={{ height: HOUR_HEIGHT }}
                className="flex justify-end border-b border-muted/10 px-4 pt-4"
              >
                <span className="font-nunito font-bold text-xs tracking-[0.6px] text-subtle/60">
                  {label(h)}
                </span>
              </div>
            ))}
          </div>

          {/* Appointment layer */}
          <div className="relative flex-1 border-l border-muted/10" style={{ height: trackHeight }}>
            {/* Hour gridlines */}
            {hours.map((h, i) => (
              <div
                key={h}
                style={{ top: i * HOUR_HEIGHT, height: HOUR_HEIGHT }}
                className="absolute inset-x-0 border-b border-muted/10"
              />
            ))}

            {/* Blocks */}
            {blocks.map(({ appt, startMin, endMin, lane, lanes }) => {
              const top = ((startMin - startHour * 60) / 60) * HOUR_HEIGHT;
              const height = ((endMin - startMin) / 60) * HOUR_HEIGHT;
              const widthPct = 100 / lanes;
              const style = {
                top: top + 4,
                height: height - 8,
                left: `calc(${lane * widthPct}% + 16px)`,
                width: `calc(${widthPct}% - ${16 + GUTTER}px)`,
              };
              return <AppointmentBlock key={appt.id} appt={appt} style={style} onEdit={onEdit} />;
            })}
          </div>
        </div>
      )}
    </div>
  );
}

DayTimeline.propTypes = {
  appointments: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  onEdit: PropTypes.func,
};

export default DayTimeline;
