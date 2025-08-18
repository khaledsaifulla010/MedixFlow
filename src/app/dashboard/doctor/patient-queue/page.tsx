"use client";

import { useRouter } from "next/navigation";

export default function DoctorPatientQueue() {
  const router = useRouter();
  const meetingPath = "/dashboard/meeting/123456adadbdf";

  const handleOpenRoom = () => {
    router.push(meetingPath);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Patient Queue</h1>
      <button
        type="button"
        onClick={handleOpenRoom}
        className="px-4 py-2 rounded bg-green-600 text-white"
      >
        Join Meeting (Host)
      </button>
    </div>
  );
}
