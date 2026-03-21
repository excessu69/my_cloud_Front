import { useState } from "react";
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
    <div>
      <h1>Регистрация</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            name="username"
            placeholder="Логин"
            value={form.username}
            onChange={handleChange}
          />
        </div>

        <div>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
          />
        </div>

        <div>
          <input
            type="text"
            name="full_name"
            placeholder="Полное имя"
            value={form.full_name}
            onChange={handleChange}
          />
        </div>

        <div>
          <input
            type="password"
            name="password"
            placeholder="Пароль"
            value={form.password}
            onChange={handleChange}
          />
        </div>

        <button type="submit">Зарегистрироваться</button>
      </form>

      {success && <p>{success}</p>}
      {error && <p>{error}</p>}
    </div>
  );
}
