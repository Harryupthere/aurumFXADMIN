import { createSlice } from "@reduxjs/toolkit";
import { getAllCategories } from "../action/commonAction";

const initialState = {
  loading: false,
  error: null,
  success: false,
  getCategory: null,
};

const commonSlice = createSlice({
  name: "common",
  initialState,
  reducers: {
  },

  extraReducers: (builder) => {
    builder
      //  getAllCategories
      .addCase(getAllCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllCategories.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.getCategory = payload;
     
      })
      .addCase(getAllCategories.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      
  },
});



export default commonSlice;
