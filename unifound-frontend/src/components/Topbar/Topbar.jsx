import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  Search,
  ChevronDown,
  Settings,
  X,
  User,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { useSidebar } from "../../providers/SidebarProvider";
import { useAuth } from "../../providers/AuthProvider";
import "./Topbar.css";

const USER_TITLES = {
  "/dashboard": "Dashboard",
  "/browse-items": "Browse Items",
  "/report-item": "Report Item",
  "/my-reports": "My Reports",
  "/notifications": "Notifications",
  "/settings": "Settings",
};

const ADMIN_TITLES = {
  "/admin/dashboard": "Dashboard",
  "/admin/manage-items": "Manage Items",
  "/admin/manage-users": "Manage Users",
  "/admin/resolved-cases": "Resolved Cases",
  "/admin/analytics": "Analytics",
  "/admin/notifications": "Notifications",
  "/admin/settings": "Settings",
};

const Topbar = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { isOpen: sidebarOpen } = useSidebar();
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const isAdmin = user?.role === "Administrator";
  const titles = isAdmin ? ADMIN_TITLES : USER_TITLES;
  const pageTitle = titles[pathname] ?? "UniFound";

  const avatarInitials =
    user?.avatar_initials ||
    `${user?.first_name?.[0] || ""}${user?.last_name?.[0] || ""}`.toUpperCase() ||
    "?";

  const fullName = user ? `${user.first_name} ${user.last_name}` : "User";

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen)
      document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [dropdownOpen]);

  useEffect(() => {
    setDropdownOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate("/");
  };

  return (
    <>
      <header
        className={`topbar ${isAdmin ? "topbar--admin" : ""} ${sidebarOpen ? "topbar--sidebar-open" : "topbar--sidebar-closed"}`}
      >
        <span className="topbar-title">{pageTitle}</span>

        <div className="topbar-search topbar-search--desktop">
          <span className="topbar-search-icon">
            <Search size={15} />
          </span>
          <input
            type="text"
            placeholder={
              isAdmin
                ? "Search items, users, reports..."
                : "Search items, reports..."
            }
          />
        </div>

        <div className="topbar-actions">
          <button
            className="topbar-icon-btn topbar-search-toggle"
            aria-label="Toggle search"
            onClick={() => setSearchOpen((p) => !p)}
          >
            {searchOpen ? <X size={17} /> : <Search size={17} />}
          </button>

          <button className="topbar-icon-btn" aria-label="Notifications">
            <Bell size={17} />
            <span className="badge">{isAdmin ? 5 : 3}</span>
          </button>

          <div className="topbar-divider" />

          <div className="topbar-user-wrap" ref={dropdownRef}>
            <div
              className={`topbar-user ${dropdownOpen ? "topbar-user--active" : ""}`}
              onClick={() => setDropdownOpen((p) => !p)}
            >
              <div className="topbar-user-avatar">{avatarInitials}</div>
              <div className="topbar-user-info">
                <span className="topbar-user-name">{fullName}</span>
                <span className="topbar-user-role">
                  {isAdmin && <ShieldCheck size={9} />}
                  {user?.role || "User"}
                </span>
              </div>
              <span
                className={`topbar-user-chevron ${dropdownOpen ? "topbar-user-chevron--open" : ""}`}
              >
                <ChevronDown size={13} />
              </span>
            </div>

            {dropdownOpen && (
              <div className="topbar-dropdown">
                <div className="topbar-dropdown-header">
                  <div className="topbar-dropdown-avatar">{avatarInitials}</div>
                  <div className="topbar-dropdown-user-info">
                    <span className="topbar-dropdown-name">{fullName}</span>
                    <span className="topbar-dropdown-email">
                      {user?.email || ""}
                    </span>
                    <span className="topbar-dropdown-role-badge">
                      {user?.role || "User"}
                    </span>
                  </div>
                </div>

                <div className="topbar-dropdown-divider" />

                <button
                  className="topbar-dropdown-item"
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate("/profile");
                  }}
                >
                  <User size={15} />
                  <span>View Profile</span>
                </button>
                <button
                  className="topbar-dropdown-item"
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate(isAdmin ? "/admin/settings" : "/settings");
                  }}
                >
                  <Settings size={15} />
                  <span>Settings</span>
                </button>

                <div className="topbar-dropdown-divider" />

                <button
                  className="topbar-dropdown-item topbar-dropdown-item--danger"
                  onClick={handleLogout}
                >
                  <LogOut size={15} />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div
        className={`topbar-search-drawer ${isAdmin ? "topbar-search-drawer--admin" : ""} ${sidebarOpen ? "topbar-search-drawer--sidebar-open" : ""} ${searchOpen ? "topbar-search-drawer--open" : ""}`}
      >
        <div className="topbar-search-drawer-inner">
          <span className="topbar-search-icon">
            <Search size={15} />
          </span>
          <input
            type="text"
            placeholder={
              isAdmin
                ? "Search items, users, reports..."
                : "Search items, reports..."
            }
            autoFocus={searchOpen}
          />
        </div>
      </div>
    </>
  );
};

export default Topbar;
