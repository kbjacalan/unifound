import { useState, useEffect } from "react";
import {
  X,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader,
  MessageSquare,
  Mail,
} from "lucide-react";
import "./ClaimModal.css";

const API_URL = import.meta.env.VITE_UNIFOUND_BACKEND_URL;

const ClaimModal = ({ item, onClose, onSubmitted }) => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Trap scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/claims`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ itemId: item.id, message }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit claim.");

      setSuccess(true);
      if (onSubmitted) onSubmitted();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isFound = item?.status === "found";
  const contactEmail = item?.contactEmail || "unifound@gmail.com";

  return (
    <div className="claim-overlay" onClick={onClose}>
      <div className="claim-modal" onClick={(e) => e.stopPropagation()}>
        <button
          className="claim-close-btn"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={16} />
        </button>

        {success ? (
          <div className="claim-success">
            <div className="claim-success-icon">
              <CheckCircle2 size={38} />
            </div>
            <h2>Claim Submitted!</h2>
            <p>
              Your claim has been sent. You can now contact the reporter
              directly to arrange the handoff.
            </p>
            <div className="claim-contact-reveal">
              <div className="claim-contact-reveal-label">
                <Mail size={13} />
                Reporter's Contact
              </div>
              <a
                className="claim-contact-reveal-email"
                href={`mailto:${contactEmail}`}
              >
                {contactEmail}
              </a>
              <a
                className="claim-btn claim-btn--primary"
                href={`mailto:${contactEmail}`}
                style={{ textDecoration: "none", textAlign: "center" }}
              >
                Send Email
              </a>
            </div>
            <button
              className="claim-btn claim-btn--secondary"
              onClick={onClose}
              style={{ marginTop: "8px" }}
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="claim-modal-header">
              <div className="claim-modal-icon">
                <MessageSquare size={20} />
              </div>
              <div>
                <h2 className="claim-modal-title">
                  {isFound ? "Claim This Item" : "Report a Found Item"}
                </h2>
                <p className="claim-modal-sub">
                  {isFound
                    ? "Let the finder know this item belongs to you"
                    : "Let the owner know you have this item"}
                </p>
              </div>
            </div>

            <div className="claim-item-preview">
              <span className="claim-item-label">Item</span>
              <span className="claim-item-name">{item?.name}</span>
            </div>

            <div className="claim-field">
              <label className="claim-field-label">
                {isFound
                  ? "How can you prove this is yours?"
                  : "Describe where you found it and how to reach you"}
              </label>
              <textarea
                className="claim-textarea"
                rows={5}
                placeholder={
                  isFound
                    ? "e.g. It has a scratch on the back, my name is inside, serial number is XYZ…"
                    : "e.g. Found it near the gym on Monday, you can reach me at student123@uni.edu…"
                }
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={loading}
                maxLength={1000}
              />
              <span className="claim-char-count">{message.length}/1000</span>
            </div>

            {error && (
              <div className="claim-error">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            <div className="claim-modal-actions">
              <button
                className="claim-btn claim-btn--secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="claim-btn claim-btn--primary"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader size={14} className="claim-spinner" />
                    Submitting…
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    Submit Claim
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ClaimModal;
