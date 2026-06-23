import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { LogOut, Sun, Moon, Menu } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useTheme } from "../../hooks/useTheme";
import Avatar from "./Avatar";
import GlobalSearch from "../layout/GlobalSearch";

// Top navigation bar: search, quick actions, and the signed-in user with a
// sign-out menu.
function TopBar({ name, role, avatarUrl, onMenuClick }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const { theme, toggle } = useTheme();

  useEffect(() => {
    function onClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b border-card-border/20 bg-page px-4 sm:px-8 drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
      {/* Mobile menu */}
      <button
        onClick={onMenuClick}
        aria-label="Open menu"
        className="shrink-0 rounded-full p-2 text-subtle transition hover:bg-surface lg:hidden"
      >
        <Menu className="size-5" strokeWidth={2} />
      </button>

      {/* Search */}
      <GlobalSearch />

      {/* Right: user */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggle}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className="rounded-full p-2 text-subtle transition hover:bg-surface"
        >
          {theme === "dark" ? (
            <Sun className="size-5" strokeWidth={2} />
          ) : (
            <Moon className="size-5" strokeWidth={2} />
          )}
        </button>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-3"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <div className="hidden sm:flex flex-col items-end">
              <span className="font-nunito font-bold text-xs tracking-[0.6px] text-ink">
                {name || "—"}
              </span>
              {role && (
                <span className="font-nunito font-extrabold text-[10px] text-muted">
                  {role}
                </span>
              )}
            </div>
            <Avatar
              name={name}
              src={avatarUrl}
              className="size-10 rounded-full border-2 border-brand shadow-sm"
              textClassName="text-sm"
            />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-44 rounded-2xl border border-card-border bg-card p-2 shadow-lg z-10"
            >
              <button
                role="menuitem"
                onClick={handleSignOut}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 font-nunito text-sm text-ink hover:bg-surface transition"
              >
                <LogOut className="size-4" strokeWidth={2} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

TopBar.propTypes = {
  name: PropTypes.string,
  role: PropTypes.string,
  avatarUrl: PropTypes.string,
  onMenuClick: PropTypes.func,
};

export default TopBar;
