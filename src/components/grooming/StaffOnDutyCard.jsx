import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import Avatar from "../dashboard/Avatar";

// "Staff on Duty": groomers currently working, with a message action.
function StaffOnDutyCard({ staff }) {
  return (
    <div className="rounded-[32px] border border-card-border/30 bg-card p-6 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between">
        <h2 className="font-quicksand font-bold text-lg text-ink">Staff on Duty</h2>
        <Link to="/users" className="font-nunito font-bold text-xs text-brand-dark hover:underline">
          View All
        </Link>
      </div>

      <ul className="mt-4 flex flex-col gap-4">
        {staff.length === 0 && (
          <li className="font-nunito text-sm text-subtle">No staff on duty.</li>
        )}
        {staff.map((member) => (
          <li key={member.id} className="flex items-center gap-3">
            <div className="relative shrink-0">
              <Avatar
                name={member.full_name}
                src={member.avatar_url}
                className="size-10 rounded-full bg-input"
                textClassName="text-xs"
              />
              <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-white bg-green-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-nunito font-bold text-sm text-ink">
                {member.full_name}
              </p>
              <p className="truncate font-nunito text-xs text-subtle">{member.role}</p>
            </div>
            <button
              aria-label={`Message ${member.full_name}`}
              className="shrink-0 rounded-full p-2 text-subtle transition hover:bg-surface"
            >
              <MessageSquare className="size-4" strokeWidth={2} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

StaffOnDutyCard.propTypes = {
  staff: PropTypes.array.isRequired,
};

export default StaffOnDutyCard;
