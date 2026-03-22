import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/client";
import { getCookie } from "../../utils/cookies";
import "./RegisterPage.css";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    full_name: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await api.get("/auth/csrf/");
      const csrfToken = getCookie("csrftoken");

      await api.post("/auth/register/", form, {
        headers: {
          "X-CSRFToken": csrfToken,
        },
      });

      setSuccess("Регистрация прошла успешно");
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      const data = err.response?.data;
      if (data) {
        setError(JSON.stringify(data));
      } else {
        setError("Ошибка регистрации");
      }
      console.error(err);
    }
  };

  return (
    <div className="page-card register-page">
      <h1 className="page-title">Регистрация</h1>

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
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <input
            type="text"
            name="full_name"
            placeholder="Полное имя"
            value={form.full_name}
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

        <button className="register-page__button" type="submit">
          Зарегистрироваться
        </button>
      </form>

      {success && <p className="message-success">{success}</p>}
      {error && <p className="message-error">{error}</p>}
    </div>
  );
}
