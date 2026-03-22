import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";

import api from "../../api/client";
import Modal from "../../components/Modal/Modal";
import { setFiles as setFilesAction } from "../../store/filesSlice";
import { getCookie } from "../../utils/cookies";
import { formatSize } from "../../utils/formatSize";
import { formatDate } from "../../utils/formatDate";
import "./FilesPage.css";

export default function FilesPage() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const user = useSelector((state) => state.user.user);

  const targetUserId = searchParams.get("user_id");

  const isAdminViewingOtherUser =
    user?.is_staff && targetUserId && String(targetUserId) !== String(user?.id);
  const files = useSelector((state) => state.files.items);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadComment, setUploadComment] = useState("");
  const [error, setError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const [editingFileId, setEditingFileId] = useState(null);
  const [editForm, setEditForm] = useState({
    original_name: "",
    comment: "",
  });

  // Modal states
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: null, // 'delete', 'copy', 'error'
    title: "",
    message: "",
    onConfirm: null,
    fileId: null,
  });

  const fetchFiles = async () => {
    setError("");
    setIsLoading(true);

    try {
      const url = isAdminViewingOtherUser
        ? `/files/?user_id=${targetUserId}`
        : "/files/";

      const response = await api.get(url);
      dispatch(setFilesAction(response.data));
    } catch (err) {
      setError("Ошибка загрузки файлов");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [targetUserId, user]);

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError("Выберите файл для загрузки");
      return;
    }

    setUploadError("");
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("comment", uploadComment);

    try {
      await api.get("/auth/csrf/");
      const csrfToken = getCookie("csrftoken");

      await api.post("/files/upload/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "X-CSRFToken": csrfToken,
        },
      });

      setSelectedFile(null);
      setUploadComment("");
      await fetchFiles();
    } catch (err) {
      console.error(err);
      setUploadError(
        JSON.stringify(err.response?.data || "Ошибка загрузки файла"),
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = (id) => {
    setModalState({
      isOpen: true,
      type: "delete",
      title: "Удалить файл?",
      message:
        "Вы точно хотите удалить этот файл? Это действие нельзя отменить.",
      onConfirm: () => confirmDelete(id),
      fileId: id,
    });
  };

  const confirmDelete = async (id) => {
    setModalState((prev) => ({ ...prev, isOpen: false }));

    try {
      await api.get("/auth/csrf/");
      const csrfToken = getCookie("csrftoken");

      await api.delete(`/files/${id}/delete/`, {
        headers: {
          "X-CSRFToken": csrfToken,
        },
      });

      await fetchFiles();
    } catch (err) {
      console.error(err);
      setModalState({
        isOpen: true,
        type: "error",
        title: "Ошибка",
        message: "Ошибка удаления файла",
        onConfirm: () => setModalState((prev) => ({ ...prev, isOpen: false })),
      });
    }
  };

  const handleDownload = (id) => {
    window.open(`http://127.0.0.1:8000/api/files/${id}/download/`, "_blank");
  };

  const handlePublicLink = async (id) => {
    try {
      await api.get("/auth/csrf/");
      const csrfToken = getCookie("csrftoken");

      const response = await api.post(
        `/files/${id}/public-link/`,
        {},
        {
          headers: {
            "X-CSRFToken": csrfToken,
          },
        },
      );

      const fullLink = `http://127.0.0.1:8000${response.data.public_url}`;
      await navigator.clipboard.writeText(fullLink);
      setModalState({
        isOpen: true,
        type: "success",
        title: "Успешно",
        message: `Ссылка скопирована в буфер обмена:\n${fullLink}`,
        onConfirm: () => setModalState((prev) => ({ ...prev, isOpen: false })),
      });
    } catch (err) {
      console.error(err);
      setModalState({
        isOpen: true,
        type: "error",
        title: "Ошибка",
        message: "Ошибка получения публичной ссылки",
        onConfirm: () => setModalState((prev) => ({ ...prev, isOpen: false })),
      });
    }
  };

  const startEdit = (file) => {
    setEditingFileId(file.id);
    setEditForm({
      original_name: file.original_name,
      comment: file.comment || "",
    });
  };

  const cancelEdit = () => {
    setEditingFileId(null);
    setEditForm({
      original_name: "",
      comment: "",
    });
  };

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveEdit = async (id) => {
    try {
      await api.get("/auth/csrf/");
      const csrfToken = getCookie("csrftoken");

      await api.patch(`/files/${id}/`, editForm, {
        headers: {
          "X-CSRFToken": csrfToken,
        },
      });

      setEditingFileId(null);
      setEditForm({
        original_name: "",
        comment: "",
      });

      await fetchFiles();
    } catch (err) {
      console.error(err);
      setModalState({
        isOpen: true,
        type: "error",
        title: "Ошибка",
        message: "Ошибка обновления файла",
        onConfirm: () => setModalState((prev) => ({ ...prev, isOpen: false })),
      });
    }
  };

  return (
    <>
      <Modal
        isOpen={modalState.isOpen}
        title={modalState.title}
        message={modalState.message}
        onConfirm={modalState.onConfirm || (() => {})}
        onCancel={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
        confirmText={modalState.type === "delete" ? "Удалить" : "OK"}
        cancelText={
          modalState.type === "error" || modalState.type === "success"
            ? ""
            : "Отмена"
        }
        isDanger={modalState.type === "delete"}
        showCancelButton={
          modalState.type !== "error" && modalState.type !== "success"
        }
      />

      <div className="page-card files-page">
        <h1 className="page-title">
          {isAdminViewingOtherUser
            ? `Файлы пользователя #${targetUserId}`
            : "Мои файлы"}
        </h1>

        <div className="form-group">
          <input
            type="file"
            onChange={(e) => setSelectedFile(e.target.files[0])}
          />
        </div>

        <div className="form-group">
          <input
            type="text"
            placeholder="Комментарий к файлу"
            value={uploadComment}
            onChange={(e) => setUploadComment(e.target.value)}
          />
        </div>

        <div className="actions-row">
          <button onClick={handleUpload} disabled={isUploading}>
            {isUploading ? "Загрузка..." : "Загрузить"}
          </button>
        </div>

        {uploadError && <p className="message-error">{uploadError}</p>}

        {isLoading ? (
          <p>Загрузка файлов...</p>
        ) : error ? (
          <p className="message-error">{error}</p>
        ) : files.length === 0 ? (
          <p>Файлов нет</p>
        ) : (
          <ul className="files-page__list">
            {files.map((file) => (
              <li key={file.id} className="files-page__item">
                {editingFileId === file.id ? (
                  <div>
                    <div className="form-group">
                      <input
                        type="text"
                        name="original_name"
                        value={editForm.original_name}
                        onChange={handleEditChange}
                        placeholder="Имя файла"
                      />
                    </div>

                    <div className="form-group">
                      <input
                        type="text"
                        name="comment"
                        value={editForm.comment}
                        onChange={handleEditChange}
                        placeholder="Комментарий"
                      />
                    </div>

                    <div className="actions-row">
                      <button onClick={() => handleSaveEdit(file.id)}>
                        Сохранить
                      </button>
                      <button onClick={cancelEdit}>Отмена</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div>
                      <strong>{file.original_name}</strong> —{" "}
                      {formatSize(file.size)}
                    </div>

                    <div className="files-page__meta">
                      Комментарий: {file.comment || "Нет комментария"}
                    </div>

                    <div className="files-page__meta">
                      Загружен: {formatDate(file.uploaded_at)}
                    </div>

                    <div className="files-page__meta">
                      Последнее скачивание:{" "}
                      {formatDate(file.last_downloaded_at)}
                    </div>

                    <div className="actions-row files-page__actions">
                      <button onClick={() => handleDownload(file.id)}>
                        Скачать
                      </button>

                      <button onClick={() => handleDelete(file.id)}>
                        Удалить
                      </button>

                      <button onClick={() => handlePublicLink(file.id)}>
                        Публичная ссылка
                      </button>

                      <button onClick={() => startEdit(file)}>
                        Редактировать
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
