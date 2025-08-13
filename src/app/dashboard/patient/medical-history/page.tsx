import MedicalHistoryForm from "@/components/patient/MedicalHistoryForm";
import MedicalHistoryList from "@/components/patient/MedicalHistoryList";
import React from "react";

const MedicalHistoryPage = () => {
  return (
    <div>
      <MedicalHistoryForm />

      <MedicalHistoryList />
    </div>
  );
};

export default MedicalHistoryPage;
