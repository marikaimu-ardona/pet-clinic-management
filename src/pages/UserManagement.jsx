import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Database, Users, UserPlus } from "lucide-react";
import { useStaff } from "../hooks/useStaff";
import StaffModal from "../components/users/StaffModal";
import ResetPasswordModal from "../components/users/ResetPasswordModal";
import StaffDirectory from "../components/users/StaffDirectory";

function UserManagement() {
  const { profile, session } = useOutletContext();
  const actorName = profile?.full_name;
  const meId = session?.user?.id;
  const meEmail = session?.user?.email;
  // Manage actions are admin-only (default to allowed until the flag loads / is set).
  const canManage = profile?.is_admin !== false;
  const { loading, error, needsSetup, staff, total, adminIds } = useStaff();
  const onDutyStaff = staff.filter((s) => s.on_duty);
  const offDutyStaff = staff.filter((s) => !s.on_duty);
  const onDuty = onDutyStaff.length;
  const offDuty = total - onDuty;
  const [staffModal, setStaffModal] = useState({ open: false, staff: null });
  const [resetModal, setResetModal] = useState({ open: false, member: null });

  return (
    <main className="flex flex-col gap-8 p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-quicksand font-bold text-[32px] leading-10 tracking-[-0.64px] text-ink">
          User Management
        </h1>
        {canManage && (
          <button
            onClick={() => setStaffModal({ open: true, staff: null })}
            className="flex items-center gap-2 rounded-full bg-brand-dark px-6 py-3 font-quicksand font-semibold text-sm text-white shadow-md transition hover:brightness-110"
          >
            <UserPlus className="size-4" strokeWidth={2.5} />
            Add New Staff
          </button>
        )}
      </div>

      {needsSetup && (
        <div className="flex items-start gap-3 rounded-2xl border border-card-border bg-surface p-4">
          <Database className="size-5 shrink-0 text-brand-dark" strokeWidth={2} />
          <p className="font-nunito text-sm text-ink">
            Staff tables are not set up yet. Run{" "}
            <code className="rounded bg-card px-1.5 py-0.5 text-brand-dark">
              supabase/0006_user_management.sql
            </code>{" "}
            in the Supabase SQL Editor.
          </p>
        </div>
      )}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 font-nunito text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Stat cards row */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="flex items-center justify-between gap-4 rounded-[32px] bg-brand-dark p-6 text-white">
          <div>
            <p className="font-nunito font-extrabold text-[10px] uppercase tracking-wide text-white/80">
              Total Staff
            </p>
            <p className="mt-2 font-quicksand font-bold text-4xl leading-none">{loading ? "—" : total}</p>
          </div>
          <Users className="size-7 text-white/40" strokeWidth={2} />
        </div>
        <div className="flex flex-col justify-center rounded-[32px] border border-card-border/40 bg-card p-6">
          <p className="font-nunito font-extrabold text-[10px] uppercase tracking-wide text-subtle">
            On Duty
          </p>
          <p className="mt-2 font-quicksand font-bold text-4xl leading-none text-brand-dark">
            {loading ? "—" : onDuty}
          </p>
        </div>
        <div className="flex flex-col justify-center rounded-[32px] border border-card-border/40 bg-card p-6">
          <p className="font-nunito font-extrabold text-[10px] uppercase tracking-wide text-subtle">
            Off Duty
          </p>
          <p className="mt-2 font-quicksand font-bold text-4xl leading-none text-accent-rust">
            {loading ? "—" : offDuty}
          </p>
        </div>
      </div>

      {/* Staff directories: on duty + off duty (stacked, full width) */}
      <StaffDirectory
        title="On Duty"
        staff={onDutyStaff}
        loading={loading}
        actorName={actorName}
        canManage={canManage}
        adminIds={adminIds}
        meId={meId}
        meEmail={meEmail}
        onEdit={(member) => setStaffModal({ open: true, staff: member })}
        onResetPassword={(member) => setResetModal({ open: true, member })}
      />
      <StaffDirectory
        title="Off Duty"
        staff={offDutyStaff}
        loading={loading}
        actorName={actorName}
        canManage={canManage}
        adminIds={adminIds}
        meId={meId}
        meEmail={meEmail}
        onEdit={(member) => setStaffModal({ open: true, staff: member })}
        onResetPassword={(member) => setResetModal({ open: true, member })}
      />

      <StaffModal
        open={staffModal.open}
        staff={staffModal.staff}
        onClose={() => setStaffModal({ open: false, staff: null })}
        actorName={actorName}
      />
      <ResetPasswordModal
        open={resetModal.open}
        member={resetModal.member}
        onClose={() => setResetModal({ open: false, member: null })}
        actorName={actorName}
      />
    </main>
  );
}

export default UserManagement;
