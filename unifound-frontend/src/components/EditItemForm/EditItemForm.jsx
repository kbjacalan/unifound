import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Upload,
  Loader,
  AlertCircle,
  CheckCircle2,
  ImagePlus,
  Trash2,
} from "lucide-react";
import "./EditItemForm.css";

const API_URL = import.meta.env.VITE_UNIFOUND_BACKEND_URL;

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

const STATUSES = [
  { value: "lost", label: "Lost" },
  { value: "found", label: "Found" },
];

const EditItemForm = ({ item, onClose, onSaved }) => {
  const [form, setForm] = useState({
    name: item.name ?? "",
    category: item.category ?? "",
    status: item.status ?? "lost",
    location: item.location ?? "",
    dateReported: item.dateReported
      ? (() => {
          // Convert "Apr 12, 2025" -> "2025-04-12" for date input
          const d = new Date(item.dateReported);
          if (!isNaN(d)) return d.toISOString().split("T")[0];
          return "";
        })()
      : "",
    contactEmail: item.contactEmail ?? item.reporterEmail ?? "",
    description: item.description ?? "",
  });

  // If the description is the default placeholder text, clear it
  const isPlaceholder = form.description.startsWith(
    "No additional description",
  );
  if (isPlaceholder && form.description === item.description) {
    form.description = "";
  }

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(item.image ?? null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Item name is required.";
    if (!form.category) errs.category = "Category is required.";
    if (!form.location.trim()) errs.location = "Location is required.";
    if (!form.dateReported) errs.dateReported = "Date is required.";
    if (!form.contactEmail.trim())
      errs.contactEmail = "Contact email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail))
      errs.contactEmail = "Invalid email address.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      const token = localStorage.getItem("token");
      const body = new FormData();
      body.append("name", form.name.trim());
      body.append("category", form.category);
      body.append("status", form.status);
      body.append("location", form.location.trim());
      body.append("dateReported", form.dateReported);
      body.append("contactEmail", form.contactEmail.trim());
      body.append("description", form.description.trim());
      if (imageFile) body.append("image", imageFile);

      const res = await fetch(`${API_URL}/api/items/${item.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body,
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.errors) setErrors(data.errors);
        else setErrors({ _general: data.message || "Failed to update item." });
        return;
      }

      setSuccessMsg("Item updated successfully!");
      setTimeout(() => {
        onSaved(data.data?.item);
        onClose();
      }, 1200);
    } catch {
      setErrors({ _general: "Network error. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="eif-overlay" onClick={onClose}>
      <div className="eif-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="eif-header">
          <div className="eif-header-text">
            <h2 className="eif-title">Edit Report</h2>
            <p className="eif-subtitle">Ref: {item.referenceNumber}</p>
          </div>
          <button className="eif-close" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        {/* Success banner */}
        {successMsg && (
          <div className="eif-success-banner">
            <CheckCircle2 size={15} />
            {successMsg}
          </div>
        )}

        {/* General error */}
        {errors._general && (
          <div className="eif-error-banner">
            <AlertCircle size={15} />
            {errors._general}
          </div>
        )}

        <form className="eif-form" onSubmit={handleSubmit}>
          {/* Image upload */}
          <div className="eif-image-section">
            <div
              className="eif-image-drop"
              onClick={() => fileInputRef.current?.click()}
              style={{ cursor: "pointer" }}
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="eif-image-preview"
                />
              ) : (
                <div className="eif-image-empty">
                  <ImagePlus size={28} />
                  <span>Click to upload photo</span>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="eif-file-input"
              onChange={handleImageChange}
            />
            {imagePreview && (
              <button
                type="button"
                className="eif-remove-image"
                onClick={handleRemoveImage}
              >
                <Trash2 size={12} />
                Remove photo
              </button>
            )}
          </div>

          {/* Row: Name + Category */}
          <div className="eif-row">
            <div className="eif-field">
              <label className="eif-label">Item Name</label>
              <input
                className={`eif-input ${errors.name ? "eif-input--error" : ""}`}
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Black Umbrella"
              />
              {errors.name && (
                <span className="eif-field-error">{errors.name}</span>
              )}
            </div>
            <div className="eif-field">
              <label className="eif-label">Category</label>
              <select
                className={`eif-select ${errors.category ? "eif-input--error" : ""}`}
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                <option value="">Select category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {errors.category && (
                <span className="eif-field-error">{errors.category}</span>
              )}
            </div>
          </div>

          {/* Row: Status + Date */}
          <div className="eif-row">
            <div className="eif-field">
              <label className="eif-label">Status</label>
              <select
                className="eif-select"
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="eif-field">
              <label className="eif-label">Date Reported</label>
              <input
                className={`eif-input ${errors.dateReported ? "eif-input--error" : ""}`}
                name="dateReported"
                type="date"
                value={form.dateReported}
                onChange={handleChange}
              />
              {errors.dateReported && (
                <span className="eif-field-error">{errors.dateReported}</span>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="eif-field">
            <label className="eif-label">Location</label>
            <input
              className={`eif-input ${errors.location ? "eif-input--error" : ""}`}
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="e.g. Library 2nd Floor"
            />
            {errors.location && (
              <span className="eif-field-error">{errors.location}</span>
            )}
          </div>

          {/* Contact Email */}
          <div className="eif-field">
            <label className="eif-label">Contact Email</label>
            <input
              className={`eif-input ${errors.contactEmail ? "eif-input--error" : ""}`}
              name="contactEmail"
              type="email"
              value={form.contactEmail}
              onChange={handleChange}
              placeholder="you@university.edu"
            />
            {errors.contactEmail && (
              <span className="eif-field-error">{errors.contactEmail}</span>
            )}
          </div>

          {/* Description */}
          <div className="eif-field">
            <label className="eif-label">
              Description <span className="eif-optional">(optional)</span>
            </label>
            <textarea
              className="eif-textarea"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Any additional details about the item…"
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className="eif-actions">
            <button
              type="button"
              className="eif-btn eif-btn--cancel"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="eif-btn eif-btn--save"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader size={14} className="eif-spinner" />
                  Saving…
                </>
              ) : (
                <>
                  <Upload size={14} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};

export default EditItemForm;
