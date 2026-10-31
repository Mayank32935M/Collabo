import http from "node:http";
import { Server } from "socket.io";
import dotenv from "dotenv";

dotenv.config();

const PORT = Number(process.env.PORT) || 4000;

const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "healthy", service: "collabo-realtime", timestamp: new Date().toISOString() }));
    return;
  }
  res.writeHead(404);
  res.end();
});

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`[Socket Connected] ID: ${socket.id}`);

  socket.on("room:join", ({ roomId, user }: { roomId: string; user?: { id: string; name: string } }) => {
    socket.join(roomId);
    console.log(`[Room Join] User ${user?.name || socket.id} joined room #${roomId}`);
    socket.to(roomId).emit("room:user_joined", {
      socketId: socket.id,
      user,
      timestamp: new Date().toISOString(),
    });
  });

  socket.on("room:leave", ({ roomId }: { roomId: string }) => {
    socket.leave(roomId);
    socket.to(roomId).emit("room:user_left", { socketId: socket.id });
  });

  socket.on("cursor:move", ({ roomId, x, y, user }: { roomId: string; x: number; y: number; user?: { id: string; name: string; color: string } }) => {
    socket.to(roomId).emit("cursor:update", {
      socketId: socket.id,
      x,
      y,
      user,
    });
  });

  socket.on("disconnect", () => {
    console.log(`[Socket Disconnected] ID: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 COLLABO Realtime Control Plane listening on port ${PORT}`);
});

