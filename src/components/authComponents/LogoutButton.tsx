"use client";

import React from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { logoutUser } from "@/features/auth/authActions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { LogOut } from "lucide-react";
export default function LogoutButton() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    toast.success("Logout Successful.");
    router.push("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 cursor-pointer font-bold text-lg bg-red-600 text-white rounded hover:bg-red-700 transition w-full flex items-center justify-center gap-2"
    >
      Logout <LogOut />
    </button>
  );
}
