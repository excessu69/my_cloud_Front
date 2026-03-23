import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { BrowserRouter } from "react-router-dom";

import RegisterPage from "../pages/RegisterPage/RegisterPage";
import userReducer from "../store/userSlice";
import filesReducer from "../store/filesSlice";

describe("RegisterPage", () => {
  test("рендер страницы регистрации", () => {
    const store = configureStore({
      reducer: {
        user: userReducer,
        files: filesReducer,
      },
      preloadedState: {
        user: { user: null },
        files: { items: [] },
      },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <RegisterPage />
        </BrowserRouter>
      </Provider>,
    );

    expect(screen.getByText(/регистрация/i)).toBeInTheDocument();
  });
});
