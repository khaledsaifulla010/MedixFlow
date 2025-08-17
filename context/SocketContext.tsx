"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useSelector } from "react-redux";
import { io, Socket } from "socket.io-client";
import { OngoingCall, Participants, PeerData, SocketUser } from "../types";
import { User } from "@/types/auth";
import Peer, { SignalData } from "simple-peer";

interface ChatMessage {
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  receiverId?: string;
}

interface iSocketContext {
  onlineUsers: SocketUser[] | null;
  user: User | null;
  isSocketConnected: boolean;
  handleCall: (user: SocketUser) => void;
  ongoingCall: OngoingCall | null;
  localStream: MediaStream | null;
  handleJoinCall: (ongoingCall: OngoingCall) => void;
  peer: PeerData | null;
  remoteVidOn: boolean;
  toggleCamera: () => void;
  switchCamera: (deviceId: string) => void;
  shareScreen: () => void;
  endCall: () => void;
  activeDeviceId: string | null;

  // Chat
  messages: ChatMessage[];
  sendMessage: (text: string) => void;
}

export const SocketContext = createContext<iSocketContext | null>(null);

export const SocketContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const user = useSelector((state: any) => state.auth.user);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<SocketUser[] | null>(null);
  const [ongoingCall, setOngoingCall] = useState<OngoingCall | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [peer, setPeer] = useState<PeerData | null>(null);
  const [remoteVidOn, setRemoteVidOn] = useState(true);
  const [activeDeviceId, setActiveDeviceId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const currentSocketUser = onlineUsers?.find(
    (onlineUser) => onlineUser.userId === user?.id
  );

  // ---------- Get Media Stream ----------
  const getMediaStream = useCallback(async (deviceId?: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: deviceId ? { deviceId: { exact: deviceId } } : true,
      });
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.log("Failed to get media stream", error);
      setLocalStream(null);
      return null;
    }
  }, []);

  // ---------- Create Peer ----------
  const createPeer = useCallback(
    (stream: MediaStream, initiator: boolean, participantUser: SocketUser) => {
      const peerInstance = new Peer({ stream, initiator, trickle: true });

      peerInstance.on("stream", (remoteStream) => {
        setPeer((prev) =>
          prev
            ? { ...prev, stream: remoteStream, isCaller: prev.isCaller }
            : prev
        );
      });

      peerInstance.on("error", console.error);

      return {
        peerConnection: peerInstance,
        stream,
        participantUser,
        isCaller: initiator,
      };
    },
    []
  );

  // ---------- Handle Call ----------
  const handleCall = useCallback(
    async (receiver: SocketUser) => {
      if (!currentSocketUser || !socket || !receiver.socketId) return;

      const stream = await getMediaStream(activeDeviceId || undefined);
      if (!stream) return;

      const participants: Participants = {
        caller: currentSocketUser,
        receiver,
      };
      setOngoingCall({ participants, isRinging: false });

      const newPeer = createPeer(stream, true, receiver);
      setPeer(newPeer);

      newPeer.peerConnection.on("signal", (data: SignalData) => {
        if (!newPeer.peerConnection.destroyed) {
          socket.emit("webrtcSignal", {
            sdp: data,
            ongoingCall: { participants },
            isCaller: true,
          });
        }
      });

      socket.emit("call", participants);
    },
    [socket, currentSocketUser, getMediaStream, activeDeviceId, createPeer]
  );

  // ---------- Handle Join Call ----------
  const handleJoinCall = useCallback(
    async (ongoingCall: OngoingCall) => {
      const stream = await getMediaStream(activeDeviceId || undefined);
      if (!stream) return;

      const newPeer = createPeer(
        stream,
        false,
        ongoingCall.participants.caller
      );
      setPeer(newPeer);

      newPeer.peerConnection.on("signal", (data: SignalData) => {
        if (!newPeer.peerConnection.destroyed) {
          socket?.emit("webrtcSignal", {
            sdp: data,
            ongoingCall,
            isCaller: false,
          });
        }
      });

      setOngoingCall((prev) => (prev ? { ...prev, isRinging: false } : prev));
    },
    [socket, getMediaStream, activeDeviceId, createPeer]
  );

  // ---------- WebRTC Signal ----------
  useEffect(() => {
    if (!socket || !peer?.peerConnection) return;

    const handleSignal = (data: SignalData) => {
      if (peer.peerConnection && !peer.peerConnection.destroyed) {
        peer.peerConnection.signal(data);
      }
    };

    socket.on("webrtcSignal", handleSignal);
    return () => {
      socket.off("webrtcSignal", handleSignal);
    };
  }, [socket, peer]);

  // ---------- Socket Init ----------
  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("accessToken");
    const newSocket = io({ auth: { token }, query: { userId: user.id } });

    newSocket.on("connect", () => {
      newSocket.emit("addNewUser", user);
      setIsSocketConnected(true);
    });
    newSocket.on("disconnect", () => setIsSocketConnected(false));

    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  // ---------- Online Users ----------
  useEffect(() => {
    if (!socket || !isSocketConnected) return;

    socket.emit("addNewUser", user);
    socket.on("getUsers", (res: SocketUser[]) => setOnlineUsers(res));

    return () => {
      socket.off("getUsers");
    };
  }, [socket, isSocketConnected, user]);

  // ---------- Incoming Call ----------
  const onInComingCall = useCallback((participants: Participants) => {
    setOngoingCall({ participants, isRinging: true });
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on("inComingCall", onInComingCall);
    return () => {
      socket.off("inComingCall");
    };
  }, [socket, onInComingCall]);

  // ---------- Toggle Camera ----------
  const toggleCamera = useCallback(() => {
    const videoTrack = localStream?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      socket?.emit("toggleVideo", {
        userId: user?.id,
        isVidOn: videoTrack.enabled,
      });
    }
  }, [localStream, socket, user]);

  // ---------- Switch Camera ----------
  const switchCamera = useCallback(
    async (deviceId: string) => {
      const newStream = await getMediaStream(deviceId);
      if (!newStream || !peer) return;

      try {
        if (peer.peerConnection && !peer.peerConnection.destroyed) {
          peer.peerConnection.destroy();
        }

        const newPeer = createPeer(
          newStream,
          peer.isCaller,
          peer.participantUser
        );

        newPeer.peerConnection.on("signal", (data: SignalData) => {
          if (!newPeer.peerConnection.destroyed) {
            socket?.emit("webrtcSignal", {
              sdp: data,
              ongoingCall,
              isCaller: peer.isCaller,
            });
          }
        });

        setPeer(newPeer);
        setLocalStream(newStream);
        setActiveDeviceId(deviceId);
      } catch (err) {
        console.error("Switch camera failed", err);
      }
    },
    [peer, getMediaStream, socket, createPeer, ongoingCall]
  );

  // ---------- Screen Sharing ----------
  const shareScreen = useCallback(async () => {
    if (!peer || !localStream) return;

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      const screenTrack = screenStream.getVideoTracks()[0];
      const cameraTrack = localStream.getVideoTracks()[0];

      peer.peerConnection.replaceTrack(cameraTrack, screenTrack, localStream);

      screenTrack.onended = async () => {
        const newCameraStream = await navigator.mediaDevices.getUserMedia({
          video: activeDeviceId
            ? { deviceId: { exact: activeDeviceId } }
            : true,
          audio: true,
        });
        const newCameraTrack = newCameraStream.getVideoTracks()[0];

        peer.peerConnection.replaceTrack(
          screenTrack,
          newCameraTrack,
          localStream
        );
        setLocalStream(newCameraStream);
      };
    } catch (err) {
      console.error("Screen share failed", err);
    }
  }, [peer, localStream, activeDeviceId]);

  // ---------- End Call ----------
  const endCall = useCallback(() => {
    try {
      peer?.peerConnection?.destroy();
      localStream?.getTracks().forEach((t) => t.stop());
      setPeer(null);
      setLocalStream(null);
      setOngoingCall(null);
    } catch (err) {
      console.error("End call error", err);
    }
  }, [peer, localStream]);

  // ---------- Remote video toggle ----------
  useEffect(() => {
    if (!socket) return;
    socket.on("remoteVideoToggle", (isOn: boolean) => setRemoteVidOn(isOn));
    return () => {
      socket.off("remoteVideoToggle");
    };
  }, [socket]);

  // ---------- Chat ----------
  const sendMessage = useCallback(
    (text: string) => {
      if (!socket || !user || !ongoingCall) return;

      const receiverId =
        ongoingCall.participants.caller.userId === user.id
          ? ongoingCall.participants.receiver.userId
          : ongoingCall.participants.caller.userId;

      const message = {
        senderId: user.id,
        senderName: user.name,
        text,
        timestamp: Date.now(),
        receiverId,
      };

      // Send to server
      socket.emit("sendMessage", message);

      // Add locally
      setMessages((prev) => [...prev, message]);
    },
    [socket, user, ongoingCall]
  );

  // Listen for incoming messages
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("receiveMessage", handleMessage);

    return () => {
      socket.off("receiveMessage", handleMessage);
    };
  }, [socket]);

  return (
    <SocketContext.Provider
      value={{
        onlineUsers,
        handleCall,
        user,
        ongoingCall,
        isSocketConnected,
        localStream,
        handleJoinCall,
        peer,
        remoteVidOn,
        toggleCamera,
        switchCamera,
        shareScreen,
        endCall,
        activeDeviceId,

        messages,
        sendMessage,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

// ---------- Custom Hook ----------
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context)
    throw new Error("useSocket must be used within SocketContextProvider");
  return context;
};
