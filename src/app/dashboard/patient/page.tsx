"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  dob: string;
}

function isAxiosError(
  error: unknown
): error is { isAxiosError: boolean; response?: { status?: number } } {
  return (
    typeof error === "object" &&
    error !== null &&
    "isAxiosError" in error &&
    (error as any).isAxiosError === true
  );
}

const PatientDashboard = () => {
  const router = useRouter();
  async function fetchUser() {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        router.push("/login");
        return;
      }
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        router.push("/login");
        return;
      }
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 401) {
        router.push("/login");
      } else {
        console.error("Failed to fetch user:", error);
      }
    }
  }
  useEffect(() => {
    fetchUser();
  }, []);
  return (
    <div className=" mt-6 px-4">
      <h1 className=" font-bold text-3xl">Welcome to Patient Dashboard</h1>
    </div>
  );
};

export default PatientDashboard;
