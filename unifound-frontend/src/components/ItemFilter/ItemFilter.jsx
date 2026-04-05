import { useState } from "react";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { useSidebar } from "../../providers/SidebarProvider";
import "./ItemFilter.css";

const STATUSES = [
  { value: "all", label: "All Status" },
  { value: "lost", label: "Lost" },
  { value: "found", label: "Found" },
  { value: "claimed", label: "Claimed" },
  { value: "resolved", label: "Resolved" },
];

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "Accessories", label: "Accessories" },
  { value: "Identification", label: "Identification" },
  { value: "Electronics", label: "Electronics" },
  { value: "Personal Items", label: "Personal Items" },
  { value: "Books", label: "Books" },
  { value: "Clothing", label: "Clothing" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "name_asc", label: "Name A–Z" },
  { value: "name_desc", label: "Name Z–A" },
];

const STATUS_CHIP_CLASS = {
  all: "",
  lost: "chip--lost",
  found: "chip--found",
  claimed: "chip--claimed",
  resolved: "chip--resolved",
};

const ItemFilter = ({ filters = {}, onChange }) => {
  const { isOpen: sidebarOpen } = useSidebar();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const current = {
    status: "all",
    category: "all",
    sort: "newest",
    ...filters,
  };

  const update = (key, value) => onChange?.({ ...current, [key]: value });

  const hasActiveFilters =
    current.status !== "all" ||
    current.category !== "all" ||
    current.sort !== "newest";

  const clearAll = () =>
    onChange?.({ status: "all", category: "all", sort: "newest" });

  return (
    <div
      className={`item-filter-wrapper ${
        sidebarOpen
          ? "item-filter-wrapper--sidebar-open"
          : "item-filter-wrapper--sidebar-closed"
      }`}
    >
      <div className="item-filter-chips">
        <button
          className={`item-filter-advanced-btn ${showAdvanced ? "item-filter-advanced-btn--active" : ""}`}
          onClick={() => setShowAdvanced((v) => !v)}
          aria-expanded={showAdvanced}
        >
          <SlidersHorizontal size={14} />
          Filters
          <ChevronDown
            size={13}
            className={`item-filter-chevron ${showAdvanced ? "item-filter-chevron--open" : ""}`}
          />
        </button>

        {hasActiveFilters && (
          <button className="item-filter-clear-btn" onClick={clearAll}>
            <X size={13} />
            Clear
          </button>
        )}
        {STATUSES.map((s) => (
          <button
            key={s.value}
            onClick={() => update("status", s.value)}
            className={`item-filter-chip ${STATUS_CHIP_CLASS[s.value]} ${
              current.status === s.value ? "item-filter-chip--active" : ""
            }`}
          >
            {s.value !== "all" && (
              <span className={`chip-dot chip-dot--${s.value}`} />
            )}
            {s.label}
          </button>
        ))}
      </div>

      <div
        className={`item-filter-advanced ${showAdvanced ? "item-filter-advanced--open" : ""}`}
      >
        <div className="item-filter-advanced-inner">
          {/* Category */}
          <div className="item-filter-field">
            <label className="item-filter-label">Category</label>
            <div className="item-filter-select-wrap">
              <select
                className="item-filter-select"
                value={current.category}
                onChange={(e) => update("category", e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={13} className="item-filter-select-icon" />
            </div>
          </div>

          <div className="item-filter-field">
            <label className="item-filter-label">Sort By</label>
            <div className="item-filter-select-wrap">
              <select
                className="item-filter-select"
                value={current.sort}
                onChange={(e) => update("sort", e.target.value)}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={13} className="item-filter-select-icon" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemFilter;
