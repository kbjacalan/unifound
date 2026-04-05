import { useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  PackageSearch,
  PackagePlus,
  ClipboardList,
  Bell,
  Menu,
  Users,
  CheckCircle2,
  BarChart2,
  Sun,
  Moon,
} from "lucide-react";
import { useSidebar } from "../../providers/SidebarProvider";
import { useAuth } from "../../providers/AuthProvider";
import Logo from "../../assets/logo.png";
import LogoRed from "../../assets/logo-red.png";
import "./Sidebar.css";

const USER_NAV = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/browse-items", icon: PackageSearch, label: "Browse Items" },
  { to: "/report-item", icon: PackagePlus, label: "Report Item" },
  { to: "/my-reports", icon: ClipboardList, label: "My Reports" },
  { to: "/notifications", icon: Bell, label: "Notifications", badge: 3 },
];

const ADMIN_NAV = [
  { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/manage-items", icon: PackageSearch, label: "Manage Items" },
  { to: "/admin/manage-users", icon: Users, label: "Manage Users" },
  { to: "/admin/resolved-cases", icon: CheckCircle2, label: "Resolved Cases" },
  { to: "/admin/analytics", icon: BarChart2, label: "Analytics" },
  { to: "/admin/notifications", icon: Bell, label: "Notifications", badge: 5 },
];

const Sidebar = () => {
  const { isOpen, toggle, close } = useSidebar();
  const { user } = useAuth();
  const sidebarRef = useRef(null);
  const hamburgerRef = useRef(null);

  const isAdmin = user?.role === "Administrator";
  const navItems = isAdmin ? ADMIN_NAV : USER_NAV;
  const tagline = isAdmin ? "Admin Panel" : "Lost & Found Portal";

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
        className={`sidebar-hamburger ${isAdmin ? "sidebar-hamburger--admin" : ""}`}
        onClick={toggle}
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        <Menu size={18} />
      </button>

      <aside
        ref={sidebarRef}
        className={`sidebar ${isOpen ? "sidebar--open" : "sidebar--closed"} ${isAdmin ? "sidebar--admin" : ""}`}
      >
        <div className="sidebar-brand">
          <img
            src={isAdmin ? LogoRed : Logo}
            className="brand-logo"
            alt="UniFound Logo"
          />
          <div className="brand-text">
            <p className="brand-name">
              Uni<span>Found</span>
            </p>
            <span
              className={`brand-tagline ${isAdmin ? "brand-tagline--admin" : ""}`}
            >
              {tagline}
            </span>
          </div>
        </div>

        <div className="sidebar-divider" />

        <p className="sidebar-section-label">
          {isAdmin ? "Management" : "Main Menu"}
        </p>

        <nav className="sidebar-nav">
          {navItems.map(({ to, icon: Icon, label, badge }) => (
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
              {badge && <span className="item-badge">{badge}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-spacer" />
        <div className="sidebar-divider" />

        <div className="sidebar-theme-toggle">
          <span className="sidebar-theme-label">Dark Mode</span>
          <button className="sidebar-theme-btn">
            <span className="sidebar-theme-knob" />
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
