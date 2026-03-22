import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/client";
import { getCookie } from "../../utils/cookies";
import "./AdminUsersPage.css";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const fetchUsers = async () => {
    setError("");
    setLoading(true);

    try {
      const response = await api.get("/auth/users/");
      setUsers(response.data);
    } catch (err) {
      console.error(err);
      setError("Ошибка загрузки пользователей");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenFiles = (userId) => {
    navigate(`/files?user_id=${userId}`);
  };

  const handleDelete = async (id) => {
    try {
      await api.get("/auth/csrf/");
      const csrfToken = getCookie("csrftoken");

      await api.delete(`/auth/users/${id}/delete/`, {
        headers: {
          "X-CSRFToken": csrfToken,
        },
      });

      await fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Ошибка удаления пользователя");
    }
  };

  const handleToggleAdmin = async (user) => {
    try {
      await api.get("/auth/csrf/");
      const csrfToken = getCookie("csrftoken");

      await api.patch(
        `/auth/users/${user.id}/`,
        {
          is_staff: !user.is_staff,
        },
        {
          headers: {
            "X-CSRFToken": csrfToken,
          },
        },
      );

      await fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Ошибка изменения прав пользователя");
    }
  };

  return (
    <div className="page-card admin-users-page">
      <h1 className="page-title">Пользователи</h1>

      {loading ? (
        <p>Загрузка пользователей...</p>
      ) : error ? (
        <p className="message-error">{error}</p>
      ) : users.length === 0 ? (
        <p>Пользователей нет</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Логин</th>
              <th>Email</th>
              <th>Полное имя</th>
              <th>Админ</th>
              <th>Файлов</th>
              <th>Размер</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map((userItem) => (
              <tr key={userItem.id}>
                <td>{userItem.id}</td>
                <td>{userItem.username}</td>
                <td>{userItem.email}</td>
                <td>{userItem.full_name}</td>
                <td>{userItem.is_staff ? "Да" : "Нет"}</td>
                <td>{userItem.files_count}</td>
                <td>{userItem.files_total_size}</td>
                <td className="admin-users-page__actions">
                  <div className="actions-row">
                    <button onClick={() => handleOpenFiles(userItem.id)}>
                      Открыть файлы
                    </button>

                    <button onClick={() => handleToggleAdmin(userItem)}>
                      {userItem.is_staff ? "Снять админа" : "Сделать админом"}
                    </button>

                    <button onClick={() => handleDelete(userItem.id)}>
                      Удалить
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
