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
  Pencil,
  Trash2,
} from "lucide-react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
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

// Mirrors the real ItemCard layout so the skeleton slots in seamlessly
const ItemCardSkeleton = () => (
  <div
    className="item-card"
    style={{ cursor: "default", pointerEvents: "none" }}
  >
    {/* Image area — same aspect-ratio: 4/3 and border-radius: 14px as .item-card-image */}
    <div
      style={{
        position: "relative",
        width: "100%",
        borderRadius: 14,
        aspectRatio: "4 / 3",
        overflow: "hidden",
      }}
    >
      <Skeleton height="100%" style={{ display: "block" }} />
    </div>

    {/* Body area — same padding as .item-card-body (14px 0 16px) */}
    <div style={{ padding: "14px 0 16px" }}>
      {/* Title — matches .item-card-name (14.5px bold, mb 10px) */}
      <Skeleton
        width="65%"
        height={14}
        style={{ marginBottom: 10, borderRadius: 6 }}
      />

      {/* 4 meta rows — matches .item-card-meta gap: 5px */}
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <Skeleton width="50%" height={12} style={{ borderRadius: 6 }} />
        <Skeleton width="60%" height={12} style={{ borderRadius: 6 }} />
        <Skeleton width="45%" height={12} style={{ borderRadius: 6 }} />
        <Skeleton width="55%" height={12} style={{ borderRadius: 6 }} />
      </div>
    </div>
  </div>
);

const ItemCard = ({ item, onClick, isOwn, onEdit, onDelete }) => {
  const status = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.lost;

  const handleActionClick = (e, action) => {
    e.stopPropagation();
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

  const deepLinkedRef = useRef(false);

  useEffect(() => {
    const itemIdFromUrl = searchParams.get("item");
    if (!itemIdFromUrl) return;

    const found = items.find((i) => String(i.id) === String(itemIdFromUrl));
    if (found) {
      deepLinkedRef.current = true;
      setSelectedItem(found);
      return;
    }

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
          image: raw.image ?? null,
        });
      } catch {
        /* silently fail */
      }
    };

    fetchById();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

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
      // silently fail
    } finally {
      setDeleting(false);
      setDeleteItem(null);
    }
  };

  const isOwn = (item) => {
    if (!user) return false;
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
      <SkeletonTheme baseColor="#e2e8f0" highlightColor="#f1f5f9">
        <div className={wrapperClass}>
          <div className="item-list">
            {Array.from({ length: 12 }).map((_, i) => (
              <ItemCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </SkeletonTheme>
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
