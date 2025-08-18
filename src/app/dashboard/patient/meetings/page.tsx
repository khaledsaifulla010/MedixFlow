"use client";

import { useRouter } from "next/navigation";

export default function PatientMeetingEntry() {
  const meetingUrl = "http://localhost:3000/dashboard/meeting/id123456adadbdf";

  const handleJoin = () => {
    window.open(meetingUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Patient Meeting</h1>
      <button
        onClick={handleJoin}
        className="px-4 py-2 rounded bg-blue-600 text-white"
      >
        Join Meeting
      </button>
    </div>
  );
}
