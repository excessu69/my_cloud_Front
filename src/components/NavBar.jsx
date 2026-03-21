import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop().split(";").shift();
  }
  return null;
}

export default function NavBar({ user, setUser }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.get("/auth/csrf/");
      const csrfToken = getCookie("csrftoken");

      await api.post(
        "/auth/logout/",
        {},
        {
          headers: {
            "X-CSRFToken": csrfToken,
          },
        },
      );

      setUser(null);
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert("Ошибка выхода");
    }
  };

  return (
    <nav style={{ marginBottom: "20px" }}>
      <Link to="/" style={{ marginRight: "12px" }}>
        Главная
      </Link>

      {user && (
        <Link to="/files" style={{ marginRight: "12px" }}>
          Мои файлы
        </Link>
      )}

      {!user ? (
        <>
          <Link to="/login" style={{ marginRight: "12px" }}>
            Вход
          </Link>
          <Link to="/register">Регистрация</Link>
        </>
      ) : (
        <>
          {user.is_staff && (
            <Link to="/admin-users" style={{ marginRight: "12px" }}>
              Пользователи
            </Link>
          )}

          <span style={{ marginRight: "12px" }}>
            Пользователь: <strong>{user.username}</strong>
          </span>

          <button onClick={handleLogout}>Выход</button>
        </>
      )}
    </nav>
  );
}
