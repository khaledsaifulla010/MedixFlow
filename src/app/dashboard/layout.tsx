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
      <div className="flex flex-col flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="px-4 mt-6">
          <Navbar />
        </div>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
