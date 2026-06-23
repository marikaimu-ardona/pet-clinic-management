import PropTypes from "prop-types";
import { MoreVertical, User } from "lucide-react";
import Avatar from "../dashboard/Avatar";
import { timeOfDay } from "../../lib/format";
import { weekDates, groupByDay, dayKey, isToday, isPastDay } from "../../lib/calendar";
import { shortName, staffAccent, ROW_ACCENTS } from "./groomingStaff";

const DOW = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function CompactRow({ appt, onEdit }) {
  const groomer = appt.staff;
  const accent = ROW_ACCENTS[staffAccent(groomer?.role)] ?? ROW_ACCENTS.gold;
  const past = isPastDay(appt.scheduled_at);
  return (
    <div className={`flex items-center gap-3 rounded-2xl border-l-4 ${accent.border} ${accent.row} px-3 py-2 ${past ? "opacity-50" : ""}`}>
      <span className="w-16 shrink-0 font-nunito font-bold text-xs text-subtle">
        {timeOfDay(appt.scheduled_at)}
      </span>
      <Avatar
        name={appt.pets?.name}
        src={appt.pets?.photo_url}
        className="size-8 shrink-0 rounded-full border-2 border-white bg-input"
        textClassName="text-[10px]"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate font-quicksand font-bold text-sm text-ink">{appt.pets?.name}</p>
        <p className="truncate font-nunito text-xs text-subtle">{appt.service || "Grooming"}</p>
      </div>
      {groomer && (
        <span className={`hidden shrink-0 items-center gap-1 rounded-full px-2.5 py-1 font-nunito font-bold text-[11px] sm:flex ${accent.chip}`}>
          <User className="size-3" strokeWidth={2.5} />
          {shortName(groomer.full_name)}
        </span>
      )}
      {!past && (
        <button
          onClick={() => onEdit?.(appt)}
          aria-label="Edit appointment"
          className="shrink-0 rounded-full p-1 text-subtle hover:bg-white/60"
        >
          <MoreVertical className="size-4" strokeWidth={2} />
        </button>
      )}
    </div>
  );
}
CompactRow.propTypes = { appt: PropTypes.object.isRequired, onEdit: PropTypes.func };

// Week view: one section per day (Mon-Sun) with that day's grooming rows.
function GroomingWeek({ selectedDate, appointments, loading, onSelectDay, onEdit }) {
  const days = weekDates(selectedDate);
  const grouped = groupByDay(appointments);

  if (loading) {
    return (
      <div className="rounded-[32px] border border-card-border/30 bg-card p-6">
        <p className="font-nunito text-sm text-subtle">Loading week...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {days.map((day, i) => {
        const items = grouped[dayKey(day)] || [];
        return (
          <div key={day.toISOString()} className="rounded-[28px] border border-card-border/30 bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <button
                onClick={() => onSelectDay(day)}
                className="flex items-baseline gap-2 hover:underline"
              >
                <span className={`font-quicksand font-bold text-base ${isToday(day) ? "text-brand-dark" : "text-ink"}`}>
                  {DOW[i]}
                </span>
                <span className="font-nunito text-xs text-subtle">
                  {day.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </span>
              </button>
              <span className="font-nunito font-bold text-xs text-subtle">
                {items.length} {items.length === 1 ? "booking" : "bookings"}
              </span>
            </div>
            {items.length === 0 ? (
              <p className="font-nunito text-sm text-subtle/70">No grooming booked.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {items.map((a) => (
                  <CompactRow key={a.id} appt={a} onEdit={onEdit} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

GroomingWeek.propTypes = {
  selectedDate: PropTypes.instanceOf(Date).isRequired,
  appointments: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  onSelectDay: PropTypes.func.isRequired,
  onEdit: PropTypes.func,
};

export default GroomingWeek;
