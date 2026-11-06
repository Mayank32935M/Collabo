import http from "node:http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import { registerPresenceHandlers } from "./handlers/presence-handler";
import { registerClassroomHandlers } from "./handlers/classroom-handler";
import { registerInteractionHandlers } from "./handlers/interaction-handler";

dotenv.config();

export const PORT = Number(process.env.PORT) || 4000;

export function createRealtimeServer(): { server: http.Server; io: Server } {
  const server = http.createServer((req, res) => {
    if (req.url === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          status: "healthy",
          service: "collabo-realtime",
          timestamp: new Date().toISOString(),
        })
      );
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

    // Register modular feature handlers
    registerPresenceHandlers(io, socket);
    registerClassroomHandlers(io, socket);
    registerInteractionHandlers(io, socket);
  });

  return { server, io };
}

// Start server if executed directly as entrypoint
if (process.env.NODE_ENV !== "test" && process.env.START_SERVER !== "false") {
  const { server } = createRealtimeServer();
  server.listen(PORT, () => {
    console.log(`🚀 COLLABO Realtime Control Plane listening on port ${PORT}`);
  });
}
