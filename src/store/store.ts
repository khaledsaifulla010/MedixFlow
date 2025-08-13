import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/authSlice";
import { medicalHistory } from "@/services/medicalHistory";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [medicalHistory.reducerPath]: medicalHistory.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(medicalHistory.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
