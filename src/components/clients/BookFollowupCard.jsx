import PropTypes from "prop-types";
import { CalendarCheck } from "lucide-react";

// Teal call-to-action card prompting the next visit.
function BookFollowupCard({ nextVisit, onSchedule }) {
  const label = nextVisit
    ? new Date(nextVisit).toLocaleDateString(undefined, { month: "long", year: "numeric" })
    : "Not scheduled";

  return (
    <div className="flex flex-col items-center gap-4 rounded-[32px] bg-brand-dark p-8 text-center text-white">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-white/15">
        <CalendarCheck className="size-8" strokeWidth={2} />
      </div>
      <h2 className="font-quicksand font-bold text-2xl leading-tight">Book Follow-up</h2>
      <p className="font-nunito text-sm text-white/80">
        Next recommended visit: {label}
      </p>
      <button
        onClick={onSchedule}
        className="mt-2 w-full rounded-full bg-card px-6 py-3 font-quicksand font-semibold text-sm text-brand-dark transition hover:bg-white/90"
      >
        Schedule Now
      </button>
    </div>
  );
}

BookFollowupCard.propTypes = {
  nextVisit: PropTypes.string,
  onSchedule: PropTypes.func,
};

export default BookFollowupCard;
