import { useState } from "react";
import PropTypes from "prop-types";
import { Trash2, Pencil, KeyRound } from "lucide-react";
import Avatar from "../dashboard/Avatar";
import Pagination from "../ui/Pagination";
import { usePagination } from "../../lib/usePagination";
import ConfirmDialog from "../ui/ConfirmDialog";
import Skeleton from "../ui/Skeleton";
import { supabase } from "../../lib/supabase";
import { bumpData } from "../../lib/refresh";
import { logActivity } from "../../lib/audit";
import { useToast } from "../../lib/toast";

// Staff directory with edit / on-duty toggle / remove. The audit trail lives on
// the Activity Logs page.
function StaffDirectory({ staff, loading, actorName, title = "Staff Directory", onEdit, onResetPassword, canManage = true, meId, meEmail, adminIds = [] }) {
  const isMe = (m) => (meId && m.user_id === meId) || (meEmail && m.email === meEmail);
  const isAdmin = (m) => m.user_id && adminIds.includes(m.user_id);
  // Pin the logged-in user to the top (stable sort keeps the rest in order).
  const ordered = [...staff].sort((a, b) => Number(Boolean(isMe(b))) - Number(Boolean(isMe(a))));
  const pager = usePagination(ordered, 8);
  const toast = useToast();
  const [confirmRemove, setConfirmRemove] = useState(null);
  const [busy, setBusy] = useState(false);

  async function toggleDuty(member) {
    await supabase.from("staff").update({ on_duty: !member.on_duty }).eq("id", member.id);
    await logActivity(
      `${member.on_duty ? "Set Off Duty" : "Set On Duty"} (${member.full_name})`,
      "update",
      actorName
    );
    toast(member.on_duty ? "Set off duty" : "Set on duty");
    bumpData();
  }

  async function remove() {
    if (!confirmRemove) return;
    setBusy(true);
    await supabase.from("staff").delete().eq("id", confirmRemove.id);
    await logActivity(`Removed Staff (${confirmRemove.full_name})`, "delete", actorName);
    setBusy(false);
    setConfirmRemove(null);
    toast("Staff removed");
    bumpData();
  }

  const th =
    "px-6 py-3 font-nunito font-extrabold text-[10px] uppercase tracking-[1px] text-subtle";

  return (
    <>
      <div className="overflow-hidden rounded-[32px] bg-card shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-3 p-6">
          <h2 className="font-quicksand font-bold text-xl text-ink">{title}</h2>
          {!loading && (
            <span className="rounded-full bg-surface px-2.5 py-0.5 font-nunito font-bold text-xs text-subtle">
              {staff.length}
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col gap-3 px-6 pb-6">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : staff.length === 0 ? (
          <p className="px-6 pb-6 font-nunito text-sm text-subtle">No staff yet.</p>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="bg-surface/50 text-left">
                <th className={th}>Name</th>
                <th className={th}>Role</th>
                <th className={`${th} hidden sm:table-cell`}>Email</th>
                <th className={`${th} text-right`}>Status</th>
                <th className={`${th} text-right`} aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {pager.pageItems.map((member) => (
                <tr key={member.id} className={`border-t border-muted/10 ${isMe(member) ? "bg-brand/5" : ""}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={member.full_name}
                        src={member.avatar_url}
                        className="size-9 shrink-0 rounded-full bg-input"
                        textClassName="text-xs"
                      />
                      <span className="font-nunito font-bold text-sm text-ink">{member.full_name}</span>
                      {isMe(member) && (
                        <span className="rounded-full bg-brand-dark/10 px-2 py-0.5 font-nunito font-bold text-[10px] uppercase tracking-wide text-brand-dark">
                          You
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-nunito text-sm text-subtle">{member.role}</span>
                      {isAdmin(member) && (
                        <span className="rounded-full bg-accent-gold/15 px-2 py-0.5 font-nunito font-bold text-[10px] uppercase tracking-wide text-accent-gold">
                          Admin
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="hidden px-6 py-4 font-nunito text-sm text-subtle sm:table-cell">
                    {member.email || "—"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => canManage && toggleDuty(member)}
                      disabled={!canManage}
                      title={canManage ? "Toggle on duty" : undefined}
                      className={`rounded-full px-3 py-1 font-nunito font-bold text-[11px] transition ${
                        member.on_duty
                          ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300"
                          : "bg-surface text-subtle"
                      } ${canManage ? "hover:brightness-95" : "cursor-default"}`}
                    >
                      {member.on_duty ? "On Duty" : "Off Duty"}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    {canManage ? (
                      <div className="flex items-center justify-end gap-1">
                        {member.user_id && (
                          <button
                            onClick={() => onResetPassword?.(member)}
                            aria-label={`Reset password for ${member.full_name}`}
                            title="Reset password"
                            className="rounded-full p-2 text-subtle transition hover:bg-surface hover:text-brand-dark"
                          >
                            <KeyRound className="size-4" strokeWidth={2} />
                          </button>
                        )}
                        <button
                          onClick={() => onEdit?.(member)}
                          aria-label={`Edit ${member.full_name}`}
                          className="rounded-full p-2 text-subtle transition hover:bg-surface hover:text-brand-dark"
                        >
                          <Pencil className="size-4" strokeWidth={2} />
                        </button>
                        {!isMe(member) && (
                          <button
                            onClick={() => setConfirmRemove(member)}
                            aria-label={`Remove ${member.full_name}`}
                            className="rounded-full p-2 text-subtle transition hover:bg-cta/10 hover:text-accent-rust"
                          >
                            <Trash2 className="size-4" strokeWidth={2} />
                          </button>
                        )}
                      </div>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}

        {!loading && staff.length > 0 && (
          <div className="border-t border-muted/10">
            <Pagination {...pager} />
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!confirmRemove}
        title="Remove staff"
        message={`Remove ${confirmRemove?.full_name ?? "this staff member"} from the directory?`}
        confirmLabel="Remove"
        variant="danger"
        loading={busy}
        onConfirm={remove}
        onCancel={() => setConfirmRemove(null)}
      />
    </>
  );
}

StaffDirectory.propTypes = {
  staff: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  actorName: PropTypes.string,
  title: PropTypes.string,
  onEdit: PropTypes.func,
  onResetPassword: PropTypes.func,
  canManage: PropTypes.bool,
  meId: PropTypes.string,
  meEmail: PropTypes.string,
  adminIds: PropTypes.array,
};

export default StaffDirectory;
