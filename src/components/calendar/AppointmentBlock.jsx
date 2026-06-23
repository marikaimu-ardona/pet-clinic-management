import PropTypes from "prop-types";
import { Clock, User, DoorOpen } from "lucide-react";
import Avatar from "../dashboard/Avatar";
import { categoryStyle, typeWord, isPastDay } from "../../lib/calendar";
import { timeOfDay } from "../../lib/format";
import { BLOCK_ACCENTS as ACCENTS } from "./accents";

// A single positioned appointment in the timeline. `style` carries the
// absolute top/height/left/width computed by the timeline. Short appointments
// (< 1 hour) render a condensed single-row layout so text never clips.
function AppointmentBlock({ appt, style, onEdit }) {
  const pet = appt.pets;
  const { accent, label } = categoryStyle(appt.category, appt.type);
  const a = ACCENTS[accent] ?? ACCENTS.teal;
  const start = appt.scheduled_at;
  const endIso = new Date(
    new Date(start).getTime() + (appt.duration_minutes || 30) * 60000
  ).toISOString();
  const isSurgery = appt.type === "surgery";
  const compact = (appt.duration_minutes || 30) < 60;
  const past = isPastDay(appt.scheduled_at);

  const heading = pet?.name ? `${pet.name}'s ${typeWord(appt.type)}` : appt.title;
  const timeRange = (
    <span className={`flex items-center gap-1 font-nunito font-extrabold text-[10px] ${a.sub}`}>
      <Clock className="size-3" strokeWidth={2.5} />
      {timeOfDay(start)} - {timeOfDay(endIso)}
    </span>
  );
  const badge = (
    <span className={`shrink-0 rounded-full px-2 py-1 font-nunito font-bold text-[10px] uppercase tracking-[0.5px] ${a.badge}`}>
      {label}
    </span>
  );

  if (compact) {
    return (
      <div
        style={style}
        onClick={past ? undefined : () => onEdit?.(appt)}
        title={past ? "Past appointment (read-only)" : undefined}
        className={`absolute flex items-center gap-2 overflow-hidden rounded-r-2xl border-l-4 ${a.bg} ${a.border} px-3 py-2 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] ${
          past ? "opacity-50" : "cursor-pointer transition hover:brightness-95"
        }`}
      >
        <Avatar
          name={pet?.name}
          src={pet?.photo_url}
          className="size-8 shrink-0 rounded-full border-2 border-white bg-input"
          textClassName="text-[10px]"
        />
        <div className="min-w-0 flex-1">
          <p className={`truncate font-quicksand font-semibold text-sm leading-tight ${a.title}`}>
            {heading}
          </p>
          <p className="leading-tight">{timeRange}</p>
        </div>
        {badge}
      </div>
    );
  }

  return (
    <div
      style={style}
      onClick={past ? undefined : () => onEdit?.(appt)}
      title={past ? "Past appointment (read-only)" : undefined}
      className={`absolute overflow-hidden rounded-r-3xl border-l-4 ${a.bg} ${a.border} p-4 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] ${
        past ? "opacity-50" : "cursor-pointer transition hover:brightness-95"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar
            name={pet?.name}
            src={pet?.photo_url}
            className={`shrink-0 rounded-full border-2 border-white bg-input ${isSurgery ? "size-14" : "size-10"}`}
            textClassName="text-sm"
          />
          <div className="min-w-0">
            <p className={`truncate font-quicksand font-semibold text-lg leading-tight ${a.title}`}>
              {heading}
            </p>
            <p className="mt-0.5">{timeRange}</p>
            {isSurgery && (appt.vet || appt.room) && (
              <div className="mt-1.5 flex flex-wrap gap-2">
                {appt.vet && (
                  <span className="flex items-center gap-1 rounded-md bg-white/60 px-2 py-1 font-nunito font-extrabold text-[10px] text-ink">
                    <User className="size-2.5" strokeWidth={2.5} />
                    {appt.vet}
                  </span>
                )}
                {appt.room && (
                  <span className="flex items-center gap-1 rounded-md bg-white/60 px-2 py-1 font-nunito font-extrabold text-[10px] text-ink">
                    <DoorOpen className="size-2.5" strokeWidth={2.5} />
                    {appt.room}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        {badge}
      </div>
    </div>
  );
}

AppointmentBlock.propTypes = {
  appt: PropTypes.object.isRequired,
  style: PropTypes.object.isRequired,
  onEdit: PropTypes.func,
};

export default AppointmentBlock;
