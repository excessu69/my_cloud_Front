import Modal from "../../Modal/Modal";
import "./ImageModal.css";

export default function ImageModal({ isOpen, url, name, onClose }) {
  return (
    <Modal
      isOpen={isOpen}
      title={name}
      onCancel={onClose}
      showCancelButton={false}
      isLarge={true}
      isImage={true}
    >
      <img
        src={url}
        alt={name}
        style={{ maxWidth: "100%", maxHeight: "80vh", objectFit: "contain" }}
      />
    </Modal>
  );
}
