import Modal from "../../Modal/Modal";
import "./ErrorModal.css";

export default function ErrorModal({ isOpen, title, message, onClose }) {
  return (
    <Modal
      isOpen={isOpen}
      title={title}
      message={message}
      onConfirm={onClose}
      showCancelButton={false}
    />
  );
}
