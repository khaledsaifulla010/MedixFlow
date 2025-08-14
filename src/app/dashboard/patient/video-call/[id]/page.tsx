"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import io, { Socket } from "socket.io-client";
import SimplePeer from "simple-peer";
import { Button } from "@/components/ui/button";
import { XCircleIcon, MonitorUp, Mic, MicOff } from "lucide-react";

const VideoCallPage: React.FC = () => {
  const { id } = useParams(); // appointment ID
  const [socket, setSocket] = useState<Socket | null>(null);
  const [peer, setPeer] = useState<SimplePeer.Instance | null>(null);
  const [inCall, setInCall] = useState(false);
  const [swapVideos, setSwapVideos] = useState(false);
  const [micOn, setMicOn] = useState(true);

  const userVideoRef = useRef<HTMLVideoElement>(null);
  const peerVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const s: Socket = io("/", { path: "/api/socket" });
    setSocket(s);

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStreamRef.current = stream;
        if (userVideoRef.current) userVideoRef.current.srcObject = stream;

        s.emit("join-room", `room-${id}`);

        // When another user joins
        s.on("other-user", (userId: string) => {
          const p = new SimplePeer({ initiator: true, trickle: false, stream });
          p.on("signal", (signal) =>
            s.emit("offer", { target: userId, signal })
          );
          p.on("stream", (remoteStream) => {
            if (peerVideoRef.current)
              peerVideoRef.current.srcObject = remoteStream;
          });
          s.on("answer", ({ signal }) => p.signal(signal));
          setPeer(p);
          setInCall(true);
        });

        // When receiving an offer
        s.on("offer", ({ signal, target }) => {
          const p = new SimplePeer({
            initiator: false,
            trickle: false,
            stream,
          });
          p.on("signal", (answerSignal) =>
            s.emit("answer", { target, signal: answerSignal })
          );
          p.on("stream", (remoteStream) => {
            if (peerVideoRef.current)
              peerVideoRef.current.srcObject = remoteStream;
          });
          p.signal(signal);
          setPeer(p);
          setInCall(true);
        });
      });

    return () => {
      peer?.destroy();
      s.disconnect();
    };
  }, [id]);

  const toggleMic = () => {
    if (!localStreamRef.current) return;
    const audioTrack = localStreamRef.current.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setMicOn(audioTrack.enabled);
    }
  };

  const endCall = () => {
    peer?.destroy();
    window.close();
  };

  const startScreenShare = async () => {
    if (!peer) return;
    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
    });
    const videoTrack = screenStream.getVideoTracks()[0];

    const currentStream = localStreamRef.current as MediaStream;
    const oldTrack = currentStream.getVideoTracks()[0];

    peer.replaceTrack(oldTrack, videoTrack, currentStream);

    videoTrack.onended = () => {
      peer.replaceTrack(videoTrack, oldTrack, currentStream);
      if (userVideoRef.current) userVideoRef.current.srcObject = currentStream;
    };

    if (userVideoRef.current) userVideoRef.current.srcObject = screenStream;
  };

  return (
    <div className="w-full h-[600px]  flex flex-col items-center justify-center">
      {/* Video Container */}
      <div className="relative w-full h-full flex justify-center items-center mt-4">
        {/* Patient / Self Video */}
        <video
          ref={userVideoRef}
          autoPlay
          muted
          onClick={() => setSwapVideos(!swapVideos)}
          className={`object-cover cursor-pointer transition-all duration-300 border-2 border-white rounded-lg shadow-lg
            ${
              swapVideos
                ? "absolute top-0 left-0 w-full h-full z-10"
                : "absolute bottom-4 right-4 w-48 h-36 z-20"
            }`}
        />

        {/* Doctor / Peer Video */}
        <video
          ref={peerVideoRef}
          autoPlay
          onClick={() => setSwapVideos(!swapVideos)}
          className={`object-cover cursor-pointer transition-all duration-300 border-2 border-white rounded-lg shadow-lg
            ${
              swapVideos
                ? "absolute bottom-4 right-4 w-48 h-36 z-20"
                : "absolute top-0 left-0 w-full h-full z-10"
            }`}
        />

        {/* Waiting Overlay */}
        {!inCall && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-30 pointer-events-none">
            <p className="text-yellow-400 text-xl font-bold mt-8">
              Waiting for doctor to join...
            </p>
            <div className="loader border-t-yellow-400 border-b-yellow-400 w-16 h-16 rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-6 flex gap-4">
        <Button
          onClick={toggleMic}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 cursor-pointer text-white font-bold"
        >
          {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          {micOn ? "Talk" : "Mute"}
        </Button>

        <Button
          onClick={startScreenShare}
          className="flex items-center gap-2 bg-purple-700 hover:bg-purple-800 cursor-pointer text-white font-bold"
        >
          <MonitorUp className="h-5 w-5" /> Share Screen
        </Button>

        <Button
          onClick={endCall}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 cursor-pointer text-white font-bold"
        >
          <XCircleIcon className="h-5 w-5" /> End Call
        </Button>
      </div>
    </div>
  );
};

export default VideoCallPage;
