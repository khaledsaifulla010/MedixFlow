import { NextRequest, NextResponse } from "next/server";
import { Server as IOServer } from "socket.io";
import { createServer } from "http";

let io: IOServer;

export const GET = async (req: NextRequest) => {
  if (!io) {
    const server = createServer();
    io = new IOServer(server, { cors: { origin: "*" } });

    io.on("connection", (socket) => {
      console.log("Client connected:", socket.id);

      socket.on("join-room", (roomId: string) => {
        socket.join(roomId);
        const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
        // Notify others in room
        clients.forEach((clientId) => {
          if (clientId !== socket.id) {
            io.to(clientId).emit("other-user", socket.id);
          }
        });
      });

      socket.on("offer", (payload: any) => {
        io.to(payload.target).emit("offer", {
          from: socket.id,
          signal: payload.signal,
        });
      });

      socket.on("answer", (payload: any) => {
        io.to(payload.target).emit("answer", {
          from: socket.id,
          signal: payload.signal,
        });
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
      });
    });

    console.log("Socket.IO initialized");
  }

  return NextResponse.json({ message: "Socket initialized" });
};
