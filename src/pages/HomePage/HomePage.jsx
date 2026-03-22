import { Link } from "react-router-dom";
import "./HomePage.css";

export default function HomePage() {
  return (
    <div className="page-card home-page">
      <h1 className="page-title">My Cloud</h1>

      <p>
        My Cloud — это облачное хранилище файлов, в котором пользователь может
        загружать, хранить и скачивать свои файлы, а также делиться ими через
        публичные ссылки.
      </p>

      <div className="actions-row home-page__actions">
        <Link to="/login" className="btn btn-primary">
          Вход
        </Link>
        <Link to="/register" className="btn btn-secondary">
          Регистрация
        </Link>
      </div>
    </div>
  );
}
