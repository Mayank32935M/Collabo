import { createRealtimeServer, PORT } from "./server";

export * from "./server";

// Start server if executed directly as entrypoint
if (process.env.NODE_ENV !== "test" && process.env.START_SERVER !== "false") {
  const { server } = createRealtimeServer();
  server.listen(PORT, () => {
    console.log(`🚀 COLLABO Realtime Control Plane listening on port ${PORT}`);
  });
}
