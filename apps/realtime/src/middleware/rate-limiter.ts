/**
 * COLLABO Realtime Control Plane — Security & Rate Limiting Middleware
 * Enforces per-socket sliding-window rate limits and payload byte bounds
 * to prevent Denial-of-Service (DoS) and event flooding attacks.
 */

import { Socket } from "socket.io";

export interface SecurityMiddlewareOptions {
  /** Maximum allowed size in bytes for a single event payload (default: 64 KB) */
  maxPayloadBytes?: number;
  /** Maximum events per second for high-frequency events like cursors and board ops (default: 60) */
  highFreqLimitPerSec?: number;
  /** Maximum events per second for standard transactional events like chat, poll votes, Q&A (default: 10) */
  standardLimitPerSec?: number;
}

export interface SecurityViolationPayload {
  code: "PAYLOAD_TOO_LARGE" | "RATE_LIMIT_EXCEEDED";
  event: string;
  message: string;
  timestamp: string;
}

interface SocketRateTracker {
  highFreqTimestamps: number[];
  standardTimestamps: number[];
}

const HIGH_FREQ_EVENTS = new Set([
  "cursor:move",
  "board:op",
  "board:sync_request",
]);

export function attachSocketSecurityMiddleware(
  socket: Socket,
  options?: SecurityMiddlewareOptions
): void {
  const maxBytes = options?.maxPayloadBytes ?? 64 * 1024; // 64 KB
  const highFreqLimit = options?.highFreqLimitPerSec ?? 60;
  const standardLimit = options?.standardLimitPerSec ?? 10;

  const tracker: SocketRateTracker = {
    highFreqTimestamps: [],
    standardTimestamps: [],
  };

  // Socket.IO packet-level middleware
  socket.use((packet, next) => {
    const eventName = packet[0];
    const payload = packet[1];
    const now = Date.now();
    const windowStart = now - 1000;

    // 1. Payload Size Guard
    if (payload !== undefined && payload !== null) {
      let serializedSize = 0;
      if (typeof payload === "string") {
        serializedSize = Buffer.byteLength(payload, "utf8");
      } else if (typeof payload === "object") {
        try {
          serializedSize = Buffer.byteLength(JSON.stringify(payload), "utf8");
        } catch {
          // Unserializable object (circular, etc.)
          const violation: SecurityViolationPayload = {
            code: "PAYLOAD_TOO_LARGE",
            event: eventName,
            message: "Malformed event payload cannot be serialized.",
            timestamp: new Date().toISOString(),
          };
          socket.emit("error:security", violation);
          return;
        }
      }

      if (serializedSize > maxBytes) {
        const violation: SecurityViolationPayload = {
          code: "PAYLOAD_TOO_LARGE",
          event: eventName,
          message: `Payload size (${serializedSize} bytes) exceeds maximum limit (${maxBytes} bytes).`,
          timestamp: new Date().toISOString(),
        };
        socket.emit("error:security", violation);
        return; // Drop packet safely without invoking next()
      }
    }

    // 2. Sliding Window Rate Limiting
    const isHighFreq = HIGH_FREQ_EVENTS.has(eventName);
    const timestamps = isHighFreq
      ? tracker.highFreqTimestamps
      : tracker.standardTimestamps;
    const limit = isHighFreq ? highFreqLimit : standardLimit;

    // Prune timestamps older than 1 second
    while (timestamps.length > 0 && timestamps[0] < windowStart) {
      timestamps.shift();
    }

    if (timestamps.length >= limit) {
      const violation: SecurityViolationPayload = {
        code: "RATE_LIMIT_EXCEEDED",
        event: eventName,
        message: `Rate limit of ${limit} req/sec exceeded for event '${eventName}'.`,
        timestamp: new Date().toISOString(),
      };
      socket.emit("error:security", violation);
      return; // Drop packet
    }

    timestamps.push(now);
    next();
  });

  // Cleanup on disconnect
  socket.on("disconnect", () => {
    tracker.highFreqTimestamps = [];
    tracker.standardTimestamps = [];
  });
}
