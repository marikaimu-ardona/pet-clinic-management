import PropTypes from "prop-types";
import { Siren } from "lucide-react";
import Avatar from "./Avatar";
import { timeOfDay } from "../../lib/format";

// "Upcoming Surgery" alert. Renders the next scheduled surgery, or an empty
// state when nothing is booked.
function SurgeryCard({ surgery }) {
  const pet = surgery?.pets;
  const petLabel = pet?.breed ? pet.breed : pet?.species;

  return (
    <div className="relative flex min-h-[252px] flex-col justify-between overflow-hidden rounded-[32px] bg-gradient-to-br from-accent-rust to-accent-rust-dark p-8 text-white shadow-md">
      {/* Decorative glyph */}
      <Siren
        className="pointer-events-none absolute -right-6 -top-4 size-36 rotate-12 text-white/20"
        strokeWidth={1.5}
        aria-hidden="true"
      />

      <div className="relative flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Siren className="size-5 text-[#ffdbd0]" strokeWidth={2} />
          <span className="font-nunito font-bold text-xs uppercase tracking-[1.2px] text-[#ffdbd0]">
            Upcoming Surgery
          </span>
        </div>

        {surgery ? (
          <div className="flex items-center gap-4">
            <Avatar
              name={pet?.name}
              src={pet?.photo_url}
              className="size-16 rounded-2xl border-2 border-white/30 bg-white/20"
              textClassName="text-white"
            />
            <div>
              <p className="font-quicksand font-bold text-2xl leading-8">
                {pet?.name ? `${pet.name} the` : "Scheduled"}
                {pet?.breed ? <br /> : null}
                {pet?.breed ?? ""}
              </p>
              <p className="font-nunito text-sm text-white/90">
                {surgery.title || petLabel || "Surgery"}
              </p>
            </div>
          </div>
        ) : (
          <p className="font-nunito text-sm text-white/90">
            No surgeries scheduled.
          </p>
        )}
      </div>

      {surgery && (
        <div className="relative pt-8">
          <p className="font-nunito font-extrabold text-[10px] uppercase tracking-wide text-white/70">
            Scheduled for
          </p>
          <p className="font-quicksand font-semibold text-lg">
            {timeOfDay(surgery.scheduled_at)}
          </p>
        </div>
      )}
    </div>
  );
}

SurgeryCard.propTypes = {
  surgery: PropTypes.shape({
    title: PropTypes.string,
    scheduled_at: PropTypes.string,
    pets: PropTypes.shape({
      name: PropTypes.string,
      species: PropTypes.string,
      breed: PropTypes.string,
      photo_url: PropTypes.string,
    }),
  }),
};

export default SurgeryCard;
