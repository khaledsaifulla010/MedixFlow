"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  PhoneOff,
  Send,
} from "lucide-react";
import { useSocket } from "../../../../context/SocketContext";
import VideoContainer from "@/components/videoCall/VideoContainer";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  const [isMicOn, setIsMicOn] = useState(true);
  const [isVidOn, setIsVidOn] = useState(true);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  // ---------- Setup local stream info ----------
  useEffect(() => {
    if (!localStream) return;

    const videoTrack = localStream.getVideoTracks()[0];
    setIsVidOn(videoTrack?.enabled ?? true);

    const micTrack = localStream.getAudioTracks()[0];
    setIsMicOn(micTrack?.enabled ?? true);

    navigator.mediaDevices.enumerateDevices().then((devices) => {
      setVideoDevices(devices.filter((d) => d.kind === "videoinput"));
    });
  }, [localStream]);

  // ---------- Update remote stream ----------
  useEffect(() => {
    if (!peer) {
      setRemoteStream(null);
      return;
    }
    setRemoteStream(peer.stream || null);

    peer.peerConnection.on("stream", (stream: MediaStream) => {
      setRemoteStream(stream);
    });
  }, [peer]);

  const toggleMic = useCallback(() => {
    const micTrack = localStream?.getAudioTracks()[0];
    if (micTrack) {
      micTrack.enabled = !micTrack.enabled;
      setIsMicOn(micTrack.enabled);
    }
  }, [localStream]);

  const isOnCall = !!localStream && !!peer && !!ongoingCall;

  const remoteUserRole = ongoingCall?.participants
    ? ongoingCall.participants.caller.userId === user?.id
      ? ongoingCall.participants.receiver.userRole
      : ongoingCall.participants.caller.userRole
    : "";

  const handleSendMessage = () => {
    if (chatInput.trim() === "") return;
    sendMessage(chatInput.trim());
    setChatInput("");
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="relative w-full flex flex-row items-start gap-4 mt-4">
      {/* Video Section */}
      <div className="flex flex-col items-center">
        {/* Remote video */}
        {remoteStream && remoteVidOn ? (
          <div className="w-[800px] h-[450px] bg-black rounded-md overflow-hidden relative">
            <VideoContainer
              stream={remoteStream}
              isLocalStream={false}
              isOnCall={isOnCall}
            />
            <span className="absolute top-2 left-2 text-white font-bold bg-black/50 px-2 rounded">
              {remoteUserRole === "doctor" ? "Doctor Screen" : "Patient Screen"}
            </span>
          </div>
        ) : remoteStream && !remoteVidOn ? (
          <div className="w-[800px] h-[450px] bg-black flex items-center justify-center text-white font-bold rounded-md">
            {remoteUserRole === "doctor"
              ? "Doctor Camera Off"
              : "Patient Camera Off"}
          </div>
        ) : null}

        {/* Local PIP */}
        {localStream ? (
          <div className="absolute top-4 right-4 w-[200px] h-[120px] border-2 border-purple-500 rounded-md overflow-hidden">
            {isVidOn ? (
              <VideoContainer
                stream={localStream}
                isLocalStream={true}
                isOnCall={isOnCall}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white font-bold bg-gray-700">
                {user?.role === "doctor"
                  ? "Doctor Camera Off"
                  : "Patient Camera Off"}
              </div>
            )}
            <span className="absolute top-1 left-1 text-white font-bold bg-black/50 px-1 rounded text-xs">
              {user?.role === "doctor" ? "Doctor Screen" : "Patient Screen"}
            </span>
          </div>
        ) : null}

        {/* Controls */}
        <div className="mt-4 flex flex-col items-center gap-4">
          <div className="flex items-center gap-4">
            <Button onClick={toggleMic}>
              {isMicOn ? <Mic /> : <MicOff />}
            </Button>
            <Button
              onClick={() => {
                toggleCamera();
                setIsVidOn(!isVidOn);
              }}
            >
              {isVidOn ? <Video /> : <VideoOff />}
            </Button>
            <Button onClick={shareScreen}>
              <Monitor />
            </Button>
            <Button
              onClick={endCall}
              className="px-4 p-2 bg-rose-500 text-white rounded-md"
            >
              <PhoneOff />
            </Button>
          </div>

          {/* Camera switch */}
          {videoDevices.length > 1 && (
            <div className="mt-2 flex items-center gap-2">
              <label className="text-white">Camera:</label>
              <Select
                value={activeDeviceId || ""}
                onValueChange={(value) => switchCamera(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Camera" />
                </SelectTrigger>
                <SelectContent>
                  {videoDevices.map((device) => (
                    <SelectItem key={device.deviceId} value={device.deviceId}>
                      {device.label || `Camera ${device.deviceId}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {/* Chat Section */}
      <div className="w-[300px] h-[600px] flex flex-col border-2 border-gray-600 rounded-md p-2 bg-gray-900 text-white">
        <div className="flex-1 overflow-y-auto mb-2">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`mb-2 p-1 rounded ${
                msg.senderId === user?.id
                  ? "bg-purple-600 self-end"
                  : "bg-gray-700 self-start"
              }`}
            >
              <span className="font-bold">{msg.senderName}: </span>
              <span>{msg.text}</span>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded px-2 py-1"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSendMessage();
            }}
          />
          <Button onClick={handleSendMessage}>
            <Send />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VideoCallWithChat;
