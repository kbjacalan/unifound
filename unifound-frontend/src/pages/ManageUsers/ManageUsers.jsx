import { useState, useEffect, useCallback } from "react";
import { useSidebar } from "../../providers/SidebarProvider";
import ConfirmModal from "../../components/admin/ConfirmModal/ConfirmModal";
import {
  Search,
  Users,
  Trash2,
  ShieldCheck,
  UserCheck,
  UserX,
  X,
  Filter,
  ClipboardList,
  Loader2,
} from "lucide-react";
import "./ManageUsers.css";

const API_URL = "http://localhost:5000/api";

const ROLE_CONFIG = {
  Student: { className: "mu-role--student" },
  Staff: { className: "mu-role--staff" },
  Administrator: { className: "mu-role--admin" },
};

const FILTERS = ["All", "Student", "Staff", "Administrator"];

const ManageUsers = () => {
  const { isOpen: sidebarOpen } = useSidebar();

  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [modal, setModal] = useState({ open: false, targetId: null });

  // ── Fetch users ──────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({ limit: 50 });
      if (search) params.set("search", search);
      if (activeFilter !== "All") params.set("role", activeFilter);

      const res = await fetch(`${API_URL}/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok) {
        setUsers(data.data.users);
        setTotal(data.data.pagination.total);
      }
    } catch (err) {
      console.error("[ManageUsers] fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [search, activeFilter]);

  useEffect(() => {
    const debounce = setTimeout(fetchUsers, 300);
    return () => clearTimeout(debounce);
  }, [fetchUsers]);

  // ── Delete ───────────────────────────────────────────────────────────────
  const deleteUser = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
        setTotal((prev) => prev - 1);
      }
    } catch (err) {
      console.error("[ManageUsers] delete error:", err);
    }
  };

  // ── Verify / Unverify ────────────────────────────────────────────────────
  const toggleVerify = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/users/${id}/verify`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === id ? { ...u, is_verified: !currentStatus } : u,
          ),
        );
      }
    } catch (err) {
      console.error("[ManageUsers] verify error:", err);
    }
  };

  return (
    <div
      className={`mu-wrapper ${sidebarOpen ? "mu-wrapper--sidebar-open" : "mu-wrapper--sidebar-closed"}`}
    >
      <div className="mu-container">
        {/* Header */}
        <div className="mu-header">
          <div>
            <h1 className="mu-page-title">Manage Users</h1>
            <p className="mu-page-sub">
              {loading
                ? "Loading..."
                : `${total} registered user${total !== 1 ? "s" : ""} in the system`}
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="mu-toolbar">
          <div className="mu-search-wrap">
            <Search size={14} className="mu-search-icon" />
            <input
              className="mu-search"
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="mu-search-clear" onClick={() => setSearch("")}>
                <X size={13} />
              </button>
            )}
          </div>

          <div className="mu-filters">
            <Filter size={13} className="mu-filter-icon" />
            {FILTERS.map((f) => (
              <button
                key={f}
                className={`mu-filter-pill ${activeFilter === f ? "mu-filter-pill--active" : ""}`}
                onClick={() => setActiveFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="mu-table-wrap">
          {loading ? (
            <div className="mu-empty">
              <Loader2 size={32} className="mu-spinner" />
              <p>Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="mu-empty">
              <Users size={36} />
              <p>No users found</p>
              <span>Try adjusting your search or filter</span>
            </div>
          ) : (
            <table className="mu-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Reports</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, i) => {
                  const role = ROLE_CONFIG[user.role] ?? ROLE_CONFIG.Student;
                  const initials =
                    user.avatar_initials ||
                    `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase();
                  const fullName = `${user.first_name} ${user.last_name}`;
                  const joined = user.created_at
                    ? new Date(user.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—";

                  return (
                    <tr
                      key={user.id}
                      style={{ animationDelay: `${i * 0.04}s` }}
                    >
                      <td>
                        <div className="mu-user-cell">
                          <div
                            className={`mu-avatar ${user.role === "Administrator" ? "mu-avatar--admin" : ""}`}
                          >
                            {initials}
                          </div>
                          <div>
                            <span className="mu-user-name">{fullName}</span>
                            {user.is_verified ? (
                              <span className="mu-verified-badge">
                                ✓ Verified
                              </span>
                            ) : (
                              <span className="mu-unverified-badge">
                                Unverified
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="mu-td-secondary">{user.email}</td>
                      <td>
                        <span className={`mu-role-badge ${role.className}`}>
                          {user.role === "Administrator" && (
                            <ShieldCheck size={10} />
                          )}
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <div className="mu-reports-cell">
                          <ClipboardList size={12} />
                          {user.report_count ?? 0}
                        </div>
                      </td>
                      <td className="mu-td-secondary">{joined}</td>
                      <td>
                        <div className="mu-row-actions">
                          {/* Verify / Unverify toggle */}
                          <button
                            className={`mu-action-btn ${user.is_verified ? "mu-action-btn--unverify" : "mu-action-btn--verify"}`}
                            title={
                              user.is_verified ? "Unverify user" : "Verify user"
                            }
                            onClick={() =>
                              toggleVerify(user.id, user.is_verified)
                            }
                          >
                            {user.is_verified ? (
                              <UserX size={14} />
                            ) : (
                              <UserCheck size={14} />
                            )}
                          </button>

                          {/* Delete (not for admins) */}
                          {user.role !== "Administrator" && (
                            <button
                              className="mu-action-btn mu-action-btn--delete"
                              title="Delete user"
                              onClick={() =>
                                setModal({ open: true, targetId: user.id })
                              }
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, targetId: null })}
        onConfirm={() => deleteUser(modal.targetId)}
        title="Delete this user?"
        message="This will permanently remove the user and all their reports from the system."
        confirmLabel="Delete User"
        variant="danger"
      />
    </div>
  );
};

export default ManageUsers;
