"use client";

import PatientModal from "@/components/patient/PatientModal";
import { Button } from "@/components/ui/button";
import { UserRoundPen } from "lucide-react";
import { useState } from "react";

const PorfilePage = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex items-center justify-end">
      <Button className="cursor-pointer" onClick={() => setOpen(true)}>
        <UserRoundPen /> Edit Your Profile
      </Button>
      <PatientModal isOpen={open} onClose={() => setOpen(false)} />
    </div>
  );
};

export default PorfilePage;
