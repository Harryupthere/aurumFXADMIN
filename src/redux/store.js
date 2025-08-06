import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slice/authSlice';
import commonSlice from './slice/commonSlice';

const store = configureStore({
  reducer: {
    auth:authSlice.reducer,
    common:commonSlice.reducer
  },
 
});

export default store;
