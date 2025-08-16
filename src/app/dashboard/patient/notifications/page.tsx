"use client";

import NotificationPage from "@/components/patient/NotificationPage";
import React, { useEffect, useState } from "react";

const Notifications = () => {
  const [patientId, setPatientId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPatientId() {
      try {
        const res = await fetch("/api/patient/me");
        const data = await res.json();
        if (data?.user?.patientProfile?.id) {
          setPatientId(data.user.patientProfile.id);
        }
      } catch (err) {
        console.error("Failed to fetch patient ID", err);
      }
    }
    fetchPatientId();
  }, []);

  if (!patientId) return <p>Loading notifications...</p>;

  return <NotificationPage patientId={patientId} />;
};

export default Notifications;
