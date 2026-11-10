import {
  CanvasElement,
  CircleElement,
  ImageElement,
  PenElement,
  RectElement,
  StickyElement,
  StrokeWidth,
  TextElement,
} from "@collabo/shared";

/**
 * Generates an element ID with a random suffix.
 */
export function generateElementId(prefix = "el"): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Factory for creating a new Pen element.
 */
export function createPenElement(options: {
  id?: string;
  points?: number[];
  color?: string;
  strokeWidth?: StrokeWidth;
  x?: number;
  y?: number;
  rotation?: number;
}): PenElement {
  return {
    id: options.id || generateElementId("pen"),
    type: "pen",
    points: options.points || [],
    color: options.color || "#1e293b",
    strokeWidth: options.strokeWidth || 4,
    x: options.x ?? 0,
    y: options.y ?? 0,
    rotation: options.rotation ?? 0,
  };
}

/**
 * Factory for creating a new Rectangle element.
 */
export function createRectElement(options: {
  id?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  color?: string;
  fill?: string;
  strokeWidth?: StrokeWidth;
  rotation?: number;
}): RectElement {
  return {
    id: options.id || generateElementId("rect"),
    type: "rectangle",
    x: options.x,
    y: options.y,
    width: options.width ?? 120,
    height: options.height ?? 80,
    color: options.color || "#1e293b",
    fill: options.fill,
    strokeWidth: options.strokeWidth || 2,
    rotation: options.rotation ?? 0,
  };
}

/**
 * Factory for creating a new Circle element.
 */
export function createCircleElement(options: {
  id?: string;
  x: number;
  y: number;
  radius?: number;
  color?: string;
  fill?: string;
  strokeWidth?: StrokeWidth;
  rotation?: number;
}): CircleElement {
  return {
    id: options.id || generateElementId("circle"),
    type: "circle",
    x: options.x,
    y: options.y,
    radius: options.radius ?? 50,
    color: options.color || "#1e293b",
    fill: options.fill,
    strokeWidth: options.strokeWidth || 2,
    rotation: options.rotation ?? 0,
  };
}

/**
 * Factory for creating a new Sticky Note element.
 */
export function createStickyElement(options: {
  id?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  color?: string;
  fill?: string;
  strokeWidth?: StrokeWidth;
  rotation?: number;
}): StickyElement {
  return {
    id: options.id || generateElementId("sticky"),
    type: "sticky",
    x: options.x,
    y: options.y,
    width: options.width ?? 180,
    height: options.height ?? 180,
    text: options.text || "New Idea",
    color: options.color || "#f59e0b",
    fill: options.fill || "#fef3c7",
    strokeWidth: options.strokeWidth || 1,
    rotation: options.rotation ?? 0,
  };
}

/**
 * Factory for creating a new Text element.
 */
export function createTextElement(options: {
  id?: string;
  x: number;
  y: number;
  text?: string;
  color?: string;
  fontSize?: number;
  strokeWidth?: StrokeWidth;
  rotation?: number;
}): TextElement {
  return {
    id: options.id || generateElementId("text"),
    type: "text",
    x: options.x,
    y: options.y,
    text: options.text || "Type something...",
    color: options.color || "#1e293b",
    fontSize: options.fontSize ?? 20,
    strokeWidth: options.strokeWidth || 1,
    rotation: options.rotation ?? 0,
  };
}

/**
 * Factory for creating a new Image element.
 */
export function createImageElement(options: {
  id?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  src: string;
  aspectRatio?: number;
  color?: string;
  strokeWidth?: StrokeWidth;
  rotation?: number;
  authorId?: string;
  authorName?: string;
}): ImageElement {
  return {
    id: options.id || generateElementId("img"),
    type: "image",
    x: options.x,
    y: options.y,
    width: options.width ?? 320,
    height: options.height ?? 240,
    src: options.src,
    aspectRatio: options.aspectRatio,
    color: options.color || "#6366f1",
    strokeWidth: options.strokeWidth || 1,
    rotation: options.rotation ?? 0,
    authorId: options.authorId,
    authorName: options.authorName,
  };
}

/**
 * Deep-clones an array of canvas elements.
 */
export function cloneElements(elements: CanvasElement[]): CanvasElement[] {
  return elements.map((el) => {
    if (el.type === "pen") {
      return { ...el, points: [...el.points] };
    }
    return { ...el };
  });
}

/**
 * Moves an element up one level in the rendering order (higher z-index).
 */
export function bringForward(
  elements: CanvasElement[],
  targetId: string
): CanvasElement[] {
  const index = elements.findIndex((el) => el.id === targetId);
  if (index === -1 || index === elements.length - 1) return elements;

  const result = [...elements];
  const temp = result[index];
  result[index] = result[index + 1];
  result[index + 1] = temp;
  return result;
}

/**
 * Moves an element down one level in the rendering order (lower z-index).
 */
export function sendBackward(
  elements: CanvasElement[],
  targetId: string
): CanvasElement[] {
  const index = elements.findIndex((el) => el.id === targetId);
  if (index === -1 || index === 0) return elements;

  const result = [...elements];
  const temp = result[index];
  result[index] = result[index - 1];
  result[index - 1] = temp;
  return result;
}

/**
 * Moves an element to the very top of the rendering stack.
 */
export function bringToFront(
  elements: CanvasElement[],
  targetId: string
): CanvasElement[] {
  const index = elements.findIndex((el) => el.id === targetId);
  if (index === -1 || index === elements.length - 1) return elements;

  const target = elements[index];
  const filtered = elements.filter((el) => el.id !== targetId);
  return [...filtered, target];
}

/**
 * Moves an element to the very bottom of the rendering stack.
 */
export function sendToBack(
  elements: CanvasElement[],
  targetId: string
): CanvasElement[] {
  const index = elements.findIndex((el) => el.id === targetId);
  if (index === -1 || index === 0) return elements;

  const target = elements[index];
  const filtered = elements.filter((el) => el.id !== targetId);
  return [target, ...filtered];
}

