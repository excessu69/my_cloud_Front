import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
};

const filesSlice = createSlice({
  name: "files",
  initialState,
  reducers: {
    setFiles(state, action) {
      state.items = action.payload;
    },
    clearFiles(state) {
      state.items = [];
    },
  },
});

export const { setFiles, clearFiles } = filesSlice.actions;
export default filesSlice.reducer;
