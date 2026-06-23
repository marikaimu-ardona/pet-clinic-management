import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Pencil, Plus, RotateCcw, FileText, Trash2, LogIn } from "lucide-react";
import { timeAgo } from "../../lib/format";

// Icon + tint per audit action type (mirrors the Activity Logs page).
const ACTION_STYLES = {
  create: { Icon: Plus, wrap: "bg-brand/20 text-brand-dark" },
  update: { Icon: Pencil, wrap: "bg-cta/20 text-accent-rust" },
  delete: { Icon: Trash2, wrap: "bg-cta/20 text-accent-rust" },
  password: { Icon: RotateCcw, wrap: "bg-cta/20 text-accent-rust" },
  report: { Icon: FileText, wrap: "bg-input text-brand-dark" },
  login: { Icon: LogIn, wrap: "bg-brand/20 text-brand-dark" },
};

// Recent system activity (latest audit-log entries).
function RecentActivity({ items }) {
  return (
    <div className="rounded-[32px] border border-card-border/20 bg-surface p-8 drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between pb-6">
        <h2 className="font-quicksand font-semibold text-lg text-ink">Recent Activity</h2>
        <Link
          to="/activity"
          className="font-nunito font-bold text-xs tracking-[0.6px] text-brand-dark hover:underline"
        >
          View All
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="font-nunito text-sm text-subtle">No recent activity.</p>
      ) : (
        <ul className="max-h-[400px] space-y-6 overflow-auto pr-2">
          {items.map((item) => {
            const style = ACTION_STYLES[item.action_type] ?? ACTION_STYLES.report;
            const { Icon } = style;
            return (
              <li key={item.id} className="flex items-start gap-4">
                <div className={`flex size-10 shrink-0 items-center justify-center rounded-full ${style.wrap}`}>
                  <Icon className="size-4" strokeWidth={2} />
                </div>
                <div className="flex-1 border-b border-muted/30 pb-4 last:border-0">
                  <p className="font-nunito font-semibold text-sm text-ink">{item.action}</p>
                  <p className="font-nunito font-extrabold text-[10px] text-subtle">
                    {[item.actor_name, timeAgo(item.created_at)].filter(Boolean).join(" • ")}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

RecentActivity.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      action: PropTypes.string,
      action_type: PropTypes.string,
      actor_name: PropTypes.string,
      created_at: PropTypes.string,
    })
  ).isRequired,
};

export default RecentActivity;
