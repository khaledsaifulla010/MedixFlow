"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { OngoingCall, SocketUser } from "../../../../../types";
import { useSocket } from "../../../../../context/SocketContext";
import VideoCallWithChat from "@/components/videoCall/VideoCall";
import { Button } from "@/components/ui/button";

type PendingPatient = SocketUser;

export default function MeetingRoom() {
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

  const startedRef = useRef(false);

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

      try {
        if (call.participants.caller.userId === user?.id) {
          handleCall(call.participants.receiver);
        } else {
          handleJoinCall(call);
        }
      } catch (e) {
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
      return (
        <p className="text-lg text-center font-bold">
          You are the Meeting Host.
        </p>
      );
    if (status === "waiting")
      return (
        <p className="text-lg text-center font-bold">
          No one is here. Waiting for Doctor.
        </p>
      );
    if (status === "noDoctor")
      return (
        <p className="text-red-600 text-lg text-center font-bold">
          No doctor online right now. Please try again later.
        </p>
      );
    if (status === "rejected")
      return (
        <p className="text-red-600 text-lg text-center font-bold">
          Your request was rejected by the doctor.
        </p>
      );
    if (status === "started") return null;
    return null;
  };

  return (
    <div className="p-6 space-y-6 border-2 rounded-md" suppressHydrationWarning>
      <div>
        <h1 className="text-3xl font-bold">Meeting Room</h1>
        <p className="text-sm dark:text-gray-300 mt-2">
          Meeting ID: {roomId || "…"}
        </p>
      </div>

      <div className="p-4 rounded border">
        <Banner />
        {mounted && status === "started" && <VideoCallWithChat />}
      </div>

      {mounted && isHost && status !== "started" && (
        <div className="space-y-3">
          <h2 className="text-2xl font-bold">Patient Requests</h2>
          {pendingPatients.length === 0 && (
            <p className="text-sm">No pending requests.</p>
          )}
          <ul className="space-y-3">
            {pendingPatients.map((p) => (
              <li
                key={p.userId}
                className="flex items-center justify-between p-3 rounded border"
              >
                <div>
                  <div className="font-medium text-lg">
                    {p.userName || "Unknown"}
                  </div>
                  <div className="text-sm dark:text-gray-300">
                    {p.userEmail}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Button
                    onClick={() => approvePatient(p.userId)}
                    className="bg-green-600 hover:bg-green-700 cursor-pointer font-bold text-white"
                  >
                    Accept
                  </Button>
                  <Button
                    onClick={() => rejectPatient(p.userId)}
                    className="bg-red-600 hover:bg-red-700 cursor-pointer font-bold text-white"
                  >
                    Reject
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
