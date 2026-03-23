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

describe("FilesPage", () => {
  test("отображает список файлов", async () => {
    api.get.mockResolvedValue({
      data: [
        {
          id: 1,
          original_name: "file1.txt",
          size: 100,
          comment: "",
          uploaded_at: null,
          last_downloaded_at: null,
        },
        {
          id: 2,
          original_name: "file2.jpg",
          size: 200,
          comment: "",
          uploaded_at: null,
          last_downloaded_at: null,
        },
      ],
    });

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
      expect(screen.getByText("file1.txt")).toBeInTheDocument();
      expect(screen.getByText("file2.jpg")).toBeInTheDocument();
    });
  });
});
