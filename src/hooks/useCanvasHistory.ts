"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { CanvasElement } from "@/types/canvas";

export type CloudSyncStatus = "saved" | "saving" | "offline" | "error";

export interface CanvasHistoryHook {
  elements: CanvasElement[];
  setElementsLive: (elements: CanvasElement[]) => void;
  commitElements: (elements: CanvasElement[]) => void;
  undo: () => void;
  redo: () => void;
  clearCanvas: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isHydrated: boolean;
  syncStatus: CloudSyncStatus;
  lastSavedAt: Date | null;
  saveToCloudNow: () => Promise<void>;
}

const MAX_HISTORY_STEPS = 30;

export function useCanvasHistory(roomId: string): CanvasHistoryHook {
  const storageKey = `collabo_board_${roomId}`;

  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [history, setHistory] = useState<CanvasElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<CloudSyncStatus>("offline");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  // Ref to prevent initial mount overwrite
  const isHydratedRef = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Initial hydration: Load from localStorage instantly, then reconcile with Backend API
  useEffect(() => {
    let isCancelled = false;

    const frameId = requestAnimationFrame(async () => {
      let localElements: CanvasElement[] = [];

      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            localElements = parsed;
          }
        }
      } catch (e) {
        console.warn("Could not load board from localStorage", e);
      }

      if (isCancelled) return;

      // Mount local elements immediately for instant zero-latency render
      setElements(localElements);
      setHistory([localElements]);
      setHistoryIndex(0);
      isHydratedRef.current = true;
      setIsHydrated(true);

      // Reconcile with PostgreSQL Backend API
      try {
        const res = await fetch(`/api/boards/${roomId}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (isCancelled) return;

        if (data.success && data.board) {
          const serverElements: CanvasElement[] = data.board.elements || [];

          if (serverElements.length > 0) {
            setElements(serverElements);
            setHistory([serverElements]);
            setHistoryIndex(0);
            try {
              localStorage.setItem(storageKey, JSON.stringify(serverElements));
            } catch {
              // ignore storage quota error
            }
          } else if (localElements.length > 0) {
            // Local cache had shapes, push them to initialize the backend record
            fetch(`/api/boards/${roomId}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ elements: localElements }),
            }).catch(() => {});
          }

          setSyncStatus(data.storageSource === "supabase" ? "saved" : "offline");
          setLastSavedAt(new Date());
        }
      } catch (err) {
        console.warn("Backend API sync failed (offline or network issue):", err);
        if (!isCancelled) {
          setSyncStatus("offline");
        }
      }
    });

    return () => {
      isCancelled = true;
      cancelAnimationFrame(frameId);
    };
  }, [roomId, storageKey]);

  // 2. Persist to localStorage and debounced API PUT whenever elements state changes
  useEffect(() => {
    if (!isHydratedRef.current) return;

    // Immediately persist locally
    try {
      localStorage.setItem(storageKey, JSON.stringify(elements));
    } catch (e) {
      console.warn("Could not save board to localStorage", e);
    }

    // Debounce save to backend PostgreSQL API
    setSyncStatus("saving");

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/boards/${roomId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ elements }),
        });
        const data = await res.json();
        if (data.success) {
          setSyncStatus(data.storageSource === "supabase" ? "saved" : "offline");
          setLastSavedAt(new Date());
        } else {
          setSyncStatus("error");
        }
      } catch {
        setSyncStatus("error");
      }
    }, 800);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [elements, roomId, storageKey]);

  // 3. Live update (during drawing/dragging) without pushing new history snapshots
  const setElementsLive = useCallback((newElements: CanvasElement[]) => {
    setElements(newElements);
  }, []);

  // 4. Commit a completed action to history (on mouse up, shape drop, deletion, transform)
  const commitElements = useCallback(
    (newElements: CanvasElement[]) => {
      setElements(newElements);
      setHistory((prevHistory) => {
        const validHistory = prevHistory.slice(0, historyIndex + 1);
        const nextHistory = [...validHistory, newElements];

        if (nextHistory.length > MAX_HISTORY_STEPS) {
          nextHistory.shift();
        }
        return nextHistory;
      });

      setHistoryIndex((prevIndex) => {
        const nextIndex = Math.min(prevIndex + 1, MAX_HISTORY_STEPS - 1);
        return nextIndex;
      });
    },
    [historyIndex]
  );

  // 5. Undo to previous snapshot
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const targetIndex = historyIndex - 1;
      const targetElements = history[targetIndex];
      setHistoryIndex(targetIndex);
      setElements(targetElements);
    }
  }, [history, historyIndex]);

  // 6. Redo to next snapshot
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const targetIndex = historyIndex + 1;
      const targetElements = history[targetIndex];
      setHistoryIndex(targetIndex);
      setElements(targetElements);
    }
  }, [history, historyIndex]);

  // 7. Clear canvas, purge localStorage, and update backend record
  const clearCanvas = useCallback(() => {
    commitElements([]);
    try {
      localStorage.removeItem(storageKey);
    } catch (e) {
      console.warn("Could not clear localStorage", e);
    }

    fetch(`/api/boards/${roomId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ elements: [] }),
    }).catch(() => {});
  }, [commitElements, roomId, storageKey]);

  // 8. Manual on-demand cloud sync
  const saveToCloudNow = useCallback(async () => {
    setSyncStatus("saving");
    try {
      const res = await fetch(`/api/boards/${roomId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ elements }),
      });
      const data = await res.json();
      if (data.success) {
        setSyncStatus(data.storageSource === "supabase" ? "saved" : "offline");
        setLastSavedAt(new Date());
      } else {
        setSyncStatus("error");
      }
    } catch {
      setSyncStatus("error");
    }
  }, [elements, roomId]);

  return {
    elements,
    setElementsLive,
    commitElements,
    undo,
    redo,
    clearCanvas,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    isHydrated,
    syncStatus,
    lastSavedAt,
    saveToCloudNow,
  };
}
