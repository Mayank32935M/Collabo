/**
 * COLLABO — Canvas & Toolbar Type Definitions
 * Prepares the state contracts for canvas interactions and upcoming Konva integration.
 */

export type CanvasTool =
  | "select"
  | "pen"
  | "rectangle"
  | "sticky"
  | "text"
  | "eraser";

export interface ToolDefinition {
  id: CanvasTool;
  label: string;
  shortcut: string;
  icon: string;
  description: string;
}

export const CANVAS_TOOLS: ToolDefinition[] = [
  {
    id: "select",
    label: "Select",
    shortcut: "V",
    icon: "pointer",
    description: "Select, move, and transform objects",
  },
  {
    id: "pen",
    label: "Freehand Pen",
    shortcut: "P",
    icon: "pen",
    description: "Draw freehand paths and sketches",
  },
  {
    id: "rectangle",
    label: "Rectangle",
    shortcut: "R",
    icon: "square",
    description: "Create geometric boxes and containers",
  },
  {
    id: "sticky",
    label: "Sticky Note",
    shortcut: "S",
    icon: "note",
    description: "Add brainstorm sticky notes with text",
  },
  {
    id: "text",
    label: "Text",
    shortcut: "T",
    icon: "text",
    description: "Add standalone typography & labels",
  },
  {
    id: "eraser",
    label: "Eraser",
    shortcut: "E",
    icon: "eraser",
    description: "Delete canvas elements on click",
  },
  {
    id: "circle",
    label: "circle",
    shortcut: "C",
    icon: "circle",
    description: "Draw circles and ellipses",
  },
];

export interface ColorOption {
  hex: string;
  name: string;
}

export const COLOR_PALETTE: ColorOption[] = [
  { hex: "#1e293b", name: "Slate Charcoal" },
  { hex: "#6366f1", name: "Indigo Purple" },
  { hex: "#f43f5e", name: "Playful Rose" },
  { hex: "#f59e0b", name: "Warm Amber" },
  { hex: "#10b981", name: "Fresh Emerald" },
  { hex: "#06b6d4", name: "Sky Cyan" },
];

export const STROKE_WIDTHS = [
  { value: 2, label: "Thin" },
  { value: 4, label: "Medium" },
  { value: 8, label: "Thick" },
] as const;

export type StrokeWidth = (typeof STROKE_WIDTHS)[number]["value"];

export interface ToolbarState {
  activeTool: CanvasTool;
  activeColor: string;
  strokeWidth: StrokeWidth;
}
