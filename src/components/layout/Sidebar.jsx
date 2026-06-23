import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";
import {
  Plus,
  LayoutDashboard,
  CalendarDays,
  Scissors,
  Users,
  UserCog,
  ScrollText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import pawIcon from "../../assets/paw.svg";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", Icon: LayoutDashboard, end: true },
  { to: "/calendar", label: "Vet Calendar", Icon: CalendarDays },
  { to: "/grooming", label: "Grooming", Icon: Scissors },
  { to: "/clients", label: "Clients", Icon: Users },
  { to: "/users", label: "User Management", Icon: UserCog },
];

const FOOTER_ITEMS = [{ to: "/activity", label: "Activity Logs", Icon: ScrollText }];

function linkClass(isActive, collapsed) {
  const base = "flex items-center gap-3 rounded-[32px] py-3 font-nunito font-bold text-xs tracking-[0.6px] transition";
  const pad = collapsed ? "justify-center px-0" : "px-4";
  if (isActive) {
    return `${base} ${collapsed ? "justify-center px-0" : "border-r-4 border-brand-dark pl-4 pr-5"} bg-brand/10 text-brand-dark`;
  }
  return `${base} ${pad} text-subtle hover:bg-brand/5`;
}

// App-wide left navigation. Active item is driven by the current route.
// variant="desktop" stays hidden below lg and can collapse to icons;
// variant="mobile" is the always-expanded drawer body.
function Sidebar({ onNewAppointment, variant = "desktop", onNavigate, collapsed = false, onToggleCollapse }) {
  const isMobile = variant === "mobile";
  const isCollapsed = !isMobile && collapsed;

  const asideClass = isMobile
    ? "flex h-full w-72 max-w-[82vw] flex-col overflow-y-auto bg-surface px-4 py-6 shadow-2xl"
    : `hidden lg:flex shrink-0 flex-col bg-surface py-6 drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] transition-[width] duration-200 ${
        isCollapsed ? "w-20 px-2" : "w-64 px-4"
      }`;

  return (
    <aside className={asideClass}>
      {/* Brand */}
      <div className={`flex items-center gap-3 pb-8 ${isCollapsed ? "justify-center" : "px-2"}`}>
        <div className="size-10 shrink-0 rounded-2xl bg-brand-dark flex items-center justify-center">
          <img src={pawIcon} alt="" className="w-5 h-[19px] brightness-0 invert" />
        </div>
        {!isCollapsed && (
          <div className="leading-tight">
            <p className="font-quicksand font-bold text-xl text-brand-dark">Kindred Paws</p>
            <p className="font-nunito font-extrabold text-[10px] uppercase tracking-wide text-subtle/70">
              Clinic Management
            </p>
          </div>
        )}
      </div>

      {/* Primary action */}
      <button
        onClick={onNewAppointment}
        title="New Appointment"
        className={`mb-8 flex items-center justify-center gap-2 rounded-[32px] bg-accent-rust font-nunito font-bold text-xs tracking-[0.6px] text-white shadow-md transition hover:brightness-105 active:brightness-95 ${
          isCollapsed ? "size-12 self-center p-0" : "px-4 py-4"
        }`}
      >
        <Plus className="size-3.5 shrink-0" strokeWidth={3} />
        {!isCollapsed && "New Appointment"}
      </button>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-2">
        {NAV_ITEMS.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            title={isCollapsed ? label : undefined}
            className={({ isActive }) => linkClass(isActive, isCollapsed)}
          >
            <Icon className="size-[18px] shrink-0" strokeWidth={2} />
            {!isCollapsed && label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-4 flex flex-col gap-2 border-t border-muted/30 pt-5">
        {FOOTER_ITEMS.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            title={isCollapsed ? label : undefined}
            className={({ isActive }) => linkClass(isActive, isCollapsed)}
          >
            <Icon className="size-[18px] shrink-0" strokeWidth={2} />
            {!isCollapsed && label}
          </NavLink>
        ))}

        {/* Collapse toggle (desktop only) */}
        {!isMobile && (
          <button
            onClick={onToggleCollapse}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`mt-1 flex items-center gap-3 rounded-[32px] py-3 font-nunito font-bold text-xs tracking-[0.6px] text-subtle transition hover:bg-brand/5 ${
              isCollapsed ? "justify-center px-0" : "px-4"
            }`}
          >
            {isCollapsed ? (
              <ChevronRight className="size-[18px] shrink-0" strokeWidth={2} />
            ) : (
              <ChevronLeft className="size-[18px] shrink-0" strokeWidth={2} />
            )}
            {!isCollapsed && "Collapse"}
          </button>
        )}
      </div>
    </aside>
  );
}

Sidebar.propTypes = {
  onNewAppointment: PropTypes.func,
  variant: PropTypes.oneOf(["desktop", "mobile"]),
  onNavigate: PropTypes.func,
  collapsed: PropTypes.bool,
  onToggleCollapse: PropTypes.func,
};

export default Sidebar;
