"use client";
import { useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";
import SimplePeer from "simple-peer";

export interface VideoCallHook {
  userVideoRef: React.RefObject<HTMLVideoElement | null>;
  peerVideoRef: React.RefObject<HTMLVideoElement | null>;
  inCall: boolean;
  micOn: boolean;
  cameraOn: boolean;
  cameras: MediaDeviceInfo[];
  selectedCameraId: string | null;
  toggleMic: () => void;
  toggleCamera: () => void;
  changeCamera: (deviceId: string) => void;
  endCall: () => void;
  startScreenShare: () => void;
}

export const useVideoCall = (roomId: string): VideoCallHook => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [peer, setPeer] = useState<SimplePeer.Instance | null>(null);
  const [inCall, setInCall] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);

  const userVideoRef = useRef<HTMLVideoElement>(null);
  const peerVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const targetRef = useRef<string | null>(null);

  // Get available cameras
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const videoDevices = devices.filter((d) => d.kind === "videoinput");
      setCameras(videoDevices);
      if (videoDevices[0]) setSelectedCameraId(videoDevices[0].deviceId);
    });
  }, []);

  // Initialize call
  useEffect(() => {
    const initCall = async () => {
      const s: Socket = io("/", { path: "/api/socket" });
      setSocket(s);

      if (!selectedCameraId) return;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: selectedCameraId },
        audio: true,
      });

      localStreamRef.current = stream;
      if (userVideoRef.current) userVideoRef.current.srcObject = stream;

      s.emit("join-room", roomId);

      s.on("other-user", (userId: string) => {
        targetRef.current = userId;

        const p = new SimplePeer({ initiator: true, trickle: false, stream });

        p.on("signal", (signal: any) => {
          if (targetRef.current)
            s.emit("offer", { target: targetRef.current, signal });
        });

        p.on("stream", (remoteStream: MediaStream) => {
          if (peerVideoRef.current)
            peerVideoRef.current.srcObject = remoteStream;
          setInCall(true);
        });

        s.on("answer", (payload: any) => {
          p.signal(payload.signal);
        });

        setPeer(p);
      });

      s.on("offer", (payload: any) => {
        const p = new SimplePeer({ initiator: false, trickle: false, stream });

        p.on("signal", (answerSignal: any) => {
          s.emit("answer", { target: payload.from, signal: answerSignal });
        });

        p.on("stream", (remoteStream: MediaStream) => {
          if (peerVideoRef.current)
            peerVideoRef.current.srcObject = remoteStream;
          setInCall(true);
        });

        p.signal(payload.signal);
        setPeer(p);
      });
    };

    initCall();

    return () => {
      peer?.destroy();
      socket?.disconnect();
    };
  }, [roomId, selectedCameraId]);

  // Toggle mic
  const toggleMic = () => {
    if (!localStreamRef.current) return;
    const audioTrack = localStreamRef.current.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setMicOn(audioTrack.enabled);
    }
  };

  // Toggle camera
  const toggleCamera = () => {
    if (!localStreamRef.current) return;
    const videoTrack = localStreamRef.current.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setCameraOn(videoTrack.enabled);
    }
  };

  // Change camera
  const changeCamera = async (deviceId: string) => {
    if (!localStreamRef.current) return;

    const newStream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId },
      audio: true,
    });

    const videoTrack = newStream.getVideoTracks()[0];
    const oldTrack = localStreamRef.current.getVideoTracks()[0];

    peer?.replaceTrack(oldTrack, videoTrack, localStreamRef.current);
    localStreamRef.current.removeTrack(oldTrack);
    localStreamRef.current.addTrack(videoTrack);

    if (userVideoRef.current)
      userVideoRef.current.srcObject = localStreamRef.current;

    setSelectedCameraId(deviceId);
    setCameraOn(true);
  };

  // End call
  const endCall = () => {
    peer?.destroy();
    window.close();
  };

  // Screen share
  const startScreenShare = async () => {
    if (!peer || !localStreamRef.current) return;

    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
    });
    const screenTrack = screenStream.getVideoTracks()[0];
    const videoTrack = localStreamRef.current.getVideoTracks()[0];

    peer.replaceTrack(videoTrack, screenTrack, localStreamRef.current);

    if (userVideoRef.current) userVideoRef.current.srcObject = screenStream;

    screenTrack.onended = () => {
      peer.replaceTrack(screenTrack, videoTrack, localStreamRef.current!);
      if (userVideoRef.current)
        userVideoRef.current.srcObject = localStreamRef.current;
    };
  };

  return {
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
  };
};
