import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";

import api from "../../api/client";
import Modal from "../../components/Modal/Modal";
import DeleteModal from "../../components/Modals/DeleteModal/DeleteModal";
import CopyLinkModal from "../../components/Modals/CopyLinkModal/CopyLinkModal";
import ErrorModal from "../../components/Modals/ErrorModal/ErrorModal";
import ImageModal from "../../components/Modals/ImageModal/ImageModal";
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
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    onConfirm: null,
    fileId: null,
  });

  const [copyLinkModal, setCopyLinkModal] = useState({
    isOpen: false,
    link: "",
  });

  const [errorModal, setErrorModal] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  const [imageModal, setImageModal] = useState({
    isOpen: false,
    url: "",
    name: "",
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
    setDeleteModal({
      isOpen: true,
      onConfirm: () => confirmDelete(id),
      fileId: id,
    });
  };

  const confirmDelete = async (id) => {
    setDeleteModal((prev) => ({ ...prev, isOpen: false }));

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
      setErrorModal({
        isOpen: true,
        title: "Ошибка",
        message: "Ошибка удаления файла",
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
      setCopyLinkModal({
        isOpen: true,
        link: fullLink,
      });
    } catch (err) {
      console.error(err);
      setErrorModal({
        isOpen: true,
        title: "Ошибка",
        message: "Ошибка получения публичной ссылки",
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
      setErrorModal({
        isOpen: true,
        title: "Ошибка",
        message: "Ошибка обновления файла",
      });
    }
  };

  const openImageModal = (url, name) => {
    setImageModal({
      isOpen: true,
      url,
      name,
    });
  };

  const closeImageModal = () => {
    setImageModal({
      isOpen: false,
      url: "",
      name: "",
    });
  };

  const isImageFile = (file) => {
    if (file.mime_type) {
      return file.mime_type.startsWith("image/");
    }
    const ext = file.original_name.split(".").pop().toLowerCase();
    return ["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext);
  };

  const getFileUrl = (id) => {
    return `http://127.0.0.1:8000/api/files/${id}/download/`;
  };

  return (
    <>
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onConfirm={deleteModal.onConfirm}
        onCancel={() => setDeleteModal((prev) => ({ ...prev, isOpen: false }))}
      />

      <CopyLinkModal
        isOpen={copyLinkModal.isOpen}
        link={copyLinkModal.link}
        onClose={() => setCopyLinkModal((prev) => ({ ...prev, isOpen: false }))}
      />

      <ErrorModal
        isOpen={errorModal.isOpen}
        title={errorModal.title}
        message={errorModal.message}
        onClose={() => setErrorModal((prev) => ({ ...prev, isOpen: false }))}
      />

      <ImageModal
        isOpen={imageModal.isOpen}
        url={imageModal.url}
        name={imageModal.name}
        onClose={closeImageModal}
      />

      <div className="files-page">
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
                    {isImageFile(file) && (
                      <div className="file-preview-container">
                        <img
                          src={getFileUrl(file.id)}
                          alt={file.original_name}
                          className="file-preview"
                          onClick={() =>
                            openImageModal(
                              getFileUrl(file.id),
                              file.original_name,
                            )
                          }
                        />
                      </div>
                    )}
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
                        Ссылка
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
