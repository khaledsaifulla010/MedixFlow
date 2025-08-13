import { AppDispatch } from "@/store/store";
import { logout, setCredentials } from "./authSlice";
import axiosInstance from "@/services/api";
import { AuthResponse } from "@/types/auth";

export const registerUser =
  (userData: {
    name: string;
    email: string;
    phone: string;
    dob: string;
    role: string;
    password: string;
  }) =>
  async (
    dispatch: AppDispatch
  ): Promise<{ success: boolean; user?: any; message?: string }> => {
    try {
      const { data } = await axiosInstance.post<AuthResponse>(
        "/auth/register",
        userData
      );

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      axiosInstance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${data.accessToken}`;

      dispatch(
        setCredentials({
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        })
      );

      return { success: true, user: data.user };
    } catch (err: any) {
      console.error("Registration error", err);
      return {
        success: false,
        message: err.response?.data?.message || "Registration failed",
      };
    }
  };

// Doctor Register
interface Availability {
  isRecurring: boolean;
  dayOfWeek?: number;
  date?: string;
  startTime: string;
  endTime: string;
}

interface DoctorRegisterData {
  name: string;
  email: string;
  phone: string;
  dob: string;
  role: "doctor";
  password: string;
  speciality: string;
  degree: string;
  availabilities: Availability[];
}

export const registerDoctor =
  (doctorData: DoctorRegisterData) =>
  async (
    dispatch: AppDispatch
  ): Promise<{ success: boolean; user?: any; message?: string }> => {
    try {
      const { data } = await axiosInstance.post<AuthResponse>(
        "api/doctor/register",
        doctorData
      );

      // Save tokens
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      // Set default Authorization header for future requests
      axiosInstance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${data.accessToken}`;

      // Update Redux state
      dispatch(
        setCredentials({
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        })
      );

      return { success: true, user: data.user };
    } catch (err: any) {
      console.error("Doctor registration error", err);
      return {
        success: false,
        message: err.response?.data?.message || "Doctor registration failed",
      };
    }
  };

export const loginUser =
  (userData: { email: string; password: string }) =>
  async (
    dispatch: AppDispatch
  ): Promise<{ success: boolean; user?: any; message?: string }> => {
    try {
      const { data } = await axiosInstance.post<AuthResponse>(
        "/auth/login",
        userData
      );

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      axiosInstance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${data.accessToken}`;

      dispatch(
        setCredentials({
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        })
      );

      return { success: true, user: data.user };
    } catch (err: any) {
      console.error("Login error", err);
      return {
        success: false,
        message: err.response?.data?.message || "Login failed",
      };
    }
  };

export const logoutUser = () => async (dispatch: AppDispatch) => {
  try {
    await axiosInstance.post("/auth/logout");

    dispatch(logout());

    delete axiosInstance.defaults.headers.common["Authorization"];
  } catch (error) {
    console.error("Logout failed:", error);
  }
};
