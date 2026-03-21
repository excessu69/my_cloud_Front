import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  files: [],
};

const filesSlice = createSlice({
  name: "files",
  initialState,
  reducers: {
    setFiles(state, action) {
      state.files = action.payload;
    },
    clearFiles(state) {
      state.files = [];
    },
  },
});

export const { setFiles, clearFiles } = filesSlice.actions;
export default filesSlice.reducer;
