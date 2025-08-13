"use client";

import MedicalHistoryModal from "@/components/patient/MedicalHistoryModal";
import MedicalHistoryList from "@/components/patient/MedicalHistoryList";
import { Button } from "@/components/ui/button";
import { UserRoundPen } from "lucide-react";
import { useState } from "react";

const MedicalHistoryPage = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-4">
      <div className="flex items-center justify-end mb-4">
        <Button onClick={() => setOpen(true)} className="cursor-pointer">
          <UserRoundPen /> Add Medical History
        </Button>
      </div>

      <div>
        <MedicalHistoryList />
      </div>

      <MedicalHistoryModal isOpen={open} onClose={() => setOpen(false)} />
    </div>
  );
};

export default MedicalHistoryPage;
