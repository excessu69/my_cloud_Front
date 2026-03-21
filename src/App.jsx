import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import api from "./api/client";
import NavBar from "./components/NavBar";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import FilesPage from "./pages/FilesPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import { setUser as setUserAction } from "./store/userSlice";

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await api.get("/auth/me/");
        setUser(response.data);
        dispatch(setUserAction(response.data));
      } catch (err) {
        setUser(null);
        dispatch(setUserAction(null));
      } finally {
        setAuthLoading(false);
      }
    };

    fetchCurrentUser();
  }, [dispatch]);

  if (authLoading) {
    return <p>Проверка авторизации...</p>;
  }

  return (
    <BrowserRouter>
      <div style={{ padding: "20px" }}>
        <NavBar user={user} setUser={setUser} />

        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route
            path="/login"
            element={
              user ? (
                <Navigate to={user.is_staff ? "/admin-users" : "/files"} />
              ) : (
                <LoginPage setUser={setUser} />
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
            element={
              user ? <FilesPage user={user} /> : <Navigate to="/login" />
            }
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
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
