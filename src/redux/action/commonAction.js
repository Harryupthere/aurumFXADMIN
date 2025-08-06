import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_ENDPOINTS } from "../../constants/endPoints";

import axios from '../../services/axios'

export const getAllCategories = createAsyncThunk(
    "common/getAllCategories",
    async (
        _, // Use _ to indicate an unused parameter
        { rejectWithValue, dispatch }
    ) => {
        try {
            const { data } = await axios.get(API_ENDPOINTS.categories);
            if (data.success) {
                return data.data;
            } else {
                return rejectWithValue(data.message);
            }
        } catch (error) {
            if (error.response && error.response.data.message) {
                return rejectWithValue(error.response.data.message);
            } else {
                return rejectWithValue(error.message);
            }
        }
    }
);

