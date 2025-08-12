"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  Video,
  FileText,
  MessageSquare,
  Users,
  Bell,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import LogoutButton from "../authComponents/LogoutButton";

const menuConfig = {
  admin: [
    { name: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
    { name: "Users", href: "/users", icon: Users },
    { name: "Appointments", href: "/appointments", icon: Calendar },
    { name: "Notifications", href: "/notifications", icon: Bell },
  ],
  doctor: [
    { name: "Dashboard", href: "/dashboard/doctor", icon: LayoutDashboard },
    { name: "Appointments", href: "/appointments", icon: Calendar },
    { name: "Video Calls", href: "/video", icon: Video },
    { name: "EHR Records", href: "/ehr", icon: FileText },
    { name: "Messages", href: "/messages", icon: MessageSquare },
  ],
  patient: [
    { name: "Dashboard", href: "/dashboard/patient", icon: LayoutDashboard },
    { name: "Appointments", href: "/appointments", icon: Calendar },
    { name: "Video Calls", href: "/video", icon: Video },
    { name: "EHR Records", href: "/ehr", icon: FileText },
    { name: "Messages", href: "/messages", icon: MessageSquare },
  ],
};

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const userRole = useSelector((state: RootState) => state.auth.user?.role) as
    | "admin"
    | "doctor"
    | "patient"
    | undefined;

  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    if (mounted && !userRole) {
      router.push("/login");
    }
  }, [mounted, userRole, router]);

  if (!mounted) {
    return null;
  }

  const menuItems = userRole ? menuConfig[userRole] || [] : [];

  return (
    <aside className="w-64 h-screen bg-white dark:bg-gray-900 border-r-2 border-gray-200 dark:border-gray-800 flex flex-col">
      <div className="px-6 py-4 border-b-2 border-gray-200 dark:border-gray-800">
        <div className="flex flex-col items-center">
          <div className="block dark:hidden">
            <Image
              src="/logo.png"
              alt="MedixFlow Logo"
              width={40}
              height={40}
              priority
            />
          </div>
          <div className="hidden dark:block">
            <Image
              src="/logo1.png"
              alt="MedixFlow Logo Dark"
              width={40}
              height={40}
              priority
            />
          </div>
          <h1 className="text-2xl font-black capitalize text-center mt-2">
            MedixFlow
          </h1>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 mt-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md font-bold transition-colors justify-center",
                active
                  ? "bg-blue-500 text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
            >
              <Icon size={18} />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="mb-6 border-b-2 border-gray-200 dark:border-gray-800">
        {" "}
      </div>
      <div className="mb-4 px-4 flex items-center justify-center cursor-pointer">
        <LogoutButton />
      </div>
    </aside>
  );
}
