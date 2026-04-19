import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  Bell,
  Search,
  ChevronDown,
  Settings,
  X,
  User,
  LogOut,
  CheckCircle2,
  MessageSquare,
  AlertCircle,
  Clock,
  CheckCheck,
} from "lucide-react";
import { useSidebar } from "../../providers/SidebarProvider";
import { useAuth } from "../../providers/AuthProvider";
import { useNotifications } from "../../providers/NotificationsProvider";
import "./Topbar.css";

const API_URL = "http://localhost:5000";

const PAGE_TITLES = {
  "/browse-items": "Browse Items",
  "/report-item": "Report Item",
  "/my-reports": "My Reports",
  "/my-claims": "My Claims",
  "/notifications": "Notifications",
  "/settings": "Settings",
  "/profile": "Profile",
};

const NOTIF_ICONS = {
  claimed: CheckCircle2,
  message: MessageSquare,
  alert: AlertCircle,
};

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const Topbar = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);

  const { isOpen: sidebarOpen } = useSidebar();
  const { user, logout } = useAuth();
  const { unreadCount, refresh: refreshNotifCount } = useNotifications();
  const { pathname } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const mobileInputRef = useRef(null);

  const isMyReports = pathname === "/my-reports";
  const isBrowse = pathname === "/browse-items";
  const isSearchSynced = isMyReports || isBrowse;
  const pageTitle = PAGE_TITLES[pathname] ?? "UniFound";

  const [searchQuery, setSearchQuery] = useState(
    isSearchSynced ? (searchParams.get("search") ?? "") : "",
  );

  useEffect(() => {
    if (isSearchSynced) {
      setSearchQuery(searchParams.get("search") ?? "");
    } else {
      setSearchQuery("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const avatarInitials =
    user?.avatar_initials ||
    `${user?.first_name?.[0] || ""}${user?.last_name?.[0] || ""}`.toUpperCase() ||
    "?";

  const fullName = user ? `${user.first_name} ${user.last_name}` : "User";

  // Close user dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
    };
    if (dropdownOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  // Close notif dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target))
        setNotifOpen(false);
    };
    if (notifOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [notifOpen]);

  // Close both on route change
  useEffect(() => {
    setDropdownOpen(false);
    setNotifOpen(false);
  }, [pathname]);

  // Auto-focus mobile input
  useEffect(() => {
    if (searchOpen) setTimeout(() => mobileInputRef.current?.focus(), 50);
  }, [searchOpen]);

  // Fetch unread notifications when dropdown opens
  useEffect(() => {
    if (!notifOpen) return;
    const fetchNotifs = async () => {
      setNotifLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/notifications?limit=6`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const all = data.data?.notifications ?? [];
        setNotifs(all.filter((n) => !n.is_read));
      } catch {
        setNotifs([]);
      } finally {
        setNotifLoading(false);
      }
    };
    fetchNotifs();
  }, [notifOpen]);

  const markAllRead = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/api/notifications/read-all`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifs([]);
      refreshNotifCount?.();
    } catch {}
  };

  const handleNotifClick = async (notif) => {
    if (!notif.is_read) {
      try {
        const token = localStorage.getItem("token");
        await fetch(`${API_URL}/api/notifications/${notif.id}/read`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifs((prev) => prev.filter((n) => n.id !== notif.id));
        refreshNotifCount?.();
      } catch {}
    }
    setNotifOpen(false);
    if (notif.item_id) {
      notif.type === "message"
        ? navigate(`/my-reports?item=${notif.item_id}`)
        : navigate("/my-claims");
    }
  };

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate("/");
  };

  const submitSearch = (query) => {
    const trimmed = query.trim();
    if (isSearchSynced) {
      setSearchParams(trimmed ? { search: trimmed } : {}, { replace: true });
      setSearchOpen(false);
      return;
    }
    if (!trimmed) return;
    setSearchOpen(false);
    navigate(`/browse-items?search=${encodeURIComponent(trimmed)}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") submitSearch(searchQuery);
    if (e.key === "Escape") {
      setSearchOpen(false);
      if (!isSearchSynced) setSearchQuery("");
    }
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (isSearchSynced) {
      setSearchParams(val.trim() ? { search: val.trim() } : {}, {
        replace: true,
      });
    }
  };

  const dropdownUnread = notifs.filter((n) => !n.is_read).length;

  return (
    <>
      <header
        className={`topbar ${sidebarOpen ? "topbar--sidebar-open" : "topbar--sidebar-closed"}`}
      >
        <span className="topbar-title">{pageTitle}</span>

        {/* Desktop search */}
        <div className="topbar-search topbar-search--desktop">
          <input
            type="text"
            placeholder={
              isMyReports
                ? "Search your reports..."
                : "Search items, reports..."
            }
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
          />
          <button
            className="topbar-search-btn"
            aria-label="Search"
            onClick={() => submitSearch(searchQuery)}
          >
            <Search size={17} />
          </button>
        </div>

        <div className="topbar-actions">
          {/* Mobile search toggle */}
          <button
            className="topbar-icon-btn topbar-search-toggle"
            aria-label="Toggle search"
            onClick={() => setSearchOpen((p) => !p)}
          >
            {searchOpen ? <X size={17} /> : <Search size={17} />}
          </button>

          {/* Notification bell */}
          <div className="topbar-notif-wrap" ref={notifRef}>
            <button
              className={`topbar-icon-btn ${notifOpen ? "topbar-icon-btn--active" : ""}`}
              aria-label="Notifications"
              onClick={() => setNotifOpen((p) => !p)}
            >
              <Bell size={17} />
              {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
            </button>

            {notifOpen && (
              <div className="topbar-notif-dropdown">
                <div className="topbar-notif-header">
                  <span className="topbar-notif-title">
                    Notifications
                    {dropdownUnread > 0 && (
                      <span className="topbar-notif-count">
                        {dropdownUnread}
                      </span>
                    )}
                  </span>
                  {dropdownUnread > 0 && (
                    <button
                      className="topbar-notif-mark-all"
                      onClick={markAllRead}
                    >
                      <CheckCheck size={12} />
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="topbar-notif-divider" />

                <div className="topbar-notif-list">
                  {notifLoading ? (
                    <div className="topbar-notif-empty">
                      <Clock size={20} />
                      <span>Loading…</span>
                    </div>
                  ) : notifs.length === 0 ? (
                    <div className="topbar-notif-empty">
                      <Bell size={20} />
                      <span>No unread notifications</span>
                    </div>
                  ) : (
                    notifs.map((notif) => {
                      const Icon = NOTIF_ICONS[notif.type] ?? Bell;
                      return (
                        <button
                          key={notif.id}
                          className="topbar-notif-item topbar-notif-item--unread"
                          onClick={() => handleNotifClick(notif)}
                        >
                          <div
                            className={`topbar-notif-icon topbar-notif-icon--${notif.type}`}
                          >
                            <Icon size={13} />
                          </div>
                          <div className="topbar-notif-body">
                            <p className="topbar-notif-item-title">
                              {notif.title}
                            </p>
                            <p className="topbar-notif-item-body">
                              {notif.body}
                            </p>
                            <span className="topbar-notif-item-time">
                              {timeAgo(notif.created_at)}
                            </span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>

                <div className="topbar-notif-divider" />

                <button
                  className="topbar-notif-view-all"
                  onClick={() => {
                    setNotifOpen(false);
                    navigate("/notifications");
                  }}
                >
                  View all notifications
                </button>
              </div>
            )}
          </div>

          <div className="topbar-divider" />

          {/* User dropdown */}
          <div className="topbar-user-wrap" ref={dropdownRef}>
            <div
              className={`topbar-user ${dropdownOpen ? "topbar-user--active" : ""}`}
              onClick={() => setDropdownOpen((p) => !p)}
            >
              <div className="topbar-user-avatar">{avatarInitials}</div>
              <div className="topbar-user-info">
                <span className="topbar-user-name">{fullName}</span>
                <span className="topbar-user-role">{user?.role || "User"}</span>
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
                    navigate("/settings");
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

      {/* Mobile search drawer */}
      <div
        className={`topbar-search-drawer ${sidebarOpen ? "topbar-search-drawer--sidebar-open" : ""} ${searchOpen ? "topbar-search-drawer--open" : ""}`}
      >
        <div className="topbar-search-drawer-inner">
          <input
            ref={mobileInputRef}
            type="text"
            placeholder={
              isMyReports
                ? "Search your reports..."
                : "Search items, reports..."
            }
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
          />
          <button
            className="topbar-search-drawer-btn"
            aria-label="Search"
            onClick={() => submitSearch(searchQuery)}
          >
            <Search size={17} />
          </button>
        </div>
      </div>
    </>
  );
};

export default Topbar;
