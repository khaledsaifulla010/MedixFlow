import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { Server as IOServer } from "socket.io";
import { NextApiResponse } from "next";

let io: IOServer;

export const GET = async (req: NextRequest) => {
  // Only initialize once
  if (!io) {
    const server = new (require("http").Server)();
    io = new IOServer(server, { cors: { origin: "*" } });

    io.on("connection", (socket) => {
      console.log("Client connected:", socket.id);

      socket.on("join-room", (roomId: string) => {
        socket.join(roomId);
        const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
        if (clients.length > 1) {
          socket.to(roomId).emit("other-user", socket.id);
        }
      });

      socket.on("offer", (payload: any) => {
        io.to(payload.target).emit("offer", payload);
      });

      socket.on("answer", (payload: any) => {
        io.to(payload.target).emit("answer", payload);
      });

      socket.on("disconnect", () =>
        console.log("Client disconnected:", socket.id)
      );
    });

    console.log("Socket.io initialized");
  }

  return NextResponse.json({ message: "Socket initialized" });
};
