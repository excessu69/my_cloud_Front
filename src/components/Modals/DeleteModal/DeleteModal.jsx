import Modal from "../../Modal/Modal";
import "./DeleteModal.css";

export default function DeleteModal({ isOpen, onConfirm, onCancel }) {
  return (
    <Modal
      isOpen={isOpen}
      title="Удалить файл?"
      message="Вы точно хотите удалить этот файл? Это действие нельзя отменить."
      onConfirm={onConfirm}
      onCancel={onCancel}
      confirmText="Удалить"
      cancelText="Отмена"
      isDanger
    />
  );
}
