"use client";

import { useEffect, useState } from "react";
import PrescriptionPDF, {
  PrescriptionData,
} from "@/components/patient/PrescriptionPDF";
import { pdf } from "@react-pdf/renderer";
import { useGetAppointmentsQuery } from "@/services/appointmentApi";

const PrescriptionPage = () => {
  const { data: appointments, isLoading } = useGetAppointmentsQuery();
  const [prescriptionData, setPrescriptionData] =
    useState<PrescriptionData | null>(null);

  useEffect(() => {
    if (!isLoading && appointments && appointments.length > 0) {
      const appointment = appointments[0];

      const data: PrescriptionData = {
        doctor: {
          name: appointment.doctor.user.name,
          degree: appointment.doctor.degree,
          mobile: (appointment.doctor as any).user?.phone || "N/A",
          email: (appointment.doctor as any).user?.email || "N/A",
        },
        clinic: {
          name: "MedixFlow Healthcare Ltd.",
          address: "134, Gulshan, Dhaka, Bangledesh",
          phone: "+8801918657486",
          timing: "7:00 AM to 12:00 AM",
          closed: "Friday",
          logoUrl: "https://i.ibb.co/KjnbbF9p/logo.png",
        },
        patient: {
          name: appointment.patient?.user.name || "Unknown Patient",
          phone: appointment.patient?.user?.phone || "N/A",
          email: appointment.patient?.user?.email || "N/A",
        },
        medicines: [],
        advice: [],
        followUp: appointment.endTime
          ? new Date(appointment.endTime).toLocaleString()
          : "N/A",
      };

      setPrescriptionData(data);
    }
  }, [appointments, isLoading]);

  const handleDownload = async () => {
    if (!prescriptionData) return;
    const blob = await pdf(
      <PrescriptionPDF data={prescriptionData} />
    ).toBlob();
    const url = URL.createObjectURL(blob);
    window.open(url);
  };

  if (isLoading) return <p>Loading appointment data...</p>;
  if (!prescriptionData) return <p>No appointment data available</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Prescription Page</h1>
      <button
        onClick={handleDownload}
        className="rounded-md border px-4 py-2 hover:bg-gray-100"
      >
        Download Prescription PDF
      </button>
    </div>
  );
};

export default PrescriptionPage;
