import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import api from "../../api/client";
import { getCookie } from "../../utils/cookies";
import { setUser } from "../../store/userSlice";
import "./LoginPage.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      console.log("Получение CSRF токена...");
      await api.get("/auth/csrf/");
      const csrfToken = getCookie("csrftoken");
      console.log("CSRF токен:", csrfToken);

      console.log("Отправка данных входа...");
      await api.post("/auth/login/", form, {
        headers: {
          "X-CSRFToken": csrfToken,
        },
      });
      console.log("Вход успешен");

      console.log("Получение данных пользователя...");
      const response = await api.get("/auth/me/");
      console.log("Данные пользователя:", response.data);
      dispatch(setUser(response.data));

      if (response.data.is_staff) {
        navigate("/admin-users");
      } else {
        navigate("/files");
      }
    } catch (err) {
      console.error("Ошибка входа:", err);
      setError("Ошибка входа. Проверь логин и пароль.");
    }
  };

  return (
    <div className="page-card login-page">
      <h1 className="page-title">Вход</h1>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            name="username"
            placeholder="Логин"
            value={form.username}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <input
            type="password"
            name="password"
            placeholder="Пароль"
            value={form.password}
            onChange={handleChange}
          />
        </div>

        <button className="login-page__button" type="submit">
          Войти
        </button>
      </form>

      {error && <p className="message-error">{error}</p>}
    </div>
  );
}
