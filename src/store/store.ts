import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/authSlice";
import { medicalHistory } from "@/services/medicalHistory";
import { doctorApi } from "@/services/doctorApi";
import { appointmentApi } from "@/services/appointmentApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [medicalHistory.reducerPath]: medicalHistory.reducer,
    [doctorApi.reducerPath]: doctorApi.reducer,
    [appointmentApi.reducerPath]: appointmentApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(medicalHistory.middleware)
      .concat(doctorApi.middleware)
      .concat(appointmentApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
