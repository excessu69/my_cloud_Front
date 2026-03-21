import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop().split(";").shift();
  }
  return null;
}

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
    <div>
      <h1>Пользователи</h1>

      {loading ? (
        <p>Загрузка пользователей...</p>
      ) : error ? (
        <p>{error}</p>
      ) : users.length === 0 ? (
        <p>Пользователей нет</p>
      ) : (
        <table
          border="1"
          cellPadding="8"
          style={{ borderCollapse: "collapse" }}
        >
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
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.full_name}</td>
                <td>{user.is_staff ? "Да" : "Нет"}</td>
                <td>{user.files_count}</td>
                <td>{user.files_total_size}</td>
                <td>
                  <button onClick={() => handleOpenFiles(user.id)}>
                    Открыть файлы
                  </button>

                  <button
                    onClick={() => handleToggleAdmin(user)}
                    style={{ marginLeft: "8px" }}
                  >
                    {user.is_staff ? "Снять админа" : "Сделать админом"}
                  </button>

                  <button
                    onClick={() => handleDelete(user.id)}
                    style={{ marginLeft: "8px" }}
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
