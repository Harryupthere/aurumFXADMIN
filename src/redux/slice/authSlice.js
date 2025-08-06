import { createSlice } from "@reduxjs/toolkit";
import { login } from "../action/authAction";
var isAuthenticated = localStorage.getItem("auth_token") ? true : false;

// let user =   JSON.parse( localStorage.getItem("logged_in_user"))

const initialState = {
  loading: false,
  error: null,
  success: false,
  customerDetails: null,
  settingData: null,
  settingloading: null,
  isAuthenticated: isAuthenticated,
  auth_token: localStorage.getItem("auth_token") || null,  // 👈 new line
  // vrfyOtpEmail: null,
  // status:localStorage.getItem("status"),
  // plan_id:localStorage.getItem("plan_id"),
  // name:localStorage.getItem("name"),
  // profile:localStorage.getItem("profile"),
  // game_plan:localStorage.getItem("game_plan") || 'inactive'
  username: localStorage.getItem("username") || null,

};


const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    isloginSuccess(state) {
      const token = localStorage.getItem("auth_token");
        const username = localStorage.getItem("username");

      if (token) {
        return {
          ...state,
          loading: false,
          isAuthenticated: true,
          auth_token: token,  // 👈 store token in state
          username,

        };
      }
    },    
    logout(state) {
      state.isAuthenticated = false;
      state.customerDetails = null;
      state.auth_token = null; // clear token from redux
      state.username = null; // clear token from redux
      localStorage.clear();
    },    
     updateUserPlanInfo(state, action) {
    state.status = action.payload.status;
    state.plan_id = action.payload.plan_id;
  }
  },

  extraReducers: (builder) => {
    builder
      //  Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, { payload }) => {
        state.loading = false;
        // state.user =  payload.user;
        state.isAuthenticated= true;
        state.error= null;
        // successMsg("Login successful");
      })
      .addCase(login.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
        // errorMsg(payload || "Login failed");
      });
      
  },
});

export const { logout, isloginSuccess,updateUserPlanInfo } = authSlice.actions;

export default authSlice;
