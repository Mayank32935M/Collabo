import { Server, Socket } from "socket.io";
import {
  CanvasElement,
  ClientBoardOpPayload,
  ServerBoardOpPayload,
  ServerBoardSyncPayload,
} from "@collabo/shared";
import { roomStateManager } from "../state/room-state-manager";

// In-memory room whiteboard state store (roomId -> elementId -> CanvasElement)
const roomBoards = new Map<string, Map<string, CanvasElement>>();

export function getRoomElements(roomId: string): CanvasElement[] {
  const board = roomBoards.get(roomId);
  if (!board) return [];
  return Array.from(board.values());
}

export function setRoomElements(roomId: string, elements: CanvasElement[]): void {
  const board = new Map<string, CanvasElement>();
  for (const el of elements) {
    board.set(el.id, el);
  }
  roomBoards.set(roomId, board);
}

export function applyBoardOperation(
  roomId: string,
  payload: ClientBoardOpPayload,
  senderProfileId: string
): ServerBoardOpPayload {
  let board = roomBoards.get(roomId);
  if (!board) {
    board = new Map<string, CanvasElement>();
    roomBoards.set(roomId, board);
  }

  const { op, element, patch, elementId, elements } = payload;

  switch (op) {
    case "create": {
      if (element) {
        board.set(element.id, element);
      }
      break;
    }
    case "update": {
      if (elementId && patch) {
        const existing = board.get(elementId);
        if (existing) {
          board.set(elementId, { ...existing, ...patch } as CanvasElement);
        }
      }
      break;
    }
    case "delete": {
      if (elementId) {
        board.delete(elementId);
      }
      break;
    }
    case "batch": {
      if (elements && Array.isArray(elements)) {
        for (const el of elements) {
          board.set(el.id, el);
        }
      }
      break;
    }
  }

  return {
    roomId,
    op,
    element,
    patch,
    elementId,
    elements,
    senderProfileId,
    timestamp: new Date().toISOString(),
  };
}

export function registerBoardHandlers(io: Server, socket: Socket): void {
  // 1. Initial State Synchronization Request
  socket.on("board:sync_request", ({ roomId }: { roomId: string }) => {
    const elements = getRoomElements(roomId);
    const syncPayload: ServerBoardSyncPayload = {
      roomId,
      elements,
    };
    socket.emit("board:sync", syncPayload);
  });

  // 2. Real-Time Operational Delta Processing
  socket.on("board:op", (payload: ClientBoardOpPayload) => {
    const { roomId } = payload;
    const room = roomStateManager.getRoom(roomId);
    if (!room) return;

    const participant = room.participants.get(socket.id);
    if (!participant) return;

    // Check presentation/edit permissions in Lecture mode:
    // Only hosts, co-hosts, speakers, or attendees in interactive mode can edit
    const isHost = socket.id === room.hostSocketId;
    const isCoHost = room.coHostSocketIds.has(socket.id);
    const isSpeaker =
      participant.role === "speaker" || room.activeSpeakerSocketIds.has(socket.id);
    const isInteractive = room.mode === "interactive";

    if (!isHost && !isCoHost && !isSpeaker && !isInteractive) {
      socket.emit("error", {
        message: "Forbidden: Whiteboard editing is locked to presenters in Lecture Mode.",
      });
      return;
    }

    const serverOp = applyBoardOperation(roomId, payload, participant.profileId);

    // Broadcast operation delta to all other peers in the room
    socket.to(roomId).emit("board:op", serverOp);
  });
}

