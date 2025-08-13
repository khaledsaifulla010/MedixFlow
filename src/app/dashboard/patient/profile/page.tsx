"use client";

import PatientModal from "@/components/patient/PatientModal";
import PatientProfilePage from "@/components/patient/PatientProfilePage";
import { Button } from "@/components/ui/button";

import { UserRoundPen } from "lucide-react";
import { useState } from "react";

const PorfilePage = () => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-end">
        <Button className="cursor-pointer" onClick={() => setOpen(true)}>
          <UserRoundPen /> Edit Your Profile
        </Button>
        <PatientModal isOpen={open} onClose={() => setOpen(false)} />
      </div>

      <div className="mt-4">
        <h1 className="font-bold text-3xl">My Profile</h1>
        <PatientProfilePage />
      </div>
    </div>
  );
};

export default PorfilePage;
