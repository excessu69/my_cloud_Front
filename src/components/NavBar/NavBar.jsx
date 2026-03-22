import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import api from "../../api/client";
import { getCookie } from "../../utils/cookies";
import { clearUser } from "../../store/userSlice";
import { clearFiles } from "../../store/filesSlice";
import "./NavBar.css";

export default function NavBar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);

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

      dispatch(clearUser());
      dispatch(clearFiles());
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert("Ошибка выхода");
    }
  };

  return (
    <nav className="page-card navbar">
      <div className="navbar__content">
        <Link to="/">Главная</Link>

        {user && <Link to="/files">Мои файлы</Link>}

        {user && <Link to="/profile">Личный кабинет</Link>}

        <div className="navbar__spacer"></div>

        {!user ? (
          <div className="navbar__right">
            <Link to="/login">Вход</Link>
            <Link to="/register">Регистрация</Link>
          </div>
        ) : (
          <>
            <span className="navbar__user">
              Пользователь: <strong>{user.username}</strong>
            </span>

            {user.is_staff && <Link to="/admin-users">Пользователи</Link>}

            <button onClick={handleLogout}>Выход</button>
          </>
        )}
      </div>
    </nav>
  );
}
