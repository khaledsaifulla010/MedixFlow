"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSocket } from "../../../context/SocketContext";
import VideoContainer from "./VideoContainer";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  PhoneOff,
  Send,
  Camera,
} from "lucide-react";

const VideoCallWithChat = () => {
  const {
    localStream,
    peer,
    ongoingCall,
    user,
    remoteVidOn,
    toggleCamera,
    switchCamera,
    shareScreen,
    endCall,
    activeDeviceId,
    messages,
    sendMessage,
  } = useSocket();

  const router = useRouter();

  const [isMicOn, setIsMicOn] = useState(true);
  const [isVidOn, setIsVidOn] = useState(true);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!localStream) return;

    const v = localStream.getVideoTracks()[0];
    setIsVidOn(v?.enabled ?? true);

    const a = localStream.getAudioTracks()[0];
    setIsMicOn(a?.enabled ?? true);

    navigator.mediaDevices.enumerateDevices().then((devices) => {
      setVideoDevices(devices.filter((d) => d.kind === "videoinput"));
    });
  }, [localStream]);

  const toggleMic = useCallback(() => {
    const micTrack = localStream?.getAudioTracks()[0];
    if (micTrack) {
      micTrack.enabled = !micTrack.enabled;
      setIsMicOn(micTrack.enabled);
    }
  }, [localStream]);

  const isOnCall = !!localStream && !!ongoingCall;

  const remoteUserRole = ongoingCall?.participants
    ? ongoingCall.participants.caller.userId === user?.id
      ? ongoingCall.participants.receiver.userRole
      : ongoingCall.participants.caller.userRole
    : "";

  const handleSendMessage = () => {
    const text = chatInput.trim();
    if (!text) return;
    sendMessage(text);
    setChatInput("");
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const endCallAndReturn = useCallback(() => {
    try {
      endCall();
    } finally {
      if (typeof window !== "undefined" && window.history.length > 1) {
        router.back();
      } else {
        const fallback =
          user?.role === "doctor"
            ? "/dashboard/doctor/patient-queue"
            : "/dashboard/patient/meeting";
        router.push(fallback);
      }
    }
  }, [endCall, router, user?.role]);

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6">
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 ">
        <div className="flex-1 min-w-0 border-2 rounded-md">
          <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-xl">
            {peer?.stream ? (
              remoteVidOn ? (
                <VideoContainer
                  stream={peer.stream}
                  isLocalStream={false}
                  isOnCall={isOnCall}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/80">
                  {remoteUserRole === "doctor"
                    ? "Doctor Camera Off"
                    : "Patient Camera Off"}
                </div>
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/80">
                Connecting to remote…
              </div>
            )}
            {localStream && (
              <div className="absolute right-3 bottom-3 w-[28%] max-w-[240px] min-w-[120px] aspect-video rounded-lg overflow-hidden ring-2 ring-white/50 shadow-lg bg-black">
                {isVidOn ? (
                  <VideoContainer
                    stream={localStream}
                    isLocalStream={true}
                    isOnCall={isOnCall}
                  />
                ) : (
                  <div className="w-full h-full bg-black text-white flex items-center justify-center text-xs">
                    Camera Off
                  </div>
                )}
              </div>
            )}
            {peer?.stream && (
              <span className="absolute top-2 left-2 text-white text-xs sm:text-sm font-semibold bg-black/50 px-2 py-0.5 rounded ">
                {remoteUserRole === "doctor" ? "Doctor" : "Patient"}
              </span>
            )}
            {localStream && (
              <span className="absolute bottom-[calc(3px+28%+8px)] right-3 text-white text-[10px] sm:text-xs font-semibold bg-black/50 px-2 py-0.5 rounded">
                {user?.role === "doctor" ? "You (Doctor)" : "You (Patient)"}
              </span>
            )}
          </div>
          <div className="mt-16 flex flex-col items-center gap-3">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                onClick={toggleMic}
                className="min-w-[44px] h-11"
                title={isMicOn ? "Mute" : "Unmute"}
              >
                {isMicOn ? <Mic /> : <MicOff />}
              </Button>

              <Button
                onClick={() => {
                  toggleCamera();
                  setIsVidOn((v) => !v);
                }}
                className="min-w-[44px] h-11"
                title={isVidOn ? "Turn camera off" : "Turn camera on"}
              >
                {isVidOn ? <Video /> : <VideoOff />}
              </Button>

              <Button
                onClick={shareScreen}
                className="min-w-[44px] h-11"
                title="Share screen"
              >
                <Monitor />
              </Button>

              <Button
                onClick={endCallAndReturn}
                className="min-w-[44px] h-11 bg-rose-600 hover:bg-rose-700 text-white"
                title="End call"
              >
                <PhoneOff />
              </Button>
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-gray-700" />
                <Select
                  value={activeDeviceId || ""}
                  onValueChange={(value) => switchCamera(value)}
                >
                  <SelectTrigger className="w-[200px] h-11">
                    <SelectValue placeholder="Select Camera" />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {videoDevices.map((device) => (
                      <SelectItem key={device.deviceId} value={device.deviceId}>
                        {device.label || `Camera ${device.deviceId}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full lg:w-[360px] xl:w-[420px] flex flex-col bg-gray-900 text-white rounded-xl shadow-xl border-2">
          <div className="px-4 py-3 border-b border-gray-800 rounded-t-xl">
            <h2 className="text-base sm:text-lg font-semibold">Chat</h2>
          </div>
          <div className="flex-1 min-h-[280px] max-h-[50vh] lg:max-h-[calc(100vh-320px)] overflow-y-auto p-3 space-y-2">
            {messages.map((msg, idx) => {
              const mine = msg.senderId === user?.id;
              return (
                <div
                  key={`${msg.timestamp}-${msg.senderId}-${idx}`}
                  className={`w-fit max-w-[85%] md:max-w-[75%] px-3 py-2 rounded-lg text-sm break-words ${
                    mine ? "ml-auto bg-purple-600" : "mr-auto bg-gray-700"
                  }`}
                >
                  <span className="block font-semibold">{msg.senderName}</span>
                  <span>{msg.text}</span>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>
          <div className="p-3 border-t border-gray-800 rounded-b-xl">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a message…"
                className="flex-1 rounded-lg px-3 py-2  outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendMessage();
                }}
              />
              <Button
                onClick={handleSendMessage}
                className="h-11 min-w-[44px]"
                title="Send"
              >
                <Send />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCallWithChat;
