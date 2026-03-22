import "./Modal.css";

export default function Modal({
  isOpen,
  title,
  message,
  children,
  onConfirm,
  onCancel,
  confirmText = "OK",
  cancelText = "Отмена",
  isDanger = false,
  showCancelButton = true,
  isLarge = false,
  isImage = false,
}) {
  if (!isOpen) return null;

  const shouldShowFooter = showCancelButton || !!onConfirm;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className={`modal-content ${isLarge ? "modal-content--large" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {title && (
          <div className="modal-header">
            <h2 className="modal-title">{title}</h2>
          </div>
        )}

        {/* Body */}
        <div className={`modal-body ${isImage ? "modal-body--image" : ""}`}>
          {children ? children : message && <p>{message}</p>}
        </div>

        {/* Footer */}
        {shouldShowFooter && (
          <div className="modal-footer">
            {showCancelButton && (
              <button
                type="button"
                className="button button--secondary"
                onClick={onCancel}
              >
                {cancelText}
              </button>
            )}

            {onConfirm && (
              <button
                type="button"
                className={`button ${
                  isDanger ? "button--danger" : "button--primary"
                }`}
                onClick={onConfirm}
              >
                {confirmText}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
