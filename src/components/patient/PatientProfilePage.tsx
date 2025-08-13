"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  BottleWine,
  BriefcaseBusiness,
  Cake,
  Calendar,
  Cigarette,
  Droplets,
  Globe,
  HeartPlus,
  House,
  Languages,
  Mail,
  MarsStroke,
  NutOff,
  Phone,
  PhoneCall,
  Ruler,
  User,
  UserCircle,
  Weight,
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  dob: string;
}

const PatientProfilePage = () => {
  const [user, setUser] = useState<User | null>(null);

  async function fetchUser() {
    try {
      const res = await axios.get<User>("/api/auth/me");
      setUser(res.data);
    } catch {}
  }
  useEffect(() => {
    fetchUser();
  }, []);
  return (
    <div className="mt-4">
      {user && (
        <div className="p-6 space-y-8 border-2 rounded-lg">
          {/* PI + OV */}
          <div className="flex items-center justify-between">
            {/* Personal Info */}
            <Card className="w-[350px] dark:bg-gray-900 border-2">
              <CardHeader className="flex items-center space-x-4">
                <UserCircle className="w-12 h-14" />
                <div>
                  <CardTitle className="text-2xl font-black">
                    {user.name}
                  </CardTitle>
                  <CardTitle className="text-base font-medium">
                    Role:{" "}
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </CardTitle>
                </div>
              </CardHeader>
              <div className="border-b-2 -mt-2"></div>
              <CardTitle className="text-xl font-bold ml-6 -mt-4">
                Contact Details
              </CardTitle>
              <CardContent className="-mt-4">
                <table className="w-full text-sm text-left text-gray-700 dark:text-gray-300">
                  <tbody>
                    <tr className="border-b-2 dark:border-gray-700">
                      <td className="py-2 font-semibold flex items-center gap-2">
                        <Phone className="h-5" /> Phone
                      </td>
                      <td className="py-2">{user.phone}</td>
                    </tr>
                    <tr className="border-b-2 dark:border-gray-700">
                      <td className="py-2 font-semibold flex items-center gap-2">
                        <Mail className="h-5" /> Email
                      </td>
                      <td className="py-2">{user.email}</td>
                    </tr>
                    <tr className="border-b-2 dark:border-gray-700">
                      <td className="py-2 font-semibold flex items-center gap-2">
                        <House className="h-5" /> Address
                      </td>
                      <td className="py-2">Dhaka, Bangladesh</td>
                    </tr>
                    <tr className="border-b-2 dark:border-gray-700">
                      <td className="py-2 font-semibold flex items-center gap-2">
                        <BriefcaseBusiness className="h-5" /> Occupation
                      </td>
                      <td className="py-2">Software Engineer</td>
                    </tr>
                    <tr className="border-b-2 dark:border-gray-700">
                      <td className="py-2 font-semibold flex items-center gap-2">
                        <Globe className="h-5" /> Nationality
                      </td>
                      <td className="py-2">Bangladesh</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-semibold flex items-center gap-2">
                        <Languages className="h-5" /> Language
                      </td>
                      <td className="py-2">Bangla</td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* Overview */}
            <Card className="w-[800px] dark:bg-gray-900 border-2">
              <CardHeader>
                <CardTitle className="text-3xl font-bold ">
                  Physical Overview
                </CardTitle>
              </CardHeader>
              <div className="border-b-2 "></div>

              <CardContent className="mt-4">
                <div className="flex w-full gap-4">
                  {/* Section 1: Basic Info */}
                  <div className="flex-1 border rounded-lg px-2 py-4 dark:border-gray-700 dark:bg-gray-800 flex flex-col">
                    <h3 className="text-lg font-bold mb-4 text-center">
                      Basic Info
                    </h3>
                    <table className="w-full text-sm text-gray-700 dark:text-gray-300">
                      <tbody>
                        <tr className="border-b dark:border-gray-700">
                          <td className="py-2 flex items-center gap-2 font-semibold whitespace-nowrap">
                            <MarsStroke className="h-5" /> Gender
                          </td>
                          <td className="py-2">Male</td>
                        </tr>
                        <tr className="border-b dark:border-gray-700">
                          <td className="py-2 flex items-center gap-2 font-semibold whitespace-nowrap">
                            <Calendar className="h-5" /> DOB
                          </td>
                          <td className="py-2">
                            {new Date(user.dob).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            })}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 flex items-center gap-2 font-semibold whitespace-nowrap">
                            <Cake className="h-5" /> Age
                          </td>
                          <td className="py-2">14 Years</td>
                        </tr>
                        <tr className="border-b dark:border-gray-700"></tr>
                        <tr>
                          <td className="py-2 flex items-center gap-2 font-semibold whitespace-nowrap">
                            <HeartPlus className="h-5" /> Marital
                          </td>
                          <td className="py-2">Single</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Section 2: Physical Info */}
                  <div className="flex-1 border rounded-lg px-2 py-4 dark:border-gray-700 dark:bg-gray-800 flex flex-col">
                    <h3 className="text-lg font-bold mb-4 text-center">
                      Physical Info
                    </h3>
                    <table className="w-full text-sm text-gray-700 dark:text-gray-300">
                      <tbody>
                        <tr className="border-b dark:border-gray-700">
                          <td className="py-2 flex items-center gap-2 font-semibold whitespace-nowrap">
                            <Droplets className="h-5" /> Blood Group
                          </td>
                          <td className="py-2">B Positive</td>
                        </tr>
                        <tr className="border-b dark:border-gray-700">
                          <td className="py-2 flex items-center gap-2 font-semibold whitespace-nowrap">
                            <Ruler className="h-5" /> Height
                          </td>
                          <td className="py-2">120 cm</td>
                        </tr>
                        <tr>
                          <td className="py-2 flex items-center gap-2 font-semibold whitespace-nowrap">
                            <Weight className="h-5" /> Weight
                          </td>
                          <td className="py-2">20 kg</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Section 3: Lifestyle / Allergies */}
                  <div className="flex-1 border rounded-lg px-2 py-4 dark:border-gray-700 dark:bg-gray-800 flex flex-col">
                    <h3 className="text-lg font-bold mb-4 text-center">
                      Lifestyle
                    </h3>
                    <table className="w-full text-sm text-gray-700 dark:text-gray-300">
                      <tbody>
                        <tr className="border-b dark:border-gray-700">
                          <td className="py-2 flex items-center gap-2 font-semibold whitespace-nowrap">
                            <NutOff className="h-5" /> Allergies
                          </td>
                          <td className="py-2">UNKNOWN</td>
                        </tr>
                        <tr className="border-b dark:border-gray-700">
                          <td className="py-2 flex items-center gap-2 font-semibold whitespace-nowrap">
                            <Cigarette className="h-5" /> Smoking
                          </td>
                          <td className="py-2">Former Smoker</td>
                        </tr>
                        <tr>
                          <td className="py-2 flex items-center gap-2 font-semibold whitespace-nowrap">
                            <BottleWine className="h-5" /> Alcohol
                          </td>
                          <td className="py-2">UNKNOWN</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ED */}
          <div className="flex justify-between">
            {/* Section: Emergency Contact */}
            <Card className=" dark:bg-gray-900 border-2 w-[350px] h-[300px]">
              <CardHeader>
                <CardTitle className="text-3xl font-bold">
                  Emergency Contact
                </CardTitle>
              </CardHeader>
              <div className="border-b-2"></div>

              <CardContent>
                <div className="flex w-full gap-4">
                  <div className="flex-1 border rounded-lg px-4 py-4 dark:border-gray-700 dark:bg-gray-800 flex flex-col">
                    <h3 className="text-lg font-bold mb-4 text-center">
                      Contact Details
                    </h3>
                    <table className="w-full text-sm text-gray-700 dark:text-gray-300">
                      <tbody>
                        <tr className="border-b dark:border-gray-700">
                          <td className="py-2 flex items-center gap-2 font-semibold whitespace-nowrap">
                            <User className="h-5" /> Name
                          </td>
                          <td className="py-2">Khaled Saifulla</td>
                        </tr>
                        <tr>
                          <td className="py-2 flex items-center gap-2 font-semibold whitespace-nowrap">
                            <Phone className="h-5" /> Phone
                          </td>
                          <td className="py-2">+8801311776857</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Medical History + Chronic Disease */}
            <div>
              <Card className=" dark:bg-gray-900 border-2 w-[800px]">
                <CardHeader>
                  <CardTitle className="text-3xl font-bold">
                    Medical History
                  </CardTitle>
                </CardHeader>
                <div className="border-b-2"></div>
                <div className="flex justify-between">
                  <div>
                    <CardContent>
                      <div className="flex w-[350px] gap-4 ">
                        <div className="flex-1 border rounded-lg px-4 py-4 dark:border-gray-700 dark:bg-gray-800 flex flex-col">
                          <h3 className="text-base font-bold">
                            Medical History
                          </h3>
                          <p className="border-b-2 mt-1 mb-1"></p>
                          <p className="text-justify text-sm leading-normal">
                            I have mild asthma since childhood, seasonal
                            allergies, and occasional migraines. I haven’t had
                            any surgeries and take medications as prescribed. I
                            attend regular check-ups to monitor my health.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                  <div>
                    <CardContent>
                      <div className="flex w-[350px] gap-4 ">
                        <div className="flex-1 border rounded-lg px-4 py-4 dark:border-gray-700 dark:bg-gray-800 flex flex-col">
                          <h3 className="text-base font-bold">
                            Chronic Disease
                          </h3>
                          <p className="border-b-2 mt-1 mb-1"></p>
                          <p className="text-justify text-sm leading-normal">
                            I have mild asthma since childhood, seasonal
                            allergies, and occasional migraines. I haven’t had
                            any surgeries and take medications as prescribed. I
                            attend regular check-ups to monitor my health.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientProfilePage;
