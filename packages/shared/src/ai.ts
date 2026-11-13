/**
 * COLLABO Intelligence — Shared AI Domain Contracts & Models
 * Defines data structures for Mind-Map generation, Board-Aware Q&A,
 * Lecture Recaps, Practice Quizzes, and Human-in-the-Loop Previewing.
 */

import { CanvasElement } from "./canvas";

// -------------------------------------------------------------
// 1. Mind-Map Generation
// -------------------------------------------------------------

export interface MindMapRequest {
  topic: string;
  depth?: number;
  originX?: number;
  originY?: number;
  layoutStyle?: "tree" | "radial";
}

export interface MindMapConceptNode {
  id: string;
  label: string;
  description?: string;
  category?: string;
  children?: MindMapConceptNode[];
}

export interface MindMapResponse {
  topic: string;
  elements: CanvasElement[];
  rootNodeId: string;
}

// -------------------------------------------------------------
// 2. Board-Aware Spatial Q&A
// -------------------------------------------------------------

export interface BoardQARequest {
  query: string;
  elements: CanvasElement[];
  chatHistory?: Array<{ sender: string; text: string }>;
}

export interface BoardQAResponse {
  answer: string;
  referencedElementIds: string[];
  suggestedFollowUps?: string[];
}

// -------------------------------------------------------------
// 3. Lecture Recaps, Quizzes & Flashcards
// -------------------------------------------------------------

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  conceptTag?: string;
}

export interface LectureRecapRequest {
  transcript?: string;
  boardElements?: CanvasElement[];
  chatMessages?: Array<{ senderName: string; body: string }>;
}

export interface LectureRecapResponse {
  summaryMarkdown: string;
  keyTakeaways: string[];
  quiz: QuizQuestion[];
  flashcards: Flashcard[];
}

// -------------------------------------------------------------
// 4. Human-in-the-Loop Preview State
// -------------------------------------------------------------

export type AIPreviewStatus = "idle" | "previewing" | "accepted" | "rejected";

export interface AIPreviewState {
  elements: CanvasElement[];
  status: AIPreviewStatus;
  description?: string;
}
