import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";

import FilesPage from "../pages/FilesPage/FilesPage";
import userReducer from "../store/userSlice";
import filesReducer from "../store/filesSlice";
import api from "../api/client";

vi.mock("../api/client", () => ({
  default: {
    get: vi.fn(),
  },
}));

describe("FilesPage error", () => {
  test("показывает ошибку при неудачной загрузке файлов", async () => {
    api.get.mockRejectedValue(new Error("Network Error"));

    const store = configureStore({
      reducer: {
        user: userReducer,
        files: filesReducer,
      },
      preloadedState: {
        user: {
          user: { id: 1, username: "testuser", is_staff: false },
        },
        files: {
          items: [],
        },
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <FilesPage />
        </MemoryRouter>
      </Provider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Ошибка загрузки файлов")).toBeInTheDocument();
    });
  });
});
