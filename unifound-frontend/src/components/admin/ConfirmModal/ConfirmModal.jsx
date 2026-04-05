import { AlertTriangle, X } from "lucide-react";
import { createPortal } from "react-dom";
import "./ConfirmModal.css";

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="cm-overlay" onClick={onClose}>
      <div className="cm-modal" onClick={(e) => e.stopPropagation()}>
        <button className="cm-close" onClick={onClose} aria-label="Close">
          <X size={16} />
        </button>

        <div className={`cm-icon-wrap cm-icon-wrap--${variant}`}>
          <AlertTriangle size={22} />
        </div>

        <h2 className="cm-title">{title}</h2>
        <p className="cm-message">{message}</p>

        <div className="cm-actions">
          <button className="cm-btn cm-btn--cancel" onClick={onClose}>
            {cancelLabel}
          </button>
          <button
            className={`cm-btn cm-btn--confirm cm-btn--${variant}`}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ConfirmModal;
