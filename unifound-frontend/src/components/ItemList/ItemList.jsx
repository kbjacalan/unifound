import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  MapPin,
  Tag,
  Calendar,
  User,
  PackageSearch,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  Loader,
  Pencil,
  Trash2,
} from "lucide-react";
import { useAuth } from "../../providers/AuthProvider";
import { useSidebar } from "../../providers/SidebarProvider";
import ItemDetail from "../ItemDetail/ItemDetail";
import EditItemForm from "../EditItemForm/EditItemForm";
import ConfirmModal from "../ConfirmModal/ConfirmModal";
import "./ItemList.css";

const API_URL = import.meta.env.VITE_UNIFOUND_BACKEND_URL;

const STATUS_CONFIG = {
  lost: { label: "Lost", className: "status--lost" },
  found: { label: "Found", className: "status--found" },
  claimed: { label: "Claimed", className: "status--claimed" },
  resolved: { label: "Resolved", className: "status--resolved" },
};

const ItemCard = ({ item, onClick, isOwn, onEdit, onDelete }) => {
  const status = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.lost;

  const handleActionClick = (e, action) => {
    e.stopPropagation(); // prevent card click / opening detail
    action();
  };

  return (
    <div className="item-card" onClick={() => onClick(item)}>
      <div className="item-card-image">
        {item.image ? (
          <img src={item.image} alt={item.name} />
        ) : (
          <div className="item-card-image-placeholder">
            <PackageSearch size={30} />
          </div>
        )}
        <span className={`item-status-badge ${status.className}`}>
          <span className="item-status-dot" />
          {item.status_label || status.label}
        </span>

        {/* Owner action buttons — top-left corner */}
        {isOwn && (
          <div className="item-card-owner-actions">
            {item.status !== "claimed" && (
              <button
                className="item-card-action-btn item-card-action-btn--edit"
                title="Edit report"
                onClick={(e) => handleActionClick(e, onEdit)}
              >
                <Pencil size={11} />
              </button>
            )}
            <button
              className="item-card-action-btn item-card-action-btn--delete"
              title="Delete report"
              onClick={(e) => handleActionClick(e, onDelete)}
            >
              <Trash2 size={11} />
            </button>
          </div>
        )}
      </div>

      <div className="item-card-body">
        <h3 className="item-card-name">
          {item.name}
          {isOwn && <span className="item-card-own-dot" title="Your report" />}
        </h3>

        <div className="item-card-meta">
          <span className="item-meta-row">
            <Tag size={12} />
            {item.category}
          </span>
          <span className="item-meta-row">
            <MapPin size={12} />
            {item.location}
          </span>
          <span className="item-meta-row">
            <Calendar size={12} />
            {item.dateReported}
          </span>
          <span className="item-meta-row">
            <User size={12} />
            {item.reporterName}
          </span>
        </div>
      </div>
    </div>
  );
};

