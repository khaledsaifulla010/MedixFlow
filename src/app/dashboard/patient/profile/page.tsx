"use client";

import PatientModal from "@/components/patient/PatientModal";
import { useState } from "react";

const PorfilePage = () => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button className="btn-primary" onClick={() => setOpen(true)}>
        Open Patient Form
      </button>

      <PatientModal isOpen={open} onClose={() => setOpen(false)} />
    </div>
  );
};

export default PorfilePage;
