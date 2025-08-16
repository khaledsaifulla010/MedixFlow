"use client";
import Navbar from "@/components/common/Navbar/Navbar";
import Sidebar from "@/components/common/Sidebar/Sidebar";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isVideoCallPage = pathname?.includes("/video-call/");

  return (
    <div className="flex min-h-screen">
      {!isVideoCallPage && <Sidebar />}
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 overflow-auto">
        {!isVideoCallPage && (
          <div className="px-4 mt-6">
            <Navbar />
          </div>
        )}
        <main className={`flex-1 ${isVideoCallPage ? "h-screen" : "p-6"}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
