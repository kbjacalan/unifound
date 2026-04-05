import { useState, useEffect, useCallback } from "react";
import { useSidebar } from "../../providers/SidebarProvider";
import ConfirmModal from "../../components/admin/ConfirmModal/ConfirmModal";
import {
  Search,
  Filter,
  Trash2,
  Edit2,
  CheckCircle2,
  PackageSearch,
  X,
  Loader2,
} from "lucide-react";
import "./ManageItems.css";

const API_URL = "http://localhost:5000/api";

const STATUS_CONFIG = {
  lost: { label: "Lost", className: "mi-status--lost" },
  found: { label: "Found", className: "mi-status--found" },
  claimed: { label: "Claimed", className: "mi-status--claimed" },
  resolved: { label: "Resolved", className: "mi-status--resolved" },
};

const FILTERS = ["All", "Lost", "Found", "Claimed", "Resolved"];

const ManageItems = () => {
  const { isOpen: sidebarOpen } = useSidebar();

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [selected, setSelected] = useState([]);
  const [modal, setModal] = useState({
    open: false,
    type: null,
    targetId: null,
  });

  // ── Helpers ────────────────────────────────────────────────────────────
  const token = () => localStorage.getItem("token");

  const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token()}`,
  });

  // ── Fetch ──────────────────────────────────────────────────────────────
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: 50 });
      if (search) params.set("search", search);
      if (activeFilter !== "All")
        params.set("status", activeFilter.toLowerCase());

      const res = await fetch(`${API_URL}/admin/items?${params}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();

      if (res.ok) {
        setItems(data.data.items);
        setTotal(data.data.pagination.total);
      }
    } catch (err) {
      console.error("[ManageItems] fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [search, activeFilter]);

  useEffect(() => {
    const debounce = setTimeout(fetchItems, 300);
    return () => clearTimeout(debounce);
  }, [fetchItems]);

  // ── Selection ──────────────────────────────────────────────────────────
  const toggleSelect = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );

  const toggleAll = () =>
    setSelected(selected.length === items.length ? [] : items.map((i) => i.id));

  // ── Resolve (status → resolved) ────────────────────────────────────────
  const resolveItem = async (id) => {
    try {
      const res = await fetch(`${API_URL}/admin/items/${id}/status`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ status: "resolved" }),
      });
      if (res.ok) {
        setItems((prev) =>
          prev.map((i) =>
            i.id === id
              ? { ...i, status: "resolved", status_label: "Resolved" }
              : i,
          ),
        );
      }
    } catch (err) {
      console.error("[ManageItems] resolve error:", err);
    }
  };

  // ── Delete single ──────────────────────────────────────────────────────
  const deleteItem = async (id) => {
    try {
      const res = await fetch(`${API_URL}/admin/items/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== id));
        setTotal((prev) => prev - 1);
      }
    } catch (err) {
      console.error("[ManageItems] delete error:", err);
    }
  };

  // ── Bulk delete ────────────────────────────────────────────────────────
  const deleteSelected = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/items/bulk`, {
        method: "DELETE",
        headers: authHeaders(),
        body: JSON.stringify({ ids: selected }),
      });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => !selected.includes(i.id)));
        setTotal((prev) => prev - selected.length);
        setSelected([]);
      }
    } catch (err) {
      console.error("[ManageItems] bulk delete error:", err);
    }
  };

  // ── Format date ────────────────────────────────────────────────────────
  const fmt = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "—";

  return (
    <div
      className={`mi-wrapper ${sidebarOpen ? "mi-wrapper--sidebar-open" : "mi-wrapper--sidebar-closed"}`}
    >
      <div className="mi-container">
        {/* Header */}
        <div className="mi-header">
          <div>
            <h1 className="mi-page-title">Manage Items</h1>
            <p className="mi-page-sub">
              {loading
                ? "Loading..."
                : `${total} total report${total !== 1 ? "s" : ""} in the system`}
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="mi-toolbar">
          <div className="mi-search-wrap">
            <Search size={14} className="mi-search-icon" />
            <input
              className="mi-search"
              type="text"
              placeholder="Search by name, ref, reporter..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="mi-search-clear" onClick={() => setSearch("")}>
                <X size={13} />
              </button>
            )}
          </div>

          <div className="mi-filters">
            <Filter size={13} className="mi-filter-icon" />
            {FILTERS.map((f) => (
              <button
                key={f}
                className={`mi-filter-pill ${activeFilter === f ? "mi-filter-pill--active" : ""}`}
                onClick={() => {
                  setActiveFilter(f);
                  setSelected([]);
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Bulk bar */}
        {selected.length > 0 && (
          <div className="mi-bulk-bar">
            <span>
              {selected.length} item{selected.length > 1 ? "s" : ""} selected
            </span>
            <div className="mi-bulk-actions">
              <button
                className="mi-bulk-btn mi-bulk-btn--danger"
                onClick={() =>
                  setModal({ open: true, type: "bulk-delete", targetId: null })
                }
              >
                <Trash2 size={13} /> Delete Selected
              </button>
              <button
                className="mi-bulk-btn mi-bulk-btn--cancel"
                onClick={() => setSelected([])}
              >
                <X size={13} /> Clear
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="mi-table-wrap">
          {loading ? (
            <div className="mi-empty">
              <Loader2 size={32} className="mi-spinner" />
              <p>Loading items...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="mi-empty">
              <PackageSearch size={36} />
              <p>No items found</p>
              <span>Try adjusting your search or filter</span>
            </div>
          ) : (
            <table className="mi-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      className="mi-checkbox"
                      checked={
                        selected.length === items.length && items.length > 0
                      }
                      onChange={toggleAll}
                    />
                  </th>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Reporter</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => {
                  const status =
                    STATUS_CONFIG[item.status] ?? STATUS_CONFIG.lost;
                  return (
                    <tr
                      key={item.id}
                      className={
                        selected.includes(item.id) ? "mi-row--selected" : ""
                      }
                      style={{ animationDelay: `${i * 0.04}s` }}
                    >
                      <td>
                        <input
                          type="checkbox"
                          className="mi-checkbox"
                          checked={selected.includes(item.id)}
                          onChange={() => toggleSelect(item.id)}
                        />
                      </td>
                      <td>
                        <div className="mi-item-cell">
                          <p className="mi-item-name">{item.name}</p>
                          <span className="mi-item-ref">
                            {item.reference_number}
                          </span>
                        </div>
                      </td>
                      <td className="mi-td-secondary">{item.category}</td>
                      <td className="mi-td-secondary">{item.location}</td>
                      <td className="mi-td-secondary">{item.reporter_name}</td>
                      <td className="mi-td-secondary">
                        {fmt(item.date_reported)}
                      </td>
                      <td>
                        <span className={`mi-status-badge ${status.className}`}>
                          <span className="mi-status-dot" />
                          {status.label}
                        </span>
                      </td>
                      <td>
                        <div className="mi-row-actions">
                          {item.status !== "resolved" && (
                            <button
                              className="mi-action-btn mi-action-btn--resolve"
                              title="Mark resolved"
                              onClick={() => resolveItem(item.id)}
                            >
                              <CheckCircle2 size={14} />
                            </button>
                          )}
                          <button
                            className="mi-action-btn mi-action-btn--edit"
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="mi-action-btn mi-action-btn--delete"
                            title="Delete"
                            onClick={() =>
                              setModal({
                                open: true,
                                type: "delete",
                                targetId: item.id,
                              })
                            }
                          >
                            <Trash2 size={14} />
                          </button>
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
        onClose={() => setModal({ open: false, type: null, targetId: null })}
        onConfirm={() => {
          if (modal.type === "delete") deleteItem(modal.targetId);
          if (modal.type === "bulk-delete") deleteSelected();
        }}
        title={
          modal.type === "bulk-delete"
            ? `Delete ${selected.length} items?`
            : "Delete this item?"
        }
        message="This will permanently remove the report from the system. This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
};

export default ManageItems;
