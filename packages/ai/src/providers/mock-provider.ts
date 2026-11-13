/**
 * COLLABO Intelligence — Mock AI Provider
 * Deterministic offline simulation for zero-config development, unit testing,
 * and environments without external network or API credentials.
 */

import {
  BoardQARequest,
  BoardQAResponse,
  LectureRecapRequest,
  LectureRecapResponse,
  MindMapConceptNode,
  MindMapRequest,
  MindMapResponse,
} from "@collabo/shared";
import { AIProvider } from "../types";
import { layoutConceptTree } from "../layout";

export class MockAIProvider implements AIProvider {
  readonly name = "MockAIProvider";

  isAvailable(): boolean {
    return true;
  }

  async generateMindMap(request: MindMapRequest): Promise<MindMapResponse> {
    const topic = request.topic.trim();
    const rootId = `concept-root-${Date.now()}`;

    // Generate dynamic realistic concept taxonomy based on topic
    const rootNode: MindMapConceptNode = {
      id: rootId,
      label: topic,
      description: "Core architectural domain",
      children: [
        {
          id: `concept-core-1-${Date.now()}`,
          label: "Foundations & Theory",
          description: "Mathematical models & formal specifications",
          children: [
            {
              id: `concept-sub-1a-${Date.now()}`,
              label: "Core Axioms",
              description: "Fundamental operational invariants",
            },
            {
              id: `concept-sub-1b-${Date.now()}`,
              label: "Complexity Bounds",
              description: "Time and space asymptotic limits",
            },
          ],
        },
        {
          id: `concept-core-2-${Date.now()}`,
          label: "Architecture & Protocols",
          description: "System topologies and message invariants",
          children: [
            {
              id: `concept-sub-2a-${Date.now()}`,
              label: "State Synchronization",
              description: "Consensus, replication, and durability",
            },
            {
              id: `concept-sub-2b-${Date.now()}`,
              label: "Fault Tolerance",
              description: "Partition recovery and quorum verification",
            },
          ],
        },
        {
          id: `concept-core-3-${Date.now()}`,
          label: "Practical Implementations",
          description: "Industry patterns & performance trade-offs",
          children: [
            {
              id: `concept-sub-3a-${Date.now()}`,
              label: "Concurrency Control",
              description: "Locking, transactions, and event loops",
            },
            {
              id: `concept-sub-3b-${Date.now()}`,
              label: "Telemetry & Profiling",
              description: "Observability, metrics, and bottlenecks",
            },
          ],
        },
      ],
    };

    const elements = layoutConceptTree(rootNode, {
      originX: request.originX ?? 300,
      originY: request.originY ?? 300,
    });

    return {
      topic,
      elements,
      rootNodeId: rootId,
    };
  }

  async answerBoardQuery(request: BoardQARequest): Promise<BoardQAResponse> {
    const query = request.query.toLowerCase();
    const elements = request.elements;

    // Search for element labels matching query terms
    const referencedIds: string[] = [];
    const matchedLabels: string[] = [];

    for (const el of elements) {
      if ("text" in el && typeof el.text === "string") {
        const textLower = el.text.toLowerCase();
        if (
          query.split(" ").some((word) => word.length > 3 && textLower.includes(word))
        ) {
          referencedIds.push(el.id);
          matchedLabels.push(el.text.slice(0, 30));
        }
      }
    }

    let answer = "";
    if (referencedIds.length > 0) {
      answer = `Based on the canvas diagram, this relates directly to elements [${matchedLabels.join(
        ", "
      )}]. In this architecture, components communicate via asynchronous event queues to decouple state mutations from media streaming, ensuring linear scaling without database contention.`;
    } else {
      answer = `Analyzing the current whiteboard workspace (${elements.length} elements present): "${request.query}". In educational systems design, this pattern isolates high-throughput real-time events in an in-memory control plane while delegating persistence to an asynchronous database sync queue.`;
    }

    return {
      answer,
      referencedElementIds: referencedIds.slice(0, 4),
      suggestedFollowUps: [
        "How does this component recover after a network partition?",
        "What are the asymptotic time and memory trade-offs?",
        "How can we benchmark this under 250+ concurrent users?",
      ],
    };
  }

