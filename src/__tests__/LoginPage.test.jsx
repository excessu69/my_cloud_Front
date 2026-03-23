import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { BrowserRouter } from "react-router-dom";

import LoginPage from "../pages/LoginPage/LoginPage";
import userReducer from "../store/userSlice";
import filesReducer from "../store/filesSlice";

describe("LoginPage", () => {
  test("рендер страницы логина", () => {
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
          <LoginPage />
        </BrowserRouter>
      </Provider>,
    );

    expect(screen.getByText(/вход/i)).toBeInTheDocument();
  });
});
