"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCircle, Mail, Phone, Cake } from "lucide-react";
import { Loader2Icon } from "lucide-react";
interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  role: string;
}

const AdminProfilePage = () => {
  const [user, setUser] = useState<User | null>(null);

  const fetchUser = async () => {
    try {
      const res = await axios.get<{ user: User; userId: string }>(
        "/api/admin/me"
      );
      setUser(res.data.user);
    } catch (err) {
      console.error("Failed to fetch admin user", err);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <div className="mt-10">
      <div className="text-3xl font-bold ml-4">
        Welcome <span className="text-green-500">Admin</span> To Your Profile !
      </div>
      {user && (
        <div className="p-6 space-y-8  rounded-lg">
          <Card className="w-[400px] dark:bg-gray-900 border-2">
            <CardHeader className="flex items-center space-x-4">
              <UserCircle className="w-12 h-14" />
              <div>
                <CardTitle className="text-2xl font-black">
                  {user.name}
                </CardTitle>
                <CardTitle className="text-base font-medium">
                  Role: {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </CardTitle>
              </div>
            </CardHeader>

            <div className="border-b-2 -mt-2" />

            <CardTitle className="text-xl font-bold ml-6 -mt-4">
              Contact Details
            </CardTitle>

            <CardContent>
              <table className="w-full text-sm table-auto border-collapse">
                <tbody>
                  <tr className="border-b-2">
                    <td className="font-semibold py-2 flex items-center gap-2">
                      <Mail className="w-5 h-5" /> Email
                    </td>
                    <td className="py-2">{user.email}</td>
                  </tr>
                  <tr className="border-b-2">
                    <td className="font-semibold py-2 flex items-center gap-2">
                      <Phone className="w-5 h-5" /> Phone
                    </td>
                    <td className="py-2">{user.phone}</td>
                  </tr>
                  <tr className="border-b-2">
                    <td className="font-semibold py-2 flex items-center gap-2">
                      <Cake className="w-5 h-5" /> Date of Birth
                    </td>
                    <td className="py-2">
                      {new Date(user.dob).toLocaleDateString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}
      {!user && (
        <div className="font-bold text-xl mt-24 flex items-center justify-center gap-4">
          Loading Admin Profile <Loader2Icon className="animate-spin" />
        </div>
      )}
    </div>
  );
};

export default AdminProfilePage;
