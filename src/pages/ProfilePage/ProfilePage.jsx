import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import api from "../../api/client";
import { getCookie } from "../../utils/cookies";
import { setUser } from "../../store/userSlice";
import "./ProfilePage.css";

export default function ProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);

  const [profileForm, setProfileForm] = useState({
    username: user?.username || "",
    full_name: user?.full_name || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [profileError, setProfileError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const handleProfileChange = (e) => {
    setProfileForm({
      ...profileForm,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");

    try {
      await api.get("/auth/csrf/");
      const csrfToken = getCookie("csrftoken");

      const response = await api.put("/auth/me/", profileForm, {
        headers: {
          "X-CSRFToken": csrfToken,
        },
      });

      dispatch(setUser(response.data));
      setProfileSuccess("Профиль обновлен");
    } catch (err) {
      setProfileError("Ошибка обновления профиля");
      console.error(err);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError("Пароли не совпадают");
      return;
    }

    try {
      await api.get("/auth/csrf/");
      const csrfToken = getCookie("csrftoken");

      await api.put(
        "/auth/change-password/",
        {
          old_password: passwordForm.old_password,
          new_password: passwordForm.new_password,
        },
        {
          headers: {
            "X-CSRFToken": csrfToken,
          },
        },
      );

      setPasswordSuccess("Пароль изменен");
      setPasswordForm({
        old_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.response?.data?.old_password?.[0] ||
        err.response?.data?.new_password?.[0] ||
        "Ошибка смены пароля";
      setPasswordError(errorMessage);
      console.error("Ошибка:", err.response?.data);
    }
  };

  if (!user) {
    return <p>Загрузка...</p>;
  }

  return (
    <div className="page-card profile-page">
      <h1 className="page-title">Личный кабинет</h1>

      <div className="profile-section">
        <h2>Редактировать профиль</h2>
        <form onSubmit={handleProfileSubmit}>
          <div className="form-group">
            <label>Никнейм:</label>
            <input
              type="text"
              name="username"
              value={profileForm.username}
              onChange={handleProfileChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Полное имя:</label>
            <input
              type="text"
              name="full_name"
              value={profileForm.full_name}
              onChange={handleProfileChange}
            />
          </div>

          <button type="submit" className="profile-page__button">
            Сохранить
          </button>
        </form>

        {profileError && <p className="message-error">{profileError}</p>}
        {profileSuccess && <p className="message-success">{profileSuccess}</p>}
      </div>

      <div className="profile-section">
        <h2>Сменить пароль</h2>
        <form onSubmit={handlePasswordSubmit}>
          <div className="form-group">
            <label>Старый пароль:</label>
            <input
              type="password"
              name="old_password"
              value={passwordForm.old_password}
              onChange={handlePasswordChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Новый пароль:</label>
            <input
              type="password"
              name="new_password"
              value={passwordForm.new_password}
              onChange={handlePasswordChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Подтвердить новый пароль:</label>
            <input
              type="password"
              name="confirm_password"
              value={passwordForm.confirm_password}
              onChange={handlePasswordChange}
              required
            />
          </div>

          <button type="submit" className="profile-page__button">
            Сменить пароль
          </button>
        </form>

        {passwordError && <p className="message-error">{passwordError}</p>}
        {passwordSuccess && (
          <p className="message-success">{passwordSuccess}</p>
        )}
      </div>
    </div>
  );
}
