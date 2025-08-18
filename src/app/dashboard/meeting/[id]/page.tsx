"use client";

export const dynamic = "force-dynamic"; // avoid static pre-render that can cause SSR/CSR diffs

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { OngoingCall, SocketUser } from "../../../../../types";
import { useSocket } from "../../../../../context/SocketContext";
import VideoCallWithChat from "@/components/videoCall/VideoCall";

type PendingPatient = SocketUser;

export default function MeetingRoom() {
  // ----- mount guard to prevent hydration mismatch -----
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const params = useParams<{ id: string }>();
  const roomId = useMemo(() => (params?.id as string) || "", [params]);

  const { user, socket, handleCall, handleJoinCall } = useSocket();
  const isHost = user?.role === "doctor";

  const [pendingPatients, setPendingPatients] = useState<PendingPatient[]>([]);
  const [status, setStatus] = useState<
    "idle" | "host" | "waiting" | "noDoctor" | "rejected" | "started"
  >("idle");

  // prevent double-start if duplicate events arrive
  const startedRef = useRef(false);

  // Join room only after mount (prevents SSR/CSR mismatch)
  useEffect(() => {
    if (!mounted || !socket || !roomId || !user) return;

    if (isHost) {
      socket.emit("doctorJoinRoom", { roomId, doctor: user });
      setStatus("host");
    } else {
      socket.emit("patientJoinRequest", { roomId, patient: user });
      setStatus("waiting");
    }
  }, [mounted, socket, roomId, user, isHost]);

  useEffect(() => {
    if (!mounted || !socket) return;

    const onPatientJoin = ({
      roomId: _roomId,
      patient,
    }: {
      roomId: string;
      patient: PendingPatient;
    }) => {
      setPendingPatients((prev) =>
        prev.find((p) => p.userId === patient.userId)
          ? prev
          : [...prev, patient]
      );
    };

    const onApproved = (call: OngoingCall) => {
      if (startedRef.current) return;
      startedRef.current = true;
      setStatus("started");

      // Auto-start WebRTC:
      try {
        if (call.participants.caller.userId === user?.id) {
          // I am the patient (caller/initiator)
          handleCall(call.participants.receiver);
        } else {
          // I am the doctor (callee)
          handleJoinCall(call);
        }
      } catch (e) {
        // If anything fails, allow user to refresh/try again; we keep status started.
        console.error("Auto-start error:", e);
      }
    };

    const onRejected = () => setStatus("rejected");
    const onNoDoctor = () => setStatus("noDoctor");

    socket.on("patientJoinRequest", onPatientJoin);
    socket.on("callApproved", onApproved);
    socket.on("joinRejected", onRejected);
    socket.on("noDoctorOnline", onNoDoctor);

    return () => {
      socket.off("patientJoinRequest", onPatientJoin);
      socket.off("callApproved", onApproved);
      socket.off("joinRejected", onRejected);
      socket.off("noDoctorOnline", onNoDoctor);
    };
  }, [mounted, socket, user, handleCall, handleJoinCall]);

  const approvePatient = (patientId: string) => {
    socket?.emit("approvePatient", { roomId, patientId });
    setPendingPatients((prev) => prev.filter((p) => p.userId !== patientId));
  };

  const rejectPatient = (patientId: string) => {
    socket?.emit("rejectPatient", { roomId, patientId });
    setPendingPatients((prev) => prev.filter((p) => p.userId !== patientId));
  };

  const Banner = () => {
    if (!mounted) {
      return (
        <p className="text-gray-800" suppressHydrationWarning>
          Loading meeting…
        </p>
      );
    }
    if (status === "host")
      return <p className="text-gray-800">You are a host.</p>;
    if (status === "waiting")
      return (
        <p className="text-gray-800">
          No one is here, waiting for meeting host.
        </p>
      );
    if (status === "noDoctor")
      return (
        <p className="text-red-600">
          No doctor online right now. Please try again later.
        </p>
      );
    if (status === "rejected")
      return (
        <p className="text-red-600">Your request was rejected by the host.</p>
      );
    if (status === "started") return null; // Video UI will render instead
    return null;
  };

  return (
    <div className="p-6 space-y-6" suppressHydrationWarning>
      <div>
        <h1 className="text-2xl font-semibold">Meeting Room</h1>
        <p className="text-sm text-gray-500">Room ID: {roomId || "…"}</p>
      </div>

      <div className="p-4 rounded border">
        <Banner />
        {mounted && status === "started" && <VideoCallWithChat />}
      </div>

      {mounted && isHost && status !== "started" && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Join Requests</h2>
          {pendingPatients.length === 0 && (
            <p className="text-gray-500 text-sm">No pending requests.</p>
          )}
          <ul className="space-y-3">
            {pendingPatients.map((p) => (
              <li
                key={p.userId}
                className="flex items-center justify-between p-3 rounded border"
              >
                <div>
                  <div className="font-medium">{p.userName || "Unknown"}</div>
                  <div className="text-xs text-gray-500">{p.userEmail}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => approvePatient(p.userId)}
                    className="px-3 py-1 rounded bg-green-600 text-white text-sm"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => rejectPatient(p.userId)}
                    className="px-3 py-1 rounded bg-red-600 text-white text-sm"
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
