import { AlertTriangle, Clock, MapPin, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./UnclaimedItemsAlert.css";

const UNCLAIMED = [
  {
    id: 1,
    name: "Samsung Galaxy Watch",
    location: "Eng. Building",
    daysLeft: 3,
    ref: "LF-2026-0035",
  },
  {
    id: 2,
    name: "Red Lanyard Keys",
    location: "Lobby",
    daysLeft: 1,
    ref: "LF-2026-0033",
  },
  {
    id: 3,
    name: "Eyeglasses Case",
    location: "Canteen",
    daysLeft: 5,
    ref: "LF-2026-0029",
  },
];

const UnclaimedItemsAlert = () => {
  const navigate = useNavigate();

  return (
    <div className="uia-card">
      <div className="uia-header">
        <div className="uia-header-left">
          <div className="uia-alert-icon">
            <AlertTriangle size={18} />
          </div>
          <div>
            <h2 className="uia-title">Unclaimed Items Alert</h2>
            <p className="uia-sub">
              {UNCLAIMED.length} items nearing the turnover deadline
            </p>
          </div>
        </div>
        <button
          className="uia-view-all"
          onClick={() => navigate("/admin/manage-items")}
        >
          Manage <ArrowRight size={13} />
        </button>
      </div>

      <div className="uia-list">
        {UNCLAIMED.map((item, i) => (
          <div
            className={`uia-item ${item.daysLeft <= 2 ? "uia-item--critical" : ""}`}
            key={item.id}
            style={{ animationDelay: `${i * 0.07}s` }}
          >
            <div
              className={`uia-days-badge ${item.daysLeft <= 2 ? "uia-days-badge--critical" : ""}`}
            >
              <Clock size={11} />
              {item.daysLeft}d left
            </div>
            <div className="uia-item-info">
              <p className="uia-item-name">{item.name}</p>
              <div className="uia-item-meta">
                <span>
                  <MapPin size={11} />
                  {item.location}
                </span>
                <span className="uia-ref">{item.ref}</span>
              </div>
            </div>
            <button
              className="uia-action-btn"
              onClick={() => navigate("/admin/manage-items")}
            >
              Review
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UnclaimedItemsAlert;
