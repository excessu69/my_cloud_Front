import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import api from "./api/client";
import NavBar from "./components/NavBar/NavBar";
import HomePage from "./pages/HomePage/HomePage";
import LoginPage from "./pages/LoginPage/LoginPage";
import RegisterPage from "./pages/RegisterPage/RegisterPage";
import FilesPage from "./pages/FilesPage/FilesPage";
import AdminUsersPage from "./pages/AdminUsersPage/AdminUsersPage";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import { setUser, clearUser } from "./store/userSlice";

function App() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await api.get("/auth/me/");
        dispatch(setUser(response.data));
      } catch (err) {
        dispatch(clearUser());
      } finally {
        setAuthLoading(false);
      }
    };

    fetchCurrentUser();
  }, [dispatch]);

  if (authLoading) {
    return <p className="app-container">Проверка авторизации...</p>;
  }

  return (
    <BrowserRouter>
      <div className="app-container">
        <NavBar />

        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route
            path="/login"
            element={
              user ? (
                <Navigate to={user.is_staff ? "/admin-users" : "/files"} />
              ) : (
                <LoginPage />
              )
            }
          />

          <Route
            path="/register"
            element={
              user ? (
                <Navigate to={user.is_staff ? "/admin-users" : "/files"} />
              ) : (
                <RegisterPage />
              )
            }
          />

          <Route
            path="/files"
            element={user ? <FilesPage /> : <Navigate to="/login" />}
          />

          <Route
            path="/admin-users"
            element={
              user && user.is_staff ? (
                <AdminUsersPage />
              ) : (
                <Navigate to="/files" />
              )
            }
          />

          <Route
            path="/profile"
            element={user ? <ProfilePage /> : <Navigate to="/login" />}
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
