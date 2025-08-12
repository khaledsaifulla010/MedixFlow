"use client";
import LogoutButton from "@/components/authComponents/LogoutButton";
import { ModeToggle } from "@/components/ModeToggle";
import axios from "axios";
import { useEffect, useState } from "react";
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  dob: string;
}

const DoctorDashboard = () => {
  const [user, setUser] = useState<User | null>(null);

  async function fetchUser() {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.warn("No access token found");
        return;
      }

      const res = await axios.get<User>("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(res.data);
    } catch (error) {
      console.error("Failed to fetch user:", error);
    }
  }
  useEffect(() => {
    fetchUser();
  }, []);
  return (
    <div className=" mt-12  px-8">
      <div className="flex items-center justify-between">
        <h1 className=" font-bold text-3xl">Welcome to Doctor Dashboard</h1>
        <div className="flex items-center gap-8">
          <ModeToggle />
          <LogoutButton />
        </div>
      </div>
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
