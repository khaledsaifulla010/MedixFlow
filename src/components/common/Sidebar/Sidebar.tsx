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
  CircleUser,
  FileClock,
  SquareStack,
  Files,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import LogoutButton from "@/components/authComponents/LogoutButton";
type MenuItem = {
  name: string;
  href: string;
  icon: React.ElementType;
};

type MenuSections = {
  MENU: MenuItem[];
  MANAGE: MenuItem[];
  SYSTEM: MenuItem[];
};

const menuConfig: Record<"admin" | "doctor" | "patient", MenuSections> = {
  admin: {
    MENU: [
      { name: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
      {
        name: "My Profile",
        href: "/dashboard/admin/profile",
        icon: CircleUser,
      },
    ],
    MANAGE: [
      { name: "Users", href: "/dashboard/admin/users", icon: Users },
      {
        name: "All Appointments",
        href: "/dashboard/admin/all-appointments",
        icon: Files,
      },
    ],
    SYSTEM: [],
  },
  doctor: {
    MENU: [
      { name: "Dashboard", href: "/dashboard/doctor", icon: LayoutDashboard },
      {
        name: "My Profile",
        href: "/dashboard/doctor/profile",
        icon: CircleUser,
      },
    ],
    MANAGE: [
      {
        name: "Patient Queue",
        href: "/dashboard/doctor/patient-queue",
        icon: SquareStack,
      },

      {
        name: "EHR Records",
        href: "/dashboard/doctor/ehr-records",
        icon: FileText,
      },
    ],
    SYSTEM: [],
  },
  patient: {
    MENU: [
      { name: "Dashboard", href: "/dashboard/patient", icon: LayoutDashboard },
      {
        name: "My Profile",
        href: "/dashboard/patient/profile",
        icon: CircleUser,
      },
    ],
    MANAGE: [
      {
        name: "Appointments",
        href: "/dashboard/patient/appointment",
        icon: Calendar,
      },
      { name: "Meetings", href: "/dashboard/patient/meetings", icon: Video },
      {
        name: "Medical History",
        href: "/dashboard/patient/medical-history",
        icon: FileClock,
      },
      {
        name: "Prescriptions",
        href: "/dashboard/patient/prescriptions",
        icon: FileText,
      },
    ],
    SYSTEM: [
      {
        name: "Notifications",
        href: "/dashboard/patient/notifications",
        icon: Bell,
      },
    ],
  },
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

  if (!mounted) return null;

  const menuGroups: Partial<MenuSections> = userRole
    ? menuConfig[userRole]
    : {};

  return (
    <aside className="w-64 h-screen sticky top-0 bg-white dark:bg-gray-900 border-r-2 border-gray-200 dark:border-gray-800 flex flex-col">
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

      <nav className="flex-1 p-4 space-y-4 mt-4">
        {Object.entries(menuGroups).map(([section, items]) => (
          <div key={section}>
            <h2 className="text-xs font-semibold text-gray-400 uppercase mb-2">
              {section}
            </h2>
            <div className="space-y-1">
              {(items as MenuItem[]).map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
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
            </div>
          </div>
        ))}
      </nav>

      <div className="mb-6 border-b-2 border-gray-200 dark:border-gray-800"></div>
      <div className="mb-4 px-4 flex items-center justify-center cursor-pointer">
        <LogoutButton />
      </div>
    </aside>
  );
}
