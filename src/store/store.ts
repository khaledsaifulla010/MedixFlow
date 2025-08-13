import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/authSlice";
import { medicalHistory } from "@/services/medicalHistory";
import { doctorApi } from "@/services/doctorApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [medicalHistory.reducerPath]: medicalHistory.reducer,
    [doctorApi.reducerPath]: doctorApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(medicalHistory.middleware)
      .concat(doctorApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
