"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { UserCircle, Mail, Phone, Cake, Loader2Icon } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  role: string;
}

const PatientProfilePage = () => {
  const [user, setUser] = useState<User | null>(null);

  const fetchUser = async () => {
    try {
      const res = await axios.get<{ user: User; userId: string }>(
        "/api/patient/me"
      );
      setUser(res.data.user);
    } catch (err) {
      console.error("Failed to fetch user", err);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <div className="mt-4">
      {user && (
        <div className="p-6 space-y-8 border-2 rounded-lg">
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

            <div className="border-b-2 -mt-2"></div>

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
        <div className="font-bold text-xl mt-36 flex items-center justify-center gap-4">
          Loading Patient Profile <Loader2Icon className="animate-spin" />
        </div>
      )}
    </div>
  );
};

export default PatientProfilePage;
