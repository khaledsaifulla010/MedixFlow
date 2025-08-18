"use client";

import { useRouter } from "next/navigation";

export default function PatientMeetingEntry() {
  const router = useRouter();
  const meetingPath = "/dashboard/meeting/123456adadbdf";

  const handleJoin = () => {
    router.push(meetingPath);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Patient Meeting</h1>
      <button
        type="button"
        onClick={handleJoin}
        className="px-4 py-2 rounded bg-blue-600 text-white"
      >
        Join Meeting
      </button>
    </div>
  );
}