  async summarizeLecture(
    request: LectureRecapRequest
  ): Promise<LectureRecapResponse> {
    const elementCount = request.boardElements?.length ?? 0;
    const chatCount = request.chatMessages?.length ?? 0;

    const summaryMarkdown = `## Executive Lecture Summary

During today's collaborative session, the class explored system architecture, real-time control planes, and WebRTC streaming topologies across **${elementCount} whiteboard concepts** and **${chatCount} classroom discussion points**.

### Key Highlights
1. **Control vs. Media Plane Separation**: Disconnecting high-frequency presence signaling from high-bandwidth audio UDP packets ensures sub-10ms UI responsiveness without media lag.
2. **Selective Forwarding Unit (SFU) Routing**: Broadcasters upload a single media stream to the SFU, which multiplexes downstream packets to 250+ students with $O(N)$ linear complexity.
3. **Multiplayer Spatial Canvas**: Operational deltas (\`op:create\`, \`op:update\`, \`op:delete\`) allow concurrent multi-user editing without race-condition overwrites.`;

    const keyTakeaways = [
      "SFUs scale audio to 250+ students where P2P mesh topologies collapse ($O(N)$ vs $O(N^2)$).",
      "In-memory state management provides sub-10ms speaking queue and voting operations.",
      "Operational delta synchronization replaces full array overwrites with granular element patches.",
      "Human-in-the-loop AI preview layers safeguard live classroom boards from destructive hallucinations.",
    ];

    const quiz = [
      {
        id: "quiz-1",
        question:
          "Why does a Selective Forwarding Unit (SFU) scale more effectively than a P2P Mesh at 250 participants?",
        options: [
          "Mesh requires O(N^2) peer connections, saturating client uplink bandwidth.",
          "SFU compresses video to 144p while Mesh uses 4K.",
          "Mesh requires server-side rendering while SFU does not.",
          "SFU eliminates the need for WebSockets entirely.",
        ],
        correctOptionIndex: 0,
        explanation:
          "In a mesh of 250 users, 31,125 bidirectional connections are required, causing client CPU and network saturation. An SFU routes packets linearly with O(N) connections.",
      },
      {
        id: "quiz-2",
        question:
          "What is the mathematical purpose of focal-point zooming on an infinite canvas?",
        options: [
          "To reset the camera coordinate origin to (0, 0).",
          "To keep the world coordinate directly under the pointer stationary during scaling.",
          "To prevent the browser scrollbar from appearing.",
          "To calculate element z-index order.",
        ],
        correctOptionIndex: 1,
        explanation:
          "Focal-point zooming recalculates the stage offset so the exact spatial point under the cursor does not jump when zooming in or out.",
      },
      {
        id: "quiz-3",
        question:
          "How does an operational delta model prevent collaborative editing conflicts?",
        options: [
          "By locking the entire whiteboard whenever any user touches a tool.",
          "By broadcasting granular element mutations (create, update, delete) rather than overwriting the entire element array.",
          "By storing only the newest shape in local storage.",
          "By converting all vector shapes into static raster PNGs.",
        ],
        correctOptionIndex: 1,
        explanation:
          "Granular deltas allow User A to edit Element 1 while User B edits Element 2 simultaneously without overwriting each other.",
      },
    ];

    const flashcards = [
      {
        id: "flashcard-1",
        front: "Selective Forwarding Unit (SFU)",
        back: "A WebRTC media router that receives single upstream media tracks from publishers and forwards packets downstream to subscribers ($O(N)$ connections).",
        conceptTag: "Media Plane",
      },
      {
        id: "flashcard-2",
        front: "Focal-Point Zoom Formula",
        back: "New Camera Offset: C_new = P_screen - P_world * scale_new. Keeps the point under the cursor stationary.",
        conceptTag: "Whiteboard Math",
      },
      {
        id: "flashcard-3",
        front: "Human-in-the-Loop AI Preview",
        back: "A translucent canvas overlay displaying proposed AI additions before the user explicitly clicks 'Accept' to commit to the board.",
        conceptTag: "AI Architecture",
      },
      {
        id: "flashcard-4",
        front: "Volatile WebSocket Emission",
        back: "Emitting high-frequency ephemeral data (e.g., cursor coordinates) via socket.volatile.emit to drop congested packets rather than queuing laggy buffers.",
        conceptTag: "Real-Time Control",
      },
    ];

    return {
      summaryMarkdown,
      keyTakeaways,
      quiz,
      flashcards,
    };
  }
}

