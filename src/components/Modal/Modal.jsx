import "./Modal.css";

export default function Modal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "OK",
  cancelText = "Отмена",
  isDanger = false,
  showCancelButton = true,
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
        </div>

        <div className="modal-body">
          <p>{message}</p>
        </div>

        <div className="modal-footer">
          {showCancelButton && (
            <button
              className="modal-btn modal-btn-secondary"
              onClick={onCancel}
            >
              {cancelText}
            </button>
          )}
          <button
            className={`modal-btn ${
              isDanger ? "modal-btn-danger" : "modal-btn-primary"
            }`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
