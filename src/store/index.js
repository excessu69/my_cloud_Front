import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import filesReducer from "./filesSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    files: filesReducer,
  },
});
