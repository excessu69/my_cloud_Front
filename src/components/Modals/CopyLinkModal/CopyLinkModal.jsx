import Modal from "../../Modal/Modal";
import "./CopyLinkModal.css";

export default function CopyLinkModal({ isOpen, link, onClose }) {
  return (
    <Modal
      isOpen={isOpen}
      title="Ссылка скопирована"
      onConfirm={onClose}
      onCancel={onClose}
      showCancelButton={false}
    >
      <p>Ссылка скопирована в буфер обмена:</p>
      <p>{link}</p>
    </Modal>
  );
}