const ItemList = ({
  items = [],
  loading = false,
  error = null,
  pagination = { total: 0, page: 1, limit: 12, totalPages: 1 },
  onPageChange,
  onRetry,
  onItemsChanged,
  initialSelectedItem = null,
}) => {
  const { user } = useAuth();
  const { isOpen: sidebarOpen } = useSidebar();
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedItem, setSelectedItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Track whether the current selectedItem was opened via deep-link
  const deepLinkedRef = useRef(false);

  // Deep-link: read ?item=<id> from URL, find in list or fetch from API
  useEffect(() => {
    const itemIdFromUrl = searchParams.get("item");
    if (!itemIdFromUrl) return;

    // Try to find it in the already-loaded list first
    const found = items.find((i) => String(i.id) === String(itemIdFromUrl));
    if (found) {
      deepLinkedRef.current = true;
      setSelectedItem(found);
      return;
    }

    // Not in list yet (different page, or list still loading) — fetch directly
    const fetchById = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/items/${itemIdFromUrl}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        const raw = data.data?.item;
        if (!raw) return;
        deepLinkedRef.current = true;
        setSelectedItem({
          id: raw.id,
          name: raw.name,
          status: raw.status,
          status_label: raw.status_label,
          category: raw.category,
          location: raw.location,
          dateReported: raw.date_reported
            ? new Date(raw.date_reported).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "—",
          reporterId: raw.reporter_id ?? null,
          reporterName:
            raw.reporter_first_name && raw.reporter_last_name
              ? `${raw.reporter_first_name} ${raw.reporter_last_name}`
              : "Unknown",
          reporterEmail: raw.reporter_email ?? null,
          contactEmail: raw.contact_email ?? null,
          description: raw.description ?? "",
          referenceNumber: raw.reference_number ?? "—",
          image: raw.image ? `${API_URL}${raw.image}` : null,
        });
      } catch {
        /* silently fail */
      }
    };

    fetchById();
    // Only re-run when the URL param changes, not on every items[] update
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Back handler: clear ?item= param if we arrived via deep-link
  const handleBack = () => {
    setSelectedItem(null);
    if (deepLinkedRef.current) {
      deepLinkedRef.current = false;
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete("item");
          return next;
        },
        { replace: true },
      );
    }
    onItemsChanged?.();
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/items/${deleteItem.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete.");
      onItemsChanged?.();
    } catch {
      // silently fail; toast system could be added later
    } finally {
      setDeleting(false);
      setDeleteItem(null);
    }
  };

  // Determine ownership using reporter_id from token (user.id) vs item.reporterId
  // or fall back to email comparison if available
  const isOwn = (item) => {
    if (!user) return false;
    // Use Number() to avoid type mismatch (DB returns int, JSON parse may give string)
    if (item.reporterId != null && user.id != null)
      return Number(item.reporterId) === Number(user.id);
    if (item.reporterEmail && user.email)
      return item.reporterEmail.toLowerCase() === user.email.toLowerCase();
    return false;
  };

  if (selectedItem) {
    return <ItemDetail item={selectedItem} onBack={handleBack} />;
  }

  const wrapperClass = `item-list-wrapper ${
    sidebarOpen
      ? "item-list-wrapper--sidebar-open"
      : "item-list-wrapper--sidebar-closed"
  }`;

  if (loading) {
    return (
      <div className={wrapperClass}>
        <div className="item-list-empty">
          <Loader size={36} className="item-list-spinner" />
          <p>Loading items…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={wrapperClass}>
        <div className="item-list-empty">
          <AlertCircle size={40} />
          <p>Failed to load items</p>
          <span>{error}</span>
          {onRetry && (
            <button className="item-list-retry-btn" onClick={onRetry}>
              <RefreshCw size={14} />
              Try again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={wrapperClass}>
        {items.length === 0 ? (
          <div className="item-list-empty">
            <PackageSearch size={40} />
            <p>No items found</p>
            <span>Try adjusting your filters</span>
          </div>
        ) : (
          <>
            <div className="item-list">
              {items.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onClick={setSelectedItem}
                  isOwn={isOwn(item)}
                  onEdit={() => setEditItem(item)}
                  onDelete={() => setDeleteItem(item)}
                />
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="item-list-pagination">
                <button
                  className="item-list-page-btn"
                  disabled={pagination.page <= 1}
                  onClick={() => onPageChange?.(pagination.page - 1)}
                >
                  <ChevronLeft size={16} />
                </button>

                <span className="item-list-page-info">
                  Page {pagination.page} of {pagination.totalPages}
                  <span className="item-list-page-total">
                    ({pagination.total} item{pagination.total !== 1 ? "s" : ""})
                  </span>
                </span>

                <button
                  className="item-list-page-btn"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => onPageChange?.(pagination.page + 1)}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Quick-edit from card */}
      {editItem && (
        <EditItemForm
          item={{
            id: editItem.id,
            name: editItem.name,
            category: editItem.category,
            status: editItem.status,
            location: editItem.location,
            dateReported: editItem.dateReported,
            contactEmail: editItem.contactEmail ?? "",
            description: editItem.description ?? "",
            image: editItem.image ?? null,
            referenceNumber: editItem.referenceNumber ?? "—",
            reporterEmail: editItem.reporterEmail ?? null,
          }}
          onClose={() => setEditItem(null)}
          onSaved={() => {
            setEditItem(null);
            onItemsChanged?.();
          }}
        />
      )}

      {/* Delete confirmation from card */}
      <ConfirmModal
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        title="Delete this report?"
        message={`"${deleteItem?.name}" will be permanently removed. This action cannot be undone.`}
        confirmLabel={deleting ? "Deleting…" : "Yes, Delete"}
        cancelLabel="Cancel"
        variant="danger"
      />
    </>
  );
};

export default ItemList;
