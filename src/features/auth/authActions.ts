import { AppDispatch } from "@/store/store";
import { setCredentials } from "./authSlice";
import axiosInstance from "@/services/api";
import { AuthResponse } from "@/types/auth";

export const registerUser =
  (userData: { name: string; email: string; password: string }) =>
  async (dispatch: AppDispatch) => {
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

      return { success: true };
    } catch (err: any) {
      console.error("Registration error", err);
      return {
        success: false,
        message: err.response?.data?.message || "Registration failed",
      };
    }
  };


export const loginUser =
  (userData: { email: string; password: string }) =>
  async (dispatch: AppDispatch) => {
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

      return { success: true };
    } catch (err: any) {
      console.error("Login error", err);
      return {
        success: false,
        message: err.response?.data?.message || "Login failed",
      };
    }
  };