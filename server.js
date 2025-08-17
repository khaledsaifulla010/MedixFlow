import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server(httpServer, { cors: { origin: "*" } });

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

    // ---------- Waiting Room ----------
    socket.on("patientJoinRequest", ({ roomId, patient }) => {
      const doctor = onlineUsers.find((u) => u.userRole === "doctor");
      if (doctor) {
        socket.join(roomId);
        io.to(doctor.socketId).emit("patientJoinRequest", { roomId, patient });
      } else {
        socket.emit("noDoctorOnline");
      }
    });

    socket.on("approvePatient", ({ patientId }) => {
      const patient = onlineUsers.find((u) => u.userId === patientId);
      const doctor = onlineUsers.find((u) => u.userRole === "doctor");
      if (patient && doctor) {
        const ongoingCall = {
          participants: { caller: patient, receiver: doctor },
          isRinging: false,
        };

        // Emit to both
        io.to(patient.socketId).emit("callApproved", ongoingCall);
        io.to(doctor.socketId).emit("callApproved", ongoingCall);
      }
    });


    socket.on("rejectPatient", ({ patientId }) => {
      const patient = onlineUsers.find((u) => u.userId === patientId);
      if (patient) io.to(patient.socketId).emit("joinRejected");
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
