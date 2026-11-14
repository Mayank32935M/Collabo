/**
 * COLLABO Test Pyramid — Unit & Integration Test Suite
 * Covers:
 * 1. Whiteboard Camera Mathematics & Layering (@collabo/whiteboard)
 * 2. AI Spatial Layout Math & Zod Validation Schemas (@collabo/ai)
 * 3. Realtime Control Plane State, Operational Deltas & Security Middleware (@collabo/realtime)
 */

import { EventEmitter } from "node:events";
import {
  calculateZoomAtPointer,
  clampScale,
  screenToWorld,
  worldToScreen,
  bringForward,
  sendBackward,
  bringToFront,
  sendToBack,
} from "../packages/whiteboard/src/index";
import {
  layoutConceptTree,
  MindMapConceptNode,
  MindMapRequestSchema,
  BoardQARequestSchema,
  LectureRecapResponseSchema,
  MockAIProvider,
} from "../packages/ai/src/index";
import {
  CanvasElement,
  RectElement,
  ViewportTransform,
  ClientBoardOpPayload,
} from "../packages/shared/src/index";
import { roomStateManager } from "../apps/realtime/src/state/room-state-manager";
import {
  applyBoardOperation,
  getRoomElements,
} from "../apps/realtime/src/handlers/board-handler";
import { attachSocketSecurityMiddleware } from "../apps/realtime/src/middleware/rate-limiter";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Error] ${message}`);
  }
}

async function runUnitAndIntegrationTests() {
  console.log("==================================================================");
  console.log("  COLLABO TEST PYRAMID: UNIT & INTEGRATION TEST SUITE");
  console.log("==================================================================\n");

  // -------------------------------------------------------------------------
  // SECTION 1: Whiteboard Camera Mathematics & Layering Engine
  // -------------------------------------------------------------------------
  console.log("▶ [1/3] Whiteboard Camera Mathematics & Layering Engine...");

  const camera: ViewportTransform = { x: 100, y: 50, scale: 2.0 };

  // Test screenToWorld: (screen - camera.offset) / scale
  const worldPt = screenToWorld({ x: 300, y: 250 }, camera);
  assert(worldPt.x === 100, `Expected world x=100, got ${worldPt.x}`);
  assert(worldPt.y === 100, `Expected world y=100, got ${worldPt.y}`);

  // Test worldToScreen: world * scale + camera.offset
  const screenPt = worldToScreen({ x: 100, y: 100 }, camera);
  assert(screenPt.x === 300, `Expected screen x=300, got ${screenPt.x}`);
  assert(screenPt.y === 250, `Expected screen y=250, got ${screenPt.y}`);

  // Test clampScale
  assert(clampScale(0.05, 0.1, 5.0) === 0.1, "clampScale lower bound failed");
  assert(clampScale(10.0, 0.1, 5.0) === 5.0, "clampScale upper bound failed");
  assert(clampScale(2.5, 0.1, 5.0) === 2.5, "clampScale within range failed");

  // Test calculateZoomAtPointer: focal-point invariance
  const pointer = { x: 400, y: 300 };
  const initialCam: ViewportTransform = { x: 0, y: 0, scale: 1.0 };
  const worldBefore = screenToWorld(pointer, initialCam);
  const zoomedCam = calculateZoomAtPointer(pointer, initialCam, 1.5, 0.1, 5.0);
  const worldAfter = screenToWorld(pointer, zoomedCam);

  // The world coordinate under the cursor must remain strictly identical during zoom
  const driftX = Math.abs(worldBefore.x - worldAfter.x);
  const driftY = Math.abs(worldBefore.y - worldAfter.y);
  assert(driftX < 0.0001, `Zoom focal point drift X: ${driftX}`);
  assert(driftY < 0.0001, `Zoom focal point drift Y: ${driftY}`);

  // Test Layering Functions
  const mockElements: CanvasElement[] = [
    { id: "el-1", type: "rectangle", x: 0, y: 0, width: 50, height: 50, color: "#000", strokeWidth: 1 },
    { id: "el-2", type: "rectangle", x: 10, y: 10, width: 50, height: 50, color: "#111", strokeWidth: 1 },
    { id: "el-3", type: "rectangle", x: 20, y: 20, width: 50, height: 50, color: "#222", strokeWidth: 1 },
  ];

  const broughtForward = bringForward(mockElements, "el-1");
  assert(broughtForward[1].id === "el-1", "bringForward should swap with next element");

  const sentToBack = sendToBack(mockElements, "el-3");
  assert(sentToBack[0].id === "el-3", "sendToBack should move element to index 0");

  const broughtToFront = bringToFront(mockElements, "el-1");
  assert(broughtToFront[broughtToFront.length - 1].id === "el-1", "bringToFront should move element to last index");

  console.log("  ✓ Camera inversion math, focal zoom invariance, and z-index layering verified.");

  // -------------------------------------------------------------------------
  // SECTION 2: AI Spatial Layout & Zod Runtime Schema Validation
  // -------------------------------------------------------------------------
  console.log("\n▶ [2/3] AI Spatial Layout Engine & Schema Validation...");

  const testConceptTree: MindMapConceptNode = {
    id: "root-distributed-sys",
    label: "Distributed Systems Architecture",
    description: "Core tenets of fault-tolerant distributed computing",
    children: [
      {
        id: "child-cap",
        label: "CAP Theorem",
        description: "Consistency, Availability, Partition Tolerance",
      },
      {
        id: "child-consensus",
        label: "Consensus Protocols",
        description: "Raft, Paxos, PBFT",
      },
    ],
  };

  const layoutEls = layoutConceptTree(testConceptTree, {
    originX: 100,
    originY: 100,
    nodeWidth: 180,
    nodeHeight: 80,
  });

  const stickyNodes = layoutEls.filter((e) => e.type === "sticky");
  const connectorLines = layoutEls.filter((e) => e.type === "pen");
  assert(stickyNodes.length === 3, `Expected 3 concept nodes, got ${stickyNodes.length}`);
  assert(connectorLines.length === 2, `Expected 2 connectors, got ${connectorLines.length}`);

  // Verify non-overlapping bounding boxes
  const childA = stickyNodes.find((n) => n.id === "child-cap")!;
  const childB = stickyNodes.find((n) => n.id === "child-consensus")!;
  const verticalSep = Math.abs(childA.y - childB.y);
  assert(verticalSep >= 80, `Children must not overlap vertically (got sep=${verticalSep})`);

  // Zod Schemas runtime verification
  assert(MindMapRequestSchema.safeParse({ topic: "Kubernetes Topologies", depth: 2 }).success, "MindMapRequestSchema validation failed");
  assert(!MindMapRequestSchema.safeParse({ topic: "" }).success, "MindMapRequestSchema should reject empty topic");
  assert(BoardQARequestSchema.safeParse({ query: "What is node child-cap?", elements: stickyNodes }).success, "BoardQARequestSchema validation failed");

  // Mock Provider Simulation
  const mockAI = new MockAIProvider();
  const recap = await mockAI.summarizeLecture({ boardElements: stickyNodes });
  assert(LectureRecapResponseSchema.safeParse(recap).success, "Mock lecture recap failed Zod validation");

  console.log("  ✓ Spatial tree layout non-overlapping math and Zod runtime contracts verified.");

  // -------------------------------------------------------------------------
  // SECTION 3: Real-Time Control Plane State, Operational Deltas & Security
  // -------------------------------------------------------------------------
  console.log("\n▶ [3/3] Real-Time Control Plane State, Operational Deltas & Security...");

  const roomId = "test-classroom-integration";

  // 1. Room Creation and Roles in RoomStateManager
  const room = roomStateManager.getOrCreateRoom(roomId, {
    initialMode: "lecture",
  });
  assert(room.mode === "lecture", "Initial mode should be lecture");

  // Host joins
  roomStateManager.addParticipant(roomId, {
    socketId: "socket-prof",
    profileId: "prof-id",
    name: "Professor Turing",
    role: "host",
    isMuted: false,
    handRaised: false,
    joinedAt: new Date().toISOString(),
  });

  // Student joins
  roomStateManager.addParticipant(roomId, {
    socketId: "socket-student",
    profileId: "student-id",
    name: "Ada Lovelace",
    role: "attendee",
    isMuted: true,
    handRaised: false,
    joinedAt: new Date().toISOString(),
  });

  const snapshot = roomStateManager.getSnapshot(roomId);
  assert(snapshot !== null, "Room snapshot should not be null");
  assert(snapshot.participants.length === 2, `Expected 2 participants, got ${snapshot.participants.length}`);
  console.log("  ✓ Room state manager participant registration and role assignment verified.");

  // 2. Speaking Queue Workflow (Raise Hand -> Grant Mic -> Lower Hand)
  roomStateManager.raiseHand(roomId, "socket-student");
  let queue = roomStateManager.getSnapshot(roomId)?.speakingQueue ?? [];
  assert(queue.length === 1 && queue[0] === "socket-student", "Speaking queue should contain student socket ID");

  roomStateManager.grantMic(roomId, "socket-student");
  const student = roomStateManager.getSnapshot(roomId)?.participants.find((p) => p.socketId === "socket-student");
  assert(student?.canSpeak && !student.isMuted, "Student should have canSpeak=true and unmuted mic");

  roomStateManager.lowerHand(roomId, "socket-student");
  queue = roomStateManager.getSnapshot(roomId)?.speakingQueue ?? [];
  assert(queue.length === 0, "Speaking queue should be empty after lowerHand");
  console.log("  ✓ Speaking queue workflow (raise hand -> grant mic -> lower hand) verified.");

  // 3. Whiteboard Operational Delta In-Memory Engine
  const rectElement: RectElement = {
    id: "rect-integration-test",
    type: "rectangle",
    x: 150,
    y: 200,
    width: 180,
    height: 90,
    color: "#6366f1",
    strokeWidth: 2,
  };

  // Create operation
  const createOp: ClientBoardOpPayload = {
    roomId,
    op: "create",
    element: rectElement,
  };
  const opResult = applyBoardOperation(roomId, createOp, "prof-id");
  assert(opResult.op === "create", "Operational delta op mismatch");
  assert(getRoomElements(roomId).length === 1, "Room elements count should be 1 after create");

  // Update operation (move x to 250)
  const updateOp: ClientBoardOpPayload = {
    roomId,
    op: "update",
    elementId: "rect-integration-test",
    patch: { x: 250 },
  };
  applyBoardOperation(roomId, updateOp, "prof-id");
  const updated = getRoomElements(roomId).find((e) => e.id === "rect-integration-test") as RectElement;
  assert(updated?.x === 250, `Expected updated x=250, got ${updated?.x}`);

  // Delete operation
  const deleteOp: ClientBoardOpPayload = {
    roomId,
    op: "delete",
    elementId: "rect-integration-test",
  };
  applyBoardOperation(roomId, deleteOp, "prof-id");
  assert(getRoomElements(roomId).length === 0, "Room elements count should be 0 after delete");
  console.log("  ✓ Whiteboard operational delta state transitions (create -> update -> delete) verified.");

  // 4. Security Middleware: Payload Size & Rate Limiting Guards
  class MockSocket extends EventEmitter {
    id = "mock-socket-test-1";
    middlewareFns: Array<(packet: [string, unknown], next: (err?: Error) => void) => void> = [];

    use(fn: (packet: [string, unknown], next: (err?: Error) => void) => void) {
      this.middlewareFns.push(fn);
    }

    simulatePacket(eventName: string, payload: unknown): { allowed: boolean; violation?: unknown } {
      let allowed = false;
      let violation: unknown = undefined;

      const onSecurityError = (err: unknown) => {
        violation = err;
      };
      this.once("error:security", onSecurityError);

      const packet: [string, unknown] = [eventName, payload];
      for (const fn of this.middlewareFns) {
        fn(packet, (err) => {
          if (!err) allowed = true;
        });
      }

      this.removeListener("error:security", onSecurityError);
      return { allowed, violation };
    }
  }

  const mockSocket = new MockSocket();
  attachSocketSecurityMiddleware(mockSocket as any, {
    maxPayloadBytes: 1024, // 1 KB test limit
    highFreqLimitPerSec: 10,
    standardLimitPerSec: 5,
  });

  // Valid packet passes
  const validRes = mockSocket.simulatePacket("cursor:move", { x: 10, y: 20 });
  assert(validRes.allowed, "Valid packet should be allowed through middleware");

  // Oversized packet (>1KB) rejected
  const oversizeRes = mockSocket.simulatePacket("board:op", {
    largeData: "X".repeat(2048),
  });
  assert(!oversizeRes.allowed, "Oversized packet should be blocked");
  assert(
    (oversizeRes.violation as any)?.code === "PAYLOAD_TOO_LARGE",
    "Should trigger PAYLOAD_TOO_LARGE error code"
  );
  console.log("  ✓ Security Guard: Payload byte limit enforcement (PAYLOAD_TOO_LARGE) verified.");

  // Flood packet (exceed 10 req/s on high-frequency channel)
  let rateLimitBlocked = false;
  for (let i = 0; i < 15; i++) {
    const res = mockSocket.simulatePacket("cursor:move", { x: i, y: i });
    if (!res.allowed && (res.violation as any)?.code === "RATE_LIMIT_EXCEEDED") {
      rateLimitBlocked = true;
      break;
    }
  }
  assert(rateLimitBlocked, "Rate limit should throttle socket flooding > 10 req/sec");
  console.log("  ✓ Security Guard: Sliding-window rate limiting (RATE_LIMIT_EXCEEDED) verified.");

  console.log("\n==================================================================");
  console.log("  ALL UNIT & INTEGRATION TESTS PASSED CLEANLY! (100% SUCCESS)");
  console.log("==================================================================\n");
}

runUnitAndIntegrationTests().catch((err) => {
  console.error("Test Suite Failed:", err);
  process.exit(1);
});
