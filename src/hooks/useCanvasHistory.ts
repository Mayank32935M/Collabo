"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { CanvasElement } from "@/types/canvas";

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
}

const MAX_HISTORY_STEPS = 30;

export function useCanvasHistory(roomId: string): CanvasHistoryHook {
  const storageKey = `collabo_board_${roomId}`;

  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [history, setHistory] = useState<CanvasElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  // Ref to prevent initial mount overwrite
  const isHydratedRef = useRef(false);

  // 1. Initial hydration from browser localStorage scheduled via requestAnimationFrame
  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setElements(parsed);
            setHistory([parsed]);
            setHistoryIndex(0);
            isHydratedRef.current = true;
            setIsHydrated(true);
            return;
          }
        }
      } catch (e) {
        console.warn("Could not load board from localStorage", e);
      }

      setElements([]);
      setHistory([[]]);
      setHistoryIndex(0);
      isHydratedRef.current = true;
      setIsHydrated(true);
    });

    return () => cancelAnimationFrame(frameId);
  }, [storageKey]);

  // 2. Persist to localStorage whenever elements state changes (after hydration)
  useEffect(() => {
    if (!isHydratedRef.current) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(elements));
    } catch (e) {
      console.warn("Could not save board to localStorage", e);
    }
  }, [elements, storageKey]);

  // 3. Live update (during drawing/dragging) without pushing new history snapshots
  const setElementsLive = useCallback((newElements: CanvasElement[]) => {
    setElements(newElements);
  }, []);

  // 4. Commit a completed action to history (on mouse up, shape drop, deletion, transform)
  const commitElements = useCallback(
    (newElements: CanvasElement[]) => {
      setElements(newElements);
      setHistory((prevHistory) => {
        // Discard any future redo steps ahead of current index
        const validHistory = prevHistory.slice(0, historyIndex + 1);
        const nextHistory = [...validHistory, newElements];

        // Cap maximum history depth to save memory
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

  // 7. Clear canvas & purge localStorage
  const clearCanvas = useCallback(() => {
    commitElements([]);
    try {
      localStorage.removeItem(storageKey);
    } catch (e) {
      console.warn("Could not clear localStorage", e);
    }
  }, [commitElements, storageKey]);

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
  };
}
