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
  socket: Socket | null;
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
  const [pendingSignals, setPendingSignals] = useState<SignalData[]>([]);

  const currentSocketUser =
    onlineUsers?.find((onlineUser) => onlineUser.userId === user?.id) ?? null;

  const pickDefaultCameraId = (cams: MediaDeviceInfo[]) => {
    const rx = /integrated|built[- ]?in|facetime|hd\s*webcam|default/i;
    const byName = cams.find((d) => rx.test(d.label));
    return (byName || cams[0])?.deviceId || null;
  };

  // ---------- Get Media Stream (prefers integrated cam) ----------
  const getMediaStream = useCallback(
    async (deviceId?: string) => {
      try {
        let stream: MediaStream | null = null;
        const targetId = deviceId || activeDeviceId;

        if (targetId) {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: { deviceId: { exact: targetId } },
          });
        } else {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
          });
          const devices = await navigator.mediaDevices.enumerateDevices();
          const cams = devices.filter((d) => d.kind === "videoinput");
          if (cams.length > 0) {
            const integratedId = pickDefaultCameraId(cams);
            if (integratedId) {
              const currentId = stream
                .getVideoTracks()[0]
                ?.getSettings()?.deviceId;
              if (currentId !== integratedId) {
                stream.getTracks().forEach((t) => t.stop());
                stream = await navigator.mediaDevices.getUserMedia({
                  audio: true,
                  video: { deviceId: { exact: integratedId } },
                });
              }
              setActiveDeviceId(integratedId);
            }
          }
        }

        setLocalStream(stream);
        return stream;
      } catch (error) {
        console.log("Failed to get media stream", error);
        setLocalStream(null);
        return null;
      }
    },
    [activeDeviceId]
  );

  // ---------- Create Peer (REMOTE stream only) ----------
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
        stream: undefined, // keep undefined until remote arrives
        participantUser,
        isCaller: initiator,
      };
    },
    []
  );

  // ---------- Handle Call (initiator) ----------
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

  // ---------- Handle Join Call (callee) ----------
  const handleJoinCall = useCallback(
    async (call: OngoingCall) => {
      const stream = await getMediaStream(activeDeviceId || undefined);
      if (!stream) return;

      const newPeer = createPeer(stream, false, call.participants.caller);
      setPeer(newPeer);

      newPeer.peerConnection.on("signal", (data: SignalData) => {
        if (!newPeer.peerConnection.destroyed) {
          socket?.emit("webrtcSignal", {
            sdp: data,
            ongoingCall: call,
            isCaller: false,
          });
        }
      });

      // Drain any early SDPs
      setPendingSignals((queued) => {
        queued.forEach((sdp) => {
          if (!newPeer.peerConnection.destroyed)
            newPeer.peerConnection.signal(sdp);
        });
        return [];
      });

      setOngoingCall((prev) => (prev ? { ...prev, isRinging: false } : prev));
    },
    [socket, getMediaStream, activeDeviceId, createPeer]
  );

  // ---------- WebRTC Signal (queue until peer ready) ----------
  useEffect(() => {
    if (!socket) return;

    const handleSignal = (data: SignalData) => {
      const pc = peer?.peerConnection;
      if (pc && !pc.destroyed) {
        pc.signal(data);
      } else {
        setPendingSignals((prev) => [...prev, data]);
      }
    };

    socket.on("webrtcSignal", handleSignal);
    return () => {
      socket.off("webrtcSignal", handleSignal);
    };
  }, [socket, peer?.peerConnection]);

  // ---------- Socket lifecycle ----------
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

  // ---------- Incoming Call (ring) ----------
  const onInComingCall = useCallback((participants: Participants) => {
    setOngoingCall({ participants, isRinging: true });
  }, []);
  useEffect(() => {
    if (!socket) return;
    socket.on("inComingCall", onInComingCall);
    return () => {
      socket.off("inComingCall", onInComingCall);
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

  // ---------- 🚀 Switch Camera (use replaceTrack) ----------
  const switchCamera = useCallback(
    async (deviceId: string) => {
      try {
        const camOnly = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: deviceId } },
          audio: false,
        });
        const newVideoTrack = camOnly.getVideoTracks()[0];
        if (!newVideoTrack) return;

        const ensureLocalStream = async (): Promise<MediaStream> => {
          if (localStream && localStream.id) return localStream;

          let audioTracks: MediaStreamTrack[] = [];
          try {
            const audioOnly = await navigator.mediaDevices.getUserMedia({
              audio: true,
              video: false,
            });
            audioTracks = audioOnly.getAudioTracks();
          } catch {}
          const fresh = new MediaStream([...audioTracks, newVideoTrack]);
          setLocalStream(fresh);
          return fresh;
        };

        const stream = await ensureLocalStream();

        const oldVideoTrack = stream.getVideoTracks()[0] || null;

        if (peer?.peerConnection && !peer.peerConnection.destroyed) {
          let replaced = false;

          if (oldVideoTrack) {
            try {
              peer.peerConnection.replaceTrack(
                oldVideoTrack,
                newVideoTrack,
                stream
              );
              replaced = true;
            } catch (e) {}
          }

          if (!replaced) {
            try {
              peer.peerConnection.addTrack(newVideoTrack, stream);
            } catch (e) {
              console.error(
                "addTrack failed; you may need to re-negotiate/join",
                e
              );
            }
          }
        }

        // 4) Update the local MediaStream CONTENT (keep the same object!)
        if (oldVideoTrack && oldVideoTrack !== newVideoTrack) {
          stream.removeTrack(oldVideoTrack); // remove from stream
          oldVideoTrack.stop(); // now safe to stop
        }
        // Add new if not already present
        const hasNew = stream
          .getVideoTracks()
          .some((t) => t.id === newVideoTrack.id);
        if (!hasNew) stream.addTrack(newVideoTrack);

        // 5) Reflect state (keep the SAME stream object reference in state)
        //    We call setLocalStream with the same instance to keep React in sync.
        setLocalStream(stream);
        setActiveDeviceId(deviceId);
      } catch (err) {
        console.error("Switch camera failed", err);
      }
    },
    [localStream, peer]
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

        // update local stream to reflect camera restored
        const rebuilt = new MediaStream([
          ...localStream.getAudioTracks(),
          newCameraTrack,
        ]);
        setLocalStream(rebuilt);
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
      setPendingSignals([]);
    } catch (err) {
      console.error("End call error", err);
    }
  }, [peer, localStream]);

  // ---------- Remote video toggle ----------
  useEffect(() => {
    if (!socket) return;
    const handler = (isOn: boolean) => setRemoteVidOn(isOn);
    socket.on("remoteVideoToggle", handler);
    return () => {
      socket.off("remoteVideoToggle", handler);
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
      socket.emit("sendMessage", message);
      setMessages((prev) => [...prev, message]);
    },
    [socket, user, ongoingCall]
  );

  useEffect(() => {
    if (!socket) return;
    const handleMessage = (msg: ChatMessage) =>
      setMessages((prev) => [...prev, msg]);
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
        socket,
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
