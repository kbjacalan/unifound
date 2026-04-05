import { useState } from "react";
import { useSidebar } from "../../providers/SidebarProvider";
import {
  CheckCircle2,
  Search,
  MapPin,
  Calendar,
  User,
  X,
  Filter,
} from "lucide-react";
import "./ResolvedCases.css";

const MOCK_RESOLVED = [
  {
    id: 1,
    name: "AirPods Pro Case",
    category: "Electronics",
    location: "Gym",
    reporter: "Carlo R.",
    resolvedDate: "Mar 27, 2026",
    ref: "LF-2026-0038",
    daysToResolve: 2,
  },
  {
    id: 2,
    name: "Scientific Calculator",
    category: "Books & Stationery",
    location: "Room 204",
    reporter: "Mark D.",
    resolvedDate: "Mar 25, 2026",
    ref: "LF-2026-0030",
    daysToResolve: 5,
  },
  {
    id: 3,
    name: "Student ID - Rina B.",
    category: "ID & Cards",
    location: "Registrar",
    reporter: "Rina B.",
    resolvedDate: "Mar 20, 2026",
    ref: "LF-2026-0022",
    daysToResolve: 1,
  },
  {
    id: 4,
    name: "Laptop Charger",
    category: "Electronics",
    location: "Library 3F",
    reporter: "Jose L.",
    resolvedDate: "Mar 18, 2026",
    ref: "LF-2026-0019",
    daysToResolve: 3,
  },
  {
    id: 5,
    name: "Gold Bracelet",
    category: "Jewelry",
    location: "Cafeteria",
    reporter: "Ana M.",
    resolvedDate: "Mar 15, 2026",
    ref: "LF-2026-0015",
    daysToResolve: 4,
  },
  {
    id: 6,
    name: "Blue Backpack",
    category: "Bags & Wallets",
    location: "Eng. Building",
    reporter: "Pia C.",
    resolvedDate: "Mar 10, 2026",
    ref: "LF-2026-0010",
    daysToResolve: 7,
  },
];

const ResolvedCases = () => {
  const { isOpen: sidebarOpen } = useSidebar();
  const [search, setSearch] = useState("");

  const filtered = MOCK_RESOLVED.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.ref.toLowerCase().includes(search.toLowerCase()) ||
      c.reporter.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div
      className={`rc-wrapper ${sidebarOpen ? "rc-wrapper--sidebar-open" : "rc-wrapper--sidebar-closed"}`}
    >
      <div className="rc-container">
        <div className="rc-header">
          <div className="rc-header-left">
            <div className="rc-header-icon">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h1 className="rc-page-title">Resolved Cases</h1>
              <p className="rc-page-sub">
                {MOCK_RESOLVED.length} cases successfully closed
              </p>
            </div>
          </div>
          <div className="rc-search-wrap">
            <Search size={14} className="rc-search-icon" />
            <input
              className="rc-search"
              type="text"
              placeholder="Search resolved cases..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="rc-search-clear" onClick={() => setSearch("")}>
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rc-empty">
            <CheckCircle2 size={36} />
            <p>No resolved cases found</p>
          </div>
        ) : (
          <div className="rc-list">
            {filtered.map((item, i) => (
              <div
                className="rc-item"
                key={item.id}
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <div className="rc-check-icon">
                  <CheckCircle2 size={18} />
                </div>
                <div className="rc-item-info">
                  <div className="rc-item-top">
                    <p className="rc-item-name">{item.name}</p>
                    <span className="rc-ref">{item.ref}</span>
                  </div>
                  <div className="rc-item-meta">
                    <span className="rc-meta-row">
                      <Filter size={11} />
                      {item.category}
                    </span>
                    <span className="rc-meta-row">
                      <MapPin size={11} />
                      {item.location}
                    </span>
                    <span className="rc-meta-row">
                      <User size={11} />
                      {item.reporter}
                    </span>
                    <span className="rc-meta-row">
                      <Calendar size={11} />
                      {item.resolvedDate}
                    </span>
                  </div>
                </div>
                <div className="rc-days-badge">
                  <span className="rc-days-value">{item.daysToResolve}d</span>
                  <span className="rc-days-label">to resolve</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResolvedCases;
