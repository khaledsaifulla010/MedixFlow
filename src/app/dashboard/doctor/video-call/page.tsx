"use client";
import React from "react";
import { useParams } from "next/navigation";
import { useVideoCall } from "@/hooks/useVideoCall";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, XCircleIcon, MonitorUp } from "lucide-react";

const DoctorCallPage: React.FC = () => {
  const { id } = useParams();
  const {
    userVideoRef,
    peerVideoRef,
    inCall,
    micOn,
    toggleMic,
    endCall,
    startScreenShare,
  } = useVideoCall(`room-${id}`);

  return (
    <div className="w-full h-screen bg-black flex flex-col items-center justify-center">
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
      {!inCall && <p className="text-white mt-4">Waiting for patient...</p>}

      <div className="flex gap-4 mt-6">
        <Button onClick={toggleMic}>{micOn ? <Mic /> : <MicOff />}</Button>
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

export default DoctorCallPage;
