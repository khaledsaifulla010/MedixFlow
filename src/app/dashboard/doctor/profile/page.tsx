"use client";
import DoctorProfileDetails from "@/components/doctor/DoctorProfileDetails";


const DoctorProfilePage = () => {

  return (
    <div className="dark:bg-gray-900">
      <h1 className="text-3xl font-bold ml-6">Doctor Profile Page</h1>
      <div className="mt-12">
        <DoctorProfileDetails/>
      </div>
    </div>
  );
};

export default DoctorProfilePage;
