import Navbar from "@/components/Navbar/Navbar";
import Sidebar from "@/components/Sidebar/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 overflow-auto">
        <div className="px-4 mt-6">
          <Navbar />
        </div>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
