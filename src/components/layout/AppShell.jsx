import { useState, useEffect, Suspense } from "react";
import PropTypes from "prop-types";
import { Outlet, useLocation } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useProfile } from "../../hooks/useProfile";
import Sidebar from "./Sidebar";
import TopBar from "../dashboard/TopBar";
import AppointmentModal from "../appointments/AppointmentModal";
import UpdatePassword from "../UpdatePassword";

// Persistent chrome (sidebar + top bar) wrapping every authenticated page.
// Pages read { session, profile, openNewAppointment, openEditAppointment }
// from the Outlet context.
function AppShell({ session }) {
  const profile = useProfile(session);
  const displayName = profile?.full_name || session?.user?.email || "";
  const [pwChanged, setPwChanged] = useState(false);

  async function finishPasswordChange() {
    await supabase
      .from("profiles")
      .update({ must_change_password: false })
      .eq("id", session.user.id);
    setPwChanged(true);
  }
  const location = useLocation();

  const [modal, setModal] = useState({ open: false, appointment: null });
  const openNewAppointment = () => setModal({ open: true, appointment: null });
  const openEditAppointment = (appointment) => setModal({ open: true, appointment });
  const closeModal = () => setModal({ open: false, appointment: null });

  const [navOpen, setNavOpen] = useState(false);
  // Close the mobile drawer whenever the route changes.
  useEffect(() => setNavOpen(false), [location.pathname]);

  // Desktop sidebar collapse, persisted across reloads.
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("kp-nav-collapsed") === "1"
  );
  const toggleCollapse = () =>
    setCollapsed((c) => {
      localStorage.setItem("kp-nav-collapsed", c ? "0" : "1");
      return !c;
    });

  // First login after an admin set an initial password: force a change.
  if (profile?.must_change_password && !pwChanged) {
    return <UpdatePassword onDone={finishPasswordChange} />;
  }

  return (
    <div className="flex min-h-screen w-full bg-page">
      {/* Desktop sidebar */}
      <Sidebar
        onNewAppointment={openNewAppointment}
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
      />

      {/* Mobile drawer */}
      {navOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setNavOpen(false)} />
          <div className="absolute left-0 top-0 h-full">
            <Sidebar
              variant="mobile"
              onNavigate={() => setNavOpen(false)}
              onNewAppointment={() => {
                setNavOpen(false);
                openNewAppointment();
              }}
            />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          name={displayName}
          role={profile?.role}
          avatarUrl={profile?.avatar_url}
          onMenuClick={() => setNavOpen(true)}
        />
        <Suspense
          fallback={<div className="p-8 font-nunito text-sm text-muted">Loading...</div>}
        >
          <Outlet context={{ session, profile, openNewAppointment, openEditAppointment }} />
        </Suspense>
      </div>

      <AppointmentModal
        open={modal.open}
        onClose={closeModal}
        actorName={displayName}
        appointment={modal.appointment}
      />
    </div>
  );
}

AppShell.propTypes = {
  session: PropTypes.shape({
    user: PropTypes.shape({ id: PropTypes.string, email: PropTypes.string }),
  }),
};

export default AppShell;
