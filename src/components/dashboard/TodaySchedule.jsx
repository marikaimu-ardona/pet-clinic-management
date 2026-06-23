import PropTypes from "prop-types";
import { Plus, BriefcaseMedical, Scissors, Stethoscope } from "lucide-react";
import { timeOfDay } from "../../lib/format";
import { isPastDay } from "../../lib/calendar";
import { usePagination } from "../../lib/usePagination";
import Pagination from "../ui/Pagination";
import Skeleton from "../ui/Skeleton";

// Visual treatment per appointment type.
const TYPE_STYLES = {
  checkup: {
    label: "Check-up",
    Icon: BriefcaseMedical,
    dot: "bg-brand-dark",
    chip: "bg-brand-dark/10 text-brand-dark dark:bg-brand/25 dark:text-brand",
  },
  grooming: {
    label: "Grooming",
    Icon: Scissors,
    dot: "bg-accent-rust",
    chip: "bg-accent-rust/10 text-accent-rust dark:bg-cta/25 dark:text-cta",
  },
  surgery: {
    label: "Surgery",
    Icon: Stethoscope,
    dot: "bg-accent-rust-dark",
    chip: "bg-accent-rust-dark/10 text-accent-rust-dark dark:bg-cta/20 dark:text-cta",
  },
};

// The hero widget: a time-ordered list of scheduled appointments. When
// `showDay` is set (week range), each row is prefixed with its weekday.
function TodaySchedule({ items, loading, title = "Today's Schedule", showDay = false, onNew, onEdit }) {
  const pager = usePagination(items, 6);
  return (
    <div className="flex flex-1 flex-col rounded-[32px] border border-card-border/20 bg-card p-8 drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between pb-6">
        <div>
          <h2 className="font-quicksand font-semibold text-lg text-ink">{title}</h2>
          {!loading && (
            <p className="font-nunito text-xs text-subtle">
              {items.length} appointment{items.length === 1 ? "" : "s"}
            </p>
          )}
        </div>
        <button
          onClick={onNew}
          className="flex items-center gap-2 rounded-full bg-cta px-4 py-2 font-quicksand font-semibold text-sm text-cta-text shadow-sm transition hover:brightness-105 active:brightness-95"
        >
          <Plus className="size-4" strokeWidth={2.5} />
          New Appointment
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="font-nunito text-sm text-subtle">
          No appointments booked for today.
        </p>
      ) : (
        <ul className="flex flex-col">
          {pager.pageItems.map((appt) => {
            const style = TYPE_STYLES[appt.type] ?? TYPE_STYLES.checkup;
            const { Icon } = style;
            const pet = appt.pets;
            const owner = pet?.owners?.full_name;
            const past = isPastDay(appt.scheduled_at);
            return (
              <li
                key={appt.id}
                onClick={past ? undefined : () => onEdit?.(appt)}
                title={past ? "Past appointment (read-only)" : "Edit appointment"}
                className={`flex items-center gap-4 border-b border-muted/20 px-3 py-4 transition last:border-0 ${
                  past
                    ? "cursor-default opacity-50"
                    : "-mx-3 cursor-pointer rounded-2xl hover:bg-surface/60"
                }`}
              >
                <span className={`${showDay ? "w-24" : "w-16"} shrink-0 font-quicksand font-semibold text-sm text-ink`}>
                  {showDay
                    ? `${new Date(appt.scheduled_at).toLocaleDateString(undefined, { weekday: "short" })} ${timeOfDay(appt.scheduled_at)}`
                    : timeOfDay(appt.scheduled_at)}
                </span>
                <span className={`size-2 shrink-0 rounded-full ${style.dot}`} />
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface text-subtle">
                  <Icon className="size-[18px]" strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-nunito font-semibold text-sm text-ink">
                    {pet?.name ?? "Unknown patient"}
                    {pet?.breed ? (
                      <span className="font-normal text-subtle"> · {pet.breed}</span>
                    ) : null}
                  </p>
                  <p className="truncate font-nunito text-xs text-subtle">
                    {appt.title || style.label}
                    {owner ? ` · ${owner}` : ""}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1 font-nunito font-bold text-[10px] uppercase tracking-[0.6px] ${style.chip}`}>
                  {style.label}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {!loading && items.length > pager.pageSize && (
        <div className="mt-2 border-t border-muted/15">
          <Pagination {...pager} />
        </div>
      )}
    </div>
  );
}

TodaySchedule.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      type: PropTypes.string,
      title: PropTypes.string,
      scheduled_at: PropTypes.string,
      pets: PropTypes.shape({
        name: PropTypes.string,
        breed: PropTypes.string,
        species: PropTypes.string,
        owners: PropTypes.shape({ full_name: PropTypes.string }),
      }),
    })
  ).isRequired,
  loading: PropTypes.bool,
  title: PropTypes.string,
  showDay: PropTypes.bool,
  onNew: PropTypes.func,
  onEdit: PropTypes.func,
};

export default TodaySchedule;
