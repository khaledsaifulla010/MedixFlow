"use client";
import DoctorProfileDetails from "@/components/doctor/DoctorProfileDetails";
import { useParams } from "next/navigation"; // or next/router if older Next.js

const DoctorProfilePage = () => {
  const params = useParams();
  const doctorId = params.doctorId as string;
  return (
    <div className="dark:bg-gray-900">
      <h1 className="text-3xl font-bold ml-6">Doctor Profile Page</h1>
      <div className="mt-12">
        <DoctorProfileDetails doctorId={doctorId} />
      </div>
    </div>
  );
};

export default DoctorProfilePage;
