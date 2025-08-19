"use client";

import LogoutButton from "@/components/authComponents/LogoutButton";
import { ModeToggle } from "@/components/ModeToggle";
import NotificationBell from "@/components/patient/NotificationBell";
import { UserCircle } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [patientId, setPatientId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPatientId() {
      try {
        const res = await fetch("/api/patient/me");
        const data = await res.json();
        if (data?.user?.patientProfile?.id) {
          setPatientId(data.user.patientProfile.id);
        }
      } catch (err) {
        console.error("Failed to fetch patient ID", err);
      }
    }

    fetchPatientId();
  }, []);
  return (
    <div className="dark:bg-gray-950 bg-gray-200 py-4 px-4 rounded-full flex items-center justify-between">
      <div className="flex gap-4 items-center">
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
      <div className="flex items-center gap-8">
        <ModeToggle />
        {patientId && <NotificationBell patientId={patientId} />}
        <UserCircle className="w-14 h-10" />
        <LogoutButton />
      </div>
    </div>
  );
}
