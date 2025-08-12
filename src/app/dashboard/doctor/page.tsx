"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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

const DoctorDashboard = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

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

      const res = await axios.get<User>("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(res.data);
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
      <h1 className=" font-bold text-3xl">Welcome to Doctor Dashboard</h1>

      {user && (
        <div className="mt-6">
          <p>
            <strong>Name:</strong> {user.name}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Phone:</strong> {user.phone}
          </p>
          <p>
            <strong>Date of Birth:</strong>{" "}
            {new Date(user.dob).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>

          <p>
            <strong>Role:</strong>{" "}
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          </p>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
