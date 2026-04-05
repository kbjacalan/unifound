import { useState } from "react";
import { MapPin, Tag, Calendar, User, PackageSearch } from "lucide-react";
import { useSidebar } from "../../providers/SidebarProvider";
import ItemDetail from "../ItemDetail/ItemDetail";
import "./ItemList.css";

const STATUS_CONFIG = {
  lost: { label: "Lost", className: "status--lost" },
  found: { label: "Found", className: "status--found" },
  claimed: { label: "Claimed", className: "status--claimed" },
  resolved: { label: "Resolved", className: "status--resolved" },
};

const ItemCard = ({ item, onClick }) => {
  const status = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.lost;

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
          {status.label}
        </span>
      </div>

      <div className="item-card-body">
        <h3 className="item-card-name">{item.name}</h3>

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

const ItemList = ({ items = MOCK_ITEMS }) => {
  const { isOpen: sidebarOpen } = useSidebar();
  const [selectedItem, setSelectedItem] = useState(null);

  if (selectedItem) {
    return (
      <ItemDetail item={selectedItem} onBack={() => setSelectedItem(null)} />
    );
  }

  return (
    <div
      className={`item-list-wrapper ${
        sidebarOpen
          ? "item-list-wrapper--sidebar-open"
          : "item-list-wrapper--sidebar-closed"
      }`}
    >
      {items.length === 0 ? (
        <div className="item-list-empty">
          <PackageSearch size={40} />
          <p>No items found</p>
          <span>Try adjusting your filters</span>
        </div>
      ) : (
        <div className="item-list">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} onClick={setSelectedItem} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ItemList;
