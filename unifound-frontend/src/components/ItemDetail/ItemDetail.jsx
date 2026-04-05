import {
  MapPin,
  Tag,
  Calendar,
  User,
  PackageSearch,
  ArrowLeft,
  Clock,
  FileText,
  AlertCircle,
  CheckCircle2,
  Search,
  XCircle,
} from "lucide-react";
import "./ItemDetail.css";

const STATUS_CONFIG = {
  lost: {
    label: "Lost",
    className: "status--lost",
    icon: AlertCircle,
    description:
      "This item has been reported as lost and is currently being searched for.",
  },
  found: {
    label: "Found",
    className: "status--found",
    icon: Search,
    description:
      "This item has been found and is available for claiming at the reported location.",
  },
  claimed: {
    label: "Claimed",
    className: "status--claimed",
    icon: CheckCircle2,
    description: "This item has been claimed by its owner.",
  },
  resolved: {
    label: "Resolved",
    className: "status--resolved",
    icon: XCircle,
    description: "This case has been fully resolved and closed.",
  },
};

const MOCK_DETAIL = {
  description:
    "No additional description has been provided for this item. If you have more information, please contact the reporter directly or reach out to the Lost & Found office.",
  timeReported: "10:45 AM",
  contactEmail: "unifound@gmail.com",
  referenceNumber: "LF-2026-0042",
};

const ItemDetail = ({ item, onBack }) => {
  if (!item) return null;

  const status = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.lost;
  const StatusIcon = status.icon;

  const detail = item.detail ?? MOCK_DETAIL;

  return (
    <div className="item-detail-overlay">
      <div className="item-detail-container">
        <button className="item-detail-back" onClick={onBack}>
          <ArrowLeft size={16} />
          Back to List
        </button>

        <div className="item-detail-layout">
          <div className="item-detail-image-panel">
            <div className="item-detail-image-wrap">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="item-detail-img"
                />
              ) : (
                <div className="item-detail-img-placeholder">
                  <PackageSearch size={56} />
                  <span>No photo available</span>
                </div>
              )}
              <span className={`item-detail-badge ${status.className}`}>
                <span className="item-status-dot" />
                {status.label}
              </span>
            </div>

            <div className="item-detail-ref">
              <span className="item-detail-ref-label">Reference No.</span>
              <span className="item-detail-ref-value">
                {detail.referenceNumber}
              </span>
            </div>

            <div className={`item-detail-status-card ${status.className}-card`}>
              <StatusIcon size={16} />
              <p>{status.description}</p>
            </div>
          </div>

          <div className="item-detail-info-panel">
            <div className="item-detail-header">
              <h1 className="item-detail-name">{item.name}</h1>
              <p className="item-detail-category">{item.category}</p>
            </div>

            <div className="item-detail-section">
              <h2 className="item-detail-section-title">
                <FileText size={14} />
                Description
              </h2>
              <p className="item-detail-description">
                {item.description ?? detail.description}
              </p>
            </div>

            <div className="item-detail-section">
              <h2 className="item-detail-section-title">
                <Tag size={14} />
                Item Details
              </h2>
              <div className="item-detail-grid">
                <div className="item-detail-field">
                  <span className="item-detail-field-label">
                    <MapPin size={12} /> Location
                  </span>
                  <span className="item-detail-field-value">
                    {item.location}
                  </span>
                </div>
                <div className="item-detail-field">
                  <span className="item-detail-field-label">
                    <Calendar size={12} /> Date Reported
                  </span>
                  <span className="item-detail-field-value">
                    {item.dateReported}
                  </span>
                </div>
                <div className="item-detail-field">
                  <span className="item-detail-field-label">
                    <Clock size={12} /> Time Reported
                  </span>
                  <span className="item-detail-field-value">
                    {item.timeReported ?? detail.timeReported}
                  </span>
                </div>
                <div className="item-detail-field">
                  <span className="item-detail-field-label">
                    <User size={12} /> Reported By
                  </span>
                  <span className="item-detail-field-value">
                    {item.reporterName}
                  </span>
                </div>
              </div>
            </div>

            <div className="item-detail-section">
              <h2 className="item-detail-section-title">
                <AlertCircle size={14} />
                Contact Information
              </h2>
              <div className="item-detail-contact">
                <p className="item-detail-contact-label">
                  For inquiries, reach the Lost &amp; Found office:
                </p>
                <a
                  className="item-detail-contact-email"
                  href={`mailto:${item.contactEmail ?? detail.contactEmail}`}
                >
                  {item.contactEmail ?? detail.contactEmail}
                </a>
              </div>
            </div>

            <div className="item-detail-actions">
              <button className="item-detail-btn item-detail-btn--primary">
                {item.status === "lost" ? "I Found This!" : "This Is Mine"}
              </button>
              <button className="item-detail-btn item-detail-btn--secondary">
                Contact Reporter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;
