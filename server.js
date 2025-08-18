import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";

const PORT = parseInt(process.env.PORT || "3000", 10);
const HOST = process.env.HOST || "0.0.0.0";

const app = next({ dev });
const handler = app.getRequestHandler();

// In-memory room queues: roomId -> Map<userId, SocketUser>
const roomQueues = new Map();
function getRoomQueue(roomId) {
  if (!roomQueues.has(roomId)) {
    roomQueues.set(roomId, new Map());
  }
  return roomQueues.get(roomId);
}

app.prepare().then(() => {
  // Create one HTTP server for Next.js + Socket.IO
  const httpServer = createServer((req, res) => handler(req, res));

  const corsOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",").map((s) => s.trim())
    : "*";

  const io = new Server(httpServer, {
    cors: { origin: corsOrigins, methods: ["GET", "POST"], credentials: true },
    path: "/socket.io",
  });

  let onlineUsers = [];

  io.on("connection", (socket) => {
    console.log("New socket connected:", socket.id);

    // ---------- User Connected ----------
    socket.on("addNewUser", (user) => {
      const newUser = {
        socketId: socket.id,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userRole: user.role,
      };
      onlineUsers = onlineUsers.filter((u) => u.userId !== user.id);
      onlineUsers.push(newUser);
      io.emit("getUsers", onlineUsers);
    });

    // ---------- Disconnect ----------
    socket.on("disconnect", () => {
      onlineUsers = onlineUsers.filter((u) => u.socketId !== socket.id);
      io.emit("getUsers", onlineUsers);
    });

    // ---------- Call ----------
    socket.on("call", (participants) => {
      const receiverSocketId = participants.receiver.socketId;
      io.to(receiverSocketId).emit("inComingCall", participants);
    });

    // ---------- WebRTC signaling ----------
    socket.on("webrtcSignal", ({ sdp, ongoingCall, isCaller }) => {
      const targetSocketId = isCaller
        ? ongoingCall.participants.receiver.socketId
        : ongoingCall.participants.caller.socketId;
      io.to(targetSocketId).emit("webrtcSignal", sdp);
    });

    // ---------- Remote Video Toggle ----------
    socket.on("toggleVideo", ({ userId, isVidOn }) => {
      const participant = onlineUsers.find((u) => u.userId !== userId);
      if (participant)
        io.to(participant.socketId).emit("remoteVideoToggle", isVidOn);
    });

    // ---------- Chat ----------
    socket.on("sendMessage", (message) => {
      const receiver = onlineUsers.find((u) => u.userId === message.receiverId);
      if (receiver) io.to(receiver.socketId).emit("receiveMessage", message);
    });

    // ---------- Meeting Room / Waiting Room ----------

    // Doctor opens the meeting route
    socket.on("doctorJoinRoom", ({ roomId, doctor }) => {
      socket.join(roomId);

      // Replay any waiting patients for this room to the doctor
      const queue = getRoomQueue(roomId);
      for (const [, patient] of queue.entries()) {
        io.to(socket.id).emit("patientJoinRequest", { roomId, patient });
      }

      io.to(roomId).emit("doctorPresent");
    });

    // Patient requests to join a meeting room
    socket.on("patientJoinRequest", ({ roomId, patient }) => {
      socket.join(roomId);

      // Normalize patient to SocketUser shape
      const fromOnline =
        onlineUsers.find(
          (u) => u.userId === (patient?.id || patient?.userId)
        ) || null;

      const normalizedPatient = fromOnline
        ? fromOnline
        : {
            socketId: socket.id,
            userId: String(patient?.id || patient?.userId || ""),
            userName: String(patient?.name || patient?.userName || ""),
            userEmail: String(patient?.email || patient?.userEmail || ""),
            userRole: String(patient?.role || patient?.userRole || "patient"),
          };

      // Add to the room queue (de-dupe by userId)
      const queue = getRoomQueue(roomId);
      if (normalizedPatient.userId) {
        queue.set(normalizedPatient.userId, normalizedPatient);
      }

      // If a doctor is online, notify them (they may or may not be in room yet)
      const doctor = onlineUsers.find((u) => u.userRole === "doctor");
      if (doctor) {
        io.to(doctor.socketId).emit("patientJoinRequest", {
          roomId,
          patient: normalizedPatient,
        });
      }
      // If no doctor online, patient stays queued; UI remains "waiting".
    });

    // Doctor approves a specific patient in a specific room
    socket.on("approvePatient", ({ roomId, patientId }) => {
      const patient = onlineUsers.find((u) => u.userId === patientId);
      const doctor = onlineUsers.find((u) => u.userRole === "doctor");

      // Remove from queue if present
      const queue = getRoomQueue(roomId);
      queue.delete(patientId);

      if (patient && doctor) {
        const ongoingCall = {
          participants: { caller: patient, receiver: doctor },
          isRinging: false,
        };
        io.to(patient.socketId).emit("callApproved", ongoingCall);
        io.to(doctor.socketId).emit("callApproved", ongoingCall);
      }
    });

    socket.on("rejectPatient", ({ roomId, patientId }) => {
      const queue = getRoomQueue(roomId);
      queue.delete(patientId);

      const patient = onlineUsers.find((u) => u.userId === patientId);
      if (patient) io.to(patient.socketId).emit("joinRejected");
    });
  });

  httpServer.listen(PORT, HOST, () => {
    console.log(`> Ready on http://${HOST}:${PORT}`);
  });
});
