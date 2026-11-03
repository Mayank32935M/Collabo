import { CanvasElement } from "@collabo/shared";
import { cloneElements } from "./elements";

export interface HistoryState {
  past: CanvasElement[][];
  present: CanvasElement[];
  future: CanvasElement[][];
}

export interface HistoryManagerOptions {
  maxSteps?: number;
}

/**
 * Pure History Manager implementing the Command pattern for Canvas elements.
 * Manages undo/redo stacks independently of UI framework lifecycle.
 */
export class HistoryManager {
  private past: CanvasElement[][] = [];
  private present: CanvasElement[] = [];
  private future: CanvasElement[][] = [];
  private maxSteps: number;

  constructor(initialElements: CanvasElement[] = [], options: HistoryManagerOptions = {}) {
    this.present = cloneElements(initialElements);
    this.maxSteps = options.maxSteps || 30;
  }

  get canUndo(): boolean {
    return this.past.length > 0;
  }

  get canRedo(): boolean {
    return this.future.length > 0;
  }

  get currentElements(): CanvasElement[] {
    return this.present;
  }

  get state(): HistoryState {
    return {
      past: this.past,
      present: this.present,
      future: this.future,
    };
  }

  /**
   * Commits a new canvas snapshot to history, clearing future redo stack.
   */
  commit(newElements: CanvasElement[]): CanvasElement[] {
    this.past.push(cloneElements(this.present));
    if (this.past.length > this.maxSteps) {
      this.past.shift();
    }
    this.present = cloneElements(newElements);
    this.future = [];
    return this.present;
  }

  /**
   * Undoes the last action, restoring previous snapshot.
   */
  undo(): CanvasElement[] | null {
    if (!this.canUndo) return null;
    const previous = this.past.pop()!;
    this.future.unshift(cloneElements(this.present));
    this.present = previous;
    return this.present;
  }

  /**
   * Redoes the previously undone action.
   */
  redo(): CanvasElement[] | null {
    if (!this.canRedo) return null;
    const next = this.future.shift()!;
    this.past.push(cloneElements(this.present));
    this.present = next;
    return this.present;
  }

  /**
   * Resets history with a clean initial state.
   */
  reset(newElements: CanvasElement[] = []): void {
    this.past = [];
    this.present = cloneElements(newElements);
    this.future = [];
  }
}

