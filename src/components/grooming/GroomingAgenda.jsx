import PropTypes from "prop-types";
import { MoreVertical, User, Plus, Coffee } from "lucide-react";
import Avatar from "../dashboard/Avatar";
import { timeOfDay } from "../../lib/format";
import { isPastDay } from "../../lib/calendar";
import { shortName, staffAccent, ROW_ACCENTS } from "./groomingStaff";

function AppointmentRow({ appt, onEdit }) {
  const pet = appt.pets;
  const groomer = appt.staff;
  const accent = ROW_ACCENTS[staffAccent(groomer?.role)] ?? ROW_ACCENTS.gold;
  const past = isPastDay(appt.scheduled_at);

  return (
    <div className="flex items-stretch gap-4">
      {/* Time + dot */}
      <div className="flex w-20 shrink-0 items-start justify-end gap-2 pt-4">
        <span className="font-nunito font-bold text-xs text-subtle">
          {timeOfDay(appt.scheduled_at)}
        </span>
        <span className={`mt-1 size-2 shrink-0 rounded-full ${accent.dot}`} />
      </div>

      {/* Card */}
      <div className={`flex flex-1 items-center gap-4 rounded-3xl border-l-4 ${accent.border} ${accent.row} p-3 ${past ? "opacity-50" : ""}`}>
        <Avatar
          name={pet?.name}
          src={pet?.photo_url}
          className="size-12 shrink-0 rounded-full border-2 border-white bg-input"
          textClassName="text-sm"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-quicksand font-bold text-base text-ink">
            {pet?.name ?? "Unknown pet"}
          </p>
          <p className="truncate font-nunito text-sm text-subtle">
            {[appt.service || appt.title, pet?.breed].filter(Boolean).join(" • ")}
          </p>
        </div>
        {groomer && (
          <span className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 font-nunito font-bold text-xs ${accent.chip}`}>
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
    </div>
  );
}

AppointmentRow.propTypes = { appt: PropTypes.object.isRequired, onEdit: PropTypes.func };

// Day agenda: morning appointments, a lunch divider, afternoon appointments,
// and an available-slot call to action.
function GroomingAgenda({ appointments, loading, onEdit, onNew }) {
  const noon = (a) => new Date(a.scheduled_at).getHours() >= 12;
  const morning = appointments.filter((a) => !noon(a));
  const afternoon = appointments.filter(noon);

  return (
    <div className="rounded-[32px] border border-card-border/30 bg-card p-6 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
      {loading ? (
        <p className="font-nunito text-sm text-subtle">Loading schedule...</p>
      ) : appointments.length === 0 ? (
        <p className="py-6 text-center font-nunito text-sm text-subtle">
          No grooming appointments for this day.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {morning.map((a) => (
            <AppointmentRow key={a.id} appt={a} onEdit={onEdit} />
          ))}

          {/* Lunch break */}
          <div className="flex items-center gap-4">
            <span className="w-20 shrink-0 text-right font-nunito font-bold text-xs text-subtle">
              12:00 PM
            </span>
            <div className="flex flex-1 items-center gap-3">
              <span className="h-px flex-1 bg-muted/20" />
              <span className="flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 font-nunito font-bold text-xs text-subtle">
                <Coffee className="size-3" strokeWidth={2} />
                Lunch Break
              </span>
              <span className="h-px flex-1 bg-muted/20" />
            </div>
          </div>

          {afternoon.map((a) => (
            <AppointmentRow key={a.id} appt={a} onEdit={onEdit} />
          ))}

          {/* Available slot */}
          <div className="flex items-stretch gap-4">
            <span className="w-20 shrink-0 pt-3 text-right font-nunito font-bold text-xs text-subtle">
              {afternoon.length ? "" : "02:00 PM"}
            </span>
            <button
              onClick={onNew}
              className="flex flex-1 items-center justify-center gap-2 rounded-3xl border border-dashed border-brand/40 bg-input/40 py-4 font-nunito font-bold text-sm text-brand-dark transition hover:bg-input"
            >
              <Plus className="size-4" strokeWidth={2.5} />
              Available Slot
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

GroomingAgenda.propTypes = {
  appointments: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  onEdit: PropTypes.func,
  onNew: PropTypes.func,
};

export default GroomingAgenda;
