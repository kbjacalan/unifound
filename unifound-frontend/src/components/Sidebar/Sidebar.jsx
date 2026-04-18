import { useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  PackageSearch,
  PackagePlus,
  ClipboardList,
  ClipboardCheck,
  Bell,
  Menu,
} from "lucide-react";
import { useSidebar } from "../../providers/SidebarProvider";
import { useNotifications } from "../../providers/NotificationsProvider";
import Logo from "../../assets/logo.png";
import "./Sidebar.css";

const NAV_ITEMS = [
  { to: "/browse-items", icon: PackageSearch, label: "Browse Items" },
  { to: "/report-item", icon: PackagePlus, label: "Report Item" },
  { to: "/my-reports", icon: ClipboardList, label: "My Reports" },
  { to: "/my-claims", icon: ClipboardCheck, label: "My Claims" },
  { to: "/notifications", icon: Bell, label: "Notifications" },
];

const Sidebar = () => {
  const { isOpen, toggle, close } = useSidebar();
  const { unreadCount } = useNotifications();
  const sidebarRef = useRef(null);
  const hamburgerRef = useRef(null);

  const handleNavClick = () => {
    if (window.innerWidth <= 825) close();
  };

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        window.innerWidth <= 825 &&
        isOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target) &&
        !hamburgerRef.current.contains(e.target)
      ) {
        close();
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen, close]);

  return (
    <>
      <button
        ref={hamburgerRef}
        className="sidebar-hamburger"
        onClick={toggle}
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        <Menu size={18} />
      </button>

      <aside
        ref={sidebarRef}
        className={`sidebar ${isOpen ? "sidebar--open" : "sidebar--closed"}`}
      >
        <div className="sidebar-brand">
          <img src={Logo} className="brand-logo" alt="UniFound Logo" />
          <div className="brand-text">
            <p className="brand-name">
              Uni<span>Found</span>
            </p>
            <span className="brand-tagline">Lost &amp; Found Portal</span>
          </div>
        </div>

        <div className="sidebar-divider" />

        <p className="sidebar-section-label">Main Menu</p>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `sidebar-item ${isActive ? "active" : ""}`
              }
              onClick={handleNavClick}
            >
              <span className="item-icon">
                <Icon size={18} />
              </span>
              <span className="item-label">{label}</span>
              {to === "/notifications" && unreadCount > 0 && (
                <span className="item-badge">{unreadCount}</span>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
