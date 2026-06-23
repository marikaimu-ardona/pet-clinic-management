import PropTypes from "prop-types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { rangeLabel, addByView } from "../../lib/calendar";

const VIEWS = ["day", "week", "month", "year"];

// Title, view switcher (Day/Week/Month/Year), and unit-aware range navigation.
function CalendarHeader({ view, onChangeView, selectedDate, onSelectDate }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex flex-col gap-2">
        <h1 className="font-quicksand font-bold text-[32px] leading-10 tracking-[-0.64px] text-brand-dark">
          Appointments
        </h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => onSelectDate(addByView(selectedDate, view, -1))}
            aria-label="Previous"
            className="rounded-full p-2 text-subtle transition hover:bg-surface"
          >
            <ChevronLeft className="size-4" strokeWidth={2.5} />
          </button>
          <span className="min-w-[12rem] text-center font-quicksand font-semibold text-lg text-ink">
            {rangeLabel(view, selectedDate)}
          </span>
          <button
            onClick={() => onSelectDate(addByView(selectedDate, view, 1))}
            aria-label="Next"
            className="rounded-full p-2 text-subtle transition hover:bg-surface"
          >
            <ChevronRight className="size-4" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <div className="flex flex-col items-end gap-3">
        {/* View switcher */}
        <div className="flex items-center gap-1 rounded-[32px] bg-input p-1">
          {VIEWS.map((v) => (
            <button
              key={v}
              onClick={() => onChangeView(v)}
              className={
                view === v
                  ? "rounded-full bg-card px-4 py-1.5 font-nunito font-bold text-xs uppercase tracking-[0.6px] text-brand-dark shadow-sm"
                  : "rounded-full px-4 py-1.5 font-nunito font-bold text-xs uppercase tracking-[0.6px] text-subtle"
              }
            >
              {v}
            </button>
          ))}
        </div>
        <button
          onClick={() => onSelectDate(new Date())}
          className="font-nunito font-bold text-xs tracking-[0.6px] text-brand-dark hover:underline"
        >
          Today
        </button>
      </div>
    </div>
  );
}

CalendarHeader.propTypes = {
  view: PropTypes.oneOf(VIEWS).isRequired,
  onChangeView: PropTypes.func.isRequired,
  selectedDate: PropTypes.instanceOf(Date).isRequired,
  onSelectDate: PropTypes.func.isRequired,
};

export default CalendarHeader;
