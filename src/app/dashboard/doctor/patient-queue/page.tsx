"use client";

export default function DoctorPatientQueue() {
  const meetingUrl = "http://localhost:3000/dashboard/meeting/id123456adadbdf";

  const handleOpenRoom = () => {
    window.open(meetingUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Patient Queue</h1>
      <button
        onClick={handleOpenRoom}
        className="px-4 py-2 rounded bg-green-600 text-white"
      >
        Join Meeting (Host)
      </button>
    </div>
  );
}
