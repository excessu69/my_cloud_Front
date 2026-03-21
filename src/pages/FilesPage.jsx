import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../api/client";
import { useDispatch } from "react-redux";
import { setFiles as setFilesAction } from "../store/filesSlice";

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop().split(";").shift();
  }
  return null;
}

function formatSize(bytes) {
  if (!bytes) return "0 B";

  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return (bytes / Math.pow(1024, i)).toFixed(2) + " " + sizes[i];
}

function formatDate(dateString) {
  if (!dateString) return "Ещё не скачивался";

  return new Date(dateString).toLocaleString("ru-RU");
}

export default function FilesPage({ user }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const targetUserId = searchParams.get("user_id");

  const isAdminViewingOtherUser =
    user?.is_staff && targetUserId && String(targetUserId) !== String(user?.id);

  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadComment, setUploadComment] = useState("");
  const [error, setError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const dispatch = useDispatch();

  const [editingFileId, setEditingFileId] = useState(null);
  const [editForm, setEditForm] = useState({
    original_name: "",
    comment: "",
  });

  const fetchFiles = async () => {
    setError("");
    setIsLoading(true);

    try {
      const url = isAdminViewingOtherUser
        ? `/files/?user_id=${targetUserId}`
        : "/files/";

      const response = await api.get(url);
      setFiles(response.data);
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

  const handleDelete = async (id) => {
    if (!window.confirm("Удалить файл?")) return;

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
      alert("Ошибка удаления файла");
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
      alert(`Ссылка скопирована:\n${fullLink}`);
    } catch (err) {
      console.error(err);
      alert("Ошибка получения публичной ссылки");
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
      alert("Ошибка обновления файла");
    }
  };

  return (
    <div>
      <h1>
        {isAdminViewingOtherUser
          ? `Файлы пользователя #${targetUserId}`
          : "Мои файлы"}
      </h1>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="file"
          onChange={(e) => setSelectedFile(e.target.files[0])}
        />

        <div style={{ marginTop: "8px" }}>
          <input
            type="text"
            placeholder="Комментарий к файлу"
            value={uploadComment}
            onChange={(e) => setUploadComment(e.target.value)}
          />
        </div>

        <div style={{ marginTop: "8px" }}>
          <button onClick={handleUpload} disabled={isUploading}>
            {isUploading ? "Загрузка..." : "Загрузить"}
          </button>
        </div>

        {uploadError && <p>{uploadError}</p>}
      </div>

      {isLoading ? (
        <p>Загрузка файлов...</p>
      ) : error ? (
        <p>{error}</p>
      ) : files.length === 0 ? (
        <p>Файлов нет</p>
      ) : (
        <ul>
          {files.map((file) => (
            <li key={file.id} style={{ marginBottom: "16px" }}>
              {editingFileId === file.id ? (
                <div>
                  <div>
                    <input
                      type="text"
                      name="original_name"
                      value={editForm.original_name}
                      onChange={handleEditChange}
                      placeholder="Имя файла"
                    />
                  </div>

                  <div style={{ marginTop: "8px" }}>
                    <input
                      type="text"
                      name="comment"
                      value={editForm.comment}
                      onChange={handleEditChange}
                      placeholder="Комментарий"
                    />
                  </div>

                  <div style={{ marginTop: "8px" }}>
                    <button onClick={() => handleSaveEdit(file.id)}>
                      Сохранить
                    </button>
                    <button onClick={cancelEdit} style={{ marginLeft: "8px" }}>
                      Отмена
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div>
                    <strong>{file.original_name}</strong> —{" "}
                    {formatSize(file.size)}
                  </div>

                  <div style={{ marginTop: "4px" }}>
                    Комментарий: {file.comment || "Нет комментария"}
                  </div>

                  <div style={{ marginTop: "4px" }}>
                    Загружен: {formatDate(file.uploaded_at)}
                  </div>

                  <div style={{ marginTop: "4px" }}>
                    Последнее скачивание: {formatDate(file.last_downloaded_at)}
                  </div>

                  <div style={{ marginTop: "8px" }}>
                    <button onClick={() => handleDownload(file.id)}>
                      Скачать
                    </button>

                    <button
                      onClick={() => handleDelete(file.id)}
                      style={{ marginLeft: "8px" }}
                    >
                      Удалить
                    </button>

                    <button
                      onClick={() => handlePublicLink(file.id)}
                      style={{ marginLeft: "8px" }}
                    >
                      Публичная ссылка
                    </button>

                    <button
                      onClick={() => startEdit(file)}
                      style={{ marginLeft: "8px" }}
                    >
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
  );
}
