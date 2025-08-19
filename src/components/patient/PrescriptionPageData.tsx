"use client";

import { useEffect, useState } from "react";
import PrescriptionPDF, {
  PrescriptionData,
} from "@/components/patient/PrescriptionPDF";
import { pdf } from "@react-pdf/renderer";
import { useGetAppointmentsQuery } from "@/services/appointmentApi";
import { useGetPrescriptionsQuery } from "@/services/prescriptionApi";
import { Loader2 } from "lucide-react";

const PrescriptionPageData = () => {
  const { data: appointments, isLoading: loadingAppointments } =
    useGetAppointmentsQuery();
  const { data: prescriptions, isLoading: loadingPrescriptions } =
    useGetPrescriptionsQuery();

  const [prescriptionData, setPrescriptionData] =
    useState<PrescriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loadingAppointments || loadingPrescriptions) {
      setLoading(true);
      return;
    }
    if (!appointments || !prescriptions) {
      setPrescriptionData(null);
      setLoading(false);
      return;
    }

    const rxList = Array.isArray(prescriptions)
      ? prescriptions
      : prescriptions?.data ?? [];
    const patientAppointments = appointments ?? [];

    const validPrescription = rxList
      .map((p: any) => ({
        ...p,
        appointment: patientAppointments.find(
          (a: any) => a.id === p.appointmentId
        ),
      }))
      .filter((p: any) => p.appointment)
      .sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];

    if (!validPrescription) {
      setPrescriptionData(null);
      setLoading(false);
      return;
    }

    const appointment = validPrescription.appointment;
    const patientUser = appointment.patient?.user ?? {
      name: "Unknown Patient",
      phone: "N/A",
      email: "N/A",
    };
    const doctorUser = appointment.doctor?.user ?? {
      name: "Unknown Doctor",
      phone: "N/A",
      email: "N/A",
    };

    setPrescriptionData({
      doctor: {
        name: doctorUser.name,
        degree: appointment.doctor?.degree ?? "",
        speciality: appointment.doctor?.speciality ?? "",
        mobile: doctorUser.phone,
        email: doctorUser.email,
      },
      clinic: {
        name: "MedixFlow Healthcare Ltd.",
        address: "134, Gulshan, Dhaka, Bangladesh",
        phone: "+8801918657486",
        timing: "7:00 AM to 12:00 AM",
        closed: "Friday",
        logoUrl: "https://i.ibb.co/KjnbbF9p/logo.png",
      },
      patient: {
        name: patientUser.name,
        phone: patientUser.phone,
        email: patientUser.email,
      },
      medicines: validPrescription.items.map((item: any) => ({
        name: item.name,
        type: item.type,
        dosage: item.dosage,
        dosageTime: item.dosageTime,
        duration: item.duration,
      })),
      advice: validPrescription.advice ? [validPrescription.advice] : [],
      followUp:
        validPrescription.followUp ||
        (appointment.endTime
          ? new Date(appointment.endTime).toLocaleString()
          : "N/A"),
    });

    setLoading(false);
  }, [appointments, prescriptions, loadingAppointments, loadingPrescriptions]);

  const handleDownload = async () => {
    if (!prescriptionData) return;
    const blob = await pdf(
      <PrescriptionPDF data={prescriptionData} />
    ).toBlob();
    const url = URL.createObjectURL(blob);
    window.open(url);
  };

  if (loading)
    return (
      <div className="font-bold text-xl mt-36 flex items-center justify-center gap-4">
        Loading Prescription
        <Loader2 className="animate-spin" />
      </div>
    );
  if (!prescriptionData)
    return (
      <p className="font-bold text-xl mt-36 flex items-center justify-center gap-4">
        No Prescription Found.
      </p>
    );

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

export default PrescriptionPageData;
