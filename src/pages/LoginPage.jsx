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

export default function LoginPage({ setUser }) {
  const navigate = useNavigate();

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
      await api.get("/auth/csrf/");
      const csrfToken = getCookie("csrftoken");

      await api.post("/auth/login/", form, {
        headers: {
          "X-CSRFToken": csrfToken,
        },
      });

      const response = await api.get("/auth/me/");
      setUser(response.data);

      if (response.data.is_staff) {
        navigate("/admin-users");
      } else {
        navigate("/files");
      }
    } catch (err) {
      setError("Ошибка входа. Проверь логин и пароль.");
      console.error(err);
    }
  };

  return (
    <div>
      <h1>Вход</h1>

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

        <div style={{ marginTop: "8px" }}>
          <input
            type="password"
            name="password"
            placeholder="Пароль"
            value={form.password}
            onChange={handleChange}
          />
        </div>

        <div style={{ marginTop: "8px" }}>
          <button type="submit">Войти</button>
        </div>
      </form>

      {error && <p>{error}</p>}
    </div>
  );
}
