import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Tag,
  MapPin,
  Calendar,
  User,
  Mail,
  FileText,
  Upload,
  X,
  PackageSearch,
  Send,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useSidebar } from "../../providers/SidebarProvider";
import { useAuth } from "../../providers/AuthProvider";
import "./ReportItem.css";

const API_URL = "http://localhost:5000";

const CATEGORIES = [
  "Electronics",
  "Clothing & Accessories",
  "Bags & Wallets",
  "Books & Stationery",
  "Keys",
  "Jewelry",
  "ID & Cards",
  "Sports & Equipment",
  "Other",
];

const STATUS_OPTIONS = [
  { value: "lost", label: "Lost", description: "I lost this item" },
  { value: "found", label: "Found", description: "I found this item" },
];

const FormField = ({ label, icon: Icon, required, error, children }) => (
  <div className={`rif-field ${error ? "rif-field--error" : ""}`}>
    <label className="rif-label">
      <span className="rif-label-icon">
        <Icon size={12} />
      </span>
      {label}
      {required && <span className="rif-required">*</span>}
    </label>
    {children}
    {error && (
      <span className="rif-error-msg">
        <AlertCircle size={11} /> {error}
      </span>
    )}
  </div>
);

const ReportItem = ({ onSubmit, onCancel }) => {
  const { isOpen: sidebarOpen } = useSidebar();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate("/browse-items");
    }
  };

  const fullName = user
    ? `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim()
    : "";

  const INITIAL_FORM = {
    status: "lost",
    name: "",
    category: "",
    location: "",
    dateReported: "",
    reporterName: fullName,
    contactEmail: "",
    description: "",
    image: null,
  };

  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const fileInputRef = useRef(null);

  const set = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: null }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    set("image", file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    set("image", null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Item name is required";
    if (!form.category) errs.category = "Please select a category";
    if (!form.location.trim()) errs.location = "Location is required";
    if (!form.dateReported) errs.dateReported = "Date is required";
    if (!form.reporterName.trim()) errs.reporterName = "Your name is required";
    if (!form.contactEmail.trim()) {
      errs.contactEmail = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail)) {
      errs.contactEmail = "Enter a valid email address";
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      // Use FormData so the image file can be sent alongside text fields
      const formData = new FormData();
      formData.append("status", form.status);
      formData.append("name", form.name);
      formData.append("category", form.category);
      formData.append("location", form.location);
      formData.append("dateReported", form.dateReported);
      formData.append("contactEmail", form.contactEmail);
      formData.append("description", form.description);
      if (form.image) formData.append("image", form.image);

      const res = await fetch(`${API_URL}/api/items`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        // Do NOT set Content-Type — browser sets it with boundary for multipart
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        // Field-level errors from backend
        if (data.errors) setErrors(data.errors);
        setApiError(
          data.message || "Failed to submit report. Please try again.",
        );
        return;
      }

      setSubmitted(true);
      onSubmit?.(data.data.item);
    } catch (err) {
      setApiError("Cannot connect to server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div
        className={`rif-wrapper ${sidebarOpen ? "rif-wrapper--sidebar-open" : "rif-wrapper--sidebar-closed"}`}
      >
        <div className="rif-success">
          <div className="rif-success-icon">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="rif-success-title">Report Submitted!</h2>
          <p className="rif-success-body">
            Your {form.status} item report for <strong>{form.name}</strong> has
            been submitted. We'll get back to you at{" "}
            <strong>{form.contactEmail}</strong>.
          </p>
          <button
            className="rif-btn rif-btn--primary"
            onClick={() => {
              setForm({ ...INITIAL_FORM, reporterName: fullName });
              setImagePreview(null);
              setSubmitted(false);
            }}
          >
            Submit Another Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rif-wrapper ${sidebarOpen ? "rif-wrapper--sidebar-open" : "rif-wrapper--sidebar-closed"}`}
    >
      <div className="rif-container">
        <div className="rif-header">
          <div className="rif-header-icon">
            <PackageSearch size={22} />
          </div>
          <div>
            <h1 className="rif-title">Report an Item</h1>
            <p className="rif-subtitle">
              Fill in the details below to report a lost or found item.
            </p>
          </div>
        </div>

        <form className="rif-form" onSubmit={handleSubmit} noValidate>
          <div className="rif-status-toggle">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`rif-status-btn rif-status-btn--${opt.value} ${
                  form.status === opt.value ? "rif-status-btn--active" : ""
                }`}
                onClick={() => set("status", opt.value)}
              >
                <span className="rif-status-label">{opt.label}</span>
                <span className="rif-status-desc">{opt.description}</span>
              </button>
            ))}
          </div>

          <div className="rif-image-upload">
            <span className="rif-label">
              <span className="rif-label-icon">
                <Upload size={12} />
              </span>
              Photo
              <span className="rif-optional">(optional)</span>
            </span>

            {imagePreview ? (
              <div className="rif-image-preview-wrap">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="rif-image-preview"
                />
                <button
                  type="button"
                  className="rif-image-remove"
                  onClick={removeImage}
                  aria-label="Remove image"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="rif-image-dropzone"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={22} />
                <span>Click to upload a photo</span>
                <span className="rif-image-hint">PNG, JPG up to 10MB</span>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="rif-input-hidden"
              onChange={handleImageChange}
            />
          </div>

          <div className="rif-grid">
            <FormField
              label="Item Name"
              icon={Tag}
              required
              error={errors.name}
            >
              <input
                type="text"
                className="rif-input"
                placeholder="e.g. Black leather wallet"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </FormField>

            <FormField
              label="Category"
              icon={Tag}
              required
              error={errors.category}
            >
              <select
                className="rif-input rif-select"
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField
              label="Location"
              icon={MapPin}
              required
              error={errors.location}
            >
              <input
                type="text"
                className="rif-input"
                placeholder="e.g. Library 2nd Floor"
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
              />
            </FormField>

            <FormField
              label="Date"
              icon={Calendar}
              required
              error={errors.dateReported}
            >
              <input
                type="date"
                className="rif-input"
                value={form.dateReported}
                onChange={(e) => set("dateReported", e.target.value)}
              />
            </FormField>

            <FormField
              label="Your Name"
              icon={User}
              required
              error={errors.reporterName}
            >
              <input
                type="text"
                className="rif-input rif-input--readonly"
                value={form.reporterName}
                readOnly
                tabIndex={-1}
              />
            </FormField>

            <FormField
              label="Contact Email"
              icon={Mail}
              required
              error={errors.contactEmail}
            >
              <input
                type="email"
                className="rif-input"
                placeholder="you@example.com"
                value={form.contactEmail}
                onChange={(e) => set("contactEmail", e.target.value)}
              />
            </FormField>
          </div>

          <FormField
            label="Description"
            icon={FileText}
            error={errors.description}
          >
            <textarea
              className="rif-input rif-textarea"
              placeholder="Describe the item in detail — color, brand, distinguishing marks, etc."
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={4}
            />
          </FormField>

          {/* API Error */}
          {apiError && (
            <div className="rif-api-error">
              <AlertCircle size={14} />
              {apiError}
            </div>
          )}

          <div className="rif-actions">
            <button
              type="button"
              className="rif-btn rif-btn--secondary"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rif-btn rif-btn--primary"
              disabled={loading}
            >
              <Send size={14} />
              {loading ? "Submitting..." : "Submit Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportItem;
