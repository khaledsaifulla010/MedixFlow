"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useVideoCall } from "@/hooks/useVideoCall";
import { Button } from "@/components/ui/button";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  XCircleIcon,
  MonitorUp,
} from "lucide-react";

const VideoCallPage: React.FC = () => {
  const { id } = useParams();
  const [role, setRole] = useState<"doctor" | "patient">("patient");

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");
    setRole(storedRole === "doctor" ? "doctor" : "patient");
  }, []);

  const {
    userVideoRef,
    peerVideoRef,
    inCall,
    micOn,
    cameraOn,
    cameras,
    selectedCameraId,
    toggleMic,
    toggleCamera,
    changeCamera,
    endCall,
    startScreenShare,
  } = useVideoCall(`room-${id}`);

  return (
    <div className="w-full h-screen bg-black flex flex-col items-center justify-center">
      <h1 className="text-white text-xl mb-4">
        {role === "doctor" ? "Doctor" : "Patient"} Video Call
      </h1>

      <video
        ref={userVideoRef}
        autoPlay
        muted
        className="w-48 h-36 rounded-lg border-2"
      />
      <video
        ref={peerVideoRef}
        autoPlay
        className="w-96 h-72 rounded-lg border-2 mt-4"
      />

      {!inCall && (
        <p className="text-white mt-4">
          Waiting for {role === "doctor" ? "patient" : "doctor"}...
        </p>
      )}

      {/* Camera selection */}
      {cameras.length > 1 && (
        <select
          value={selectedCameraId || ""}
          onChange={(e) => changeCamera(e.target.value)}
          className="mb-4 p-1 rounded bg-gray-200 text-black"
        >
          {cameras.map((cam) => (
            <option key={cam.deviceId} value={cam.deviceId}>
              {cam.label || `Camera ${cam.deviceId}`}
            </option>
          ))}
        </select>
      )}

      <div className="flex gap-4 mt-2">
        <Button onClick={toggleMic}>{micOn ? <Mic /> : <MicOff />}</Button>
        <Button onClick={toggleCamera}>
          {cameraOn ? <Video /> : <VideoOff />}
        </Button>
        <Button onClick={startScreenShare}>
          <MonitorUp />
        </Button>
        <Button onClick={endCall}>
          <XCircleIcon />
        </Button>
      </div>
    </div>
  );
};

export default VideoCallPage;
