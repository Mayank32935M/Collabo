/**
 * COLLABO Intelligence — Zod Validation Schemas
 * Guarantees strict runtime validation on LLM JSON outputs before rendering.
 */

import { z } from "zod";

// Recursive concept node schema
export const MindMapConceptNodeSchema: z.ZodType<unknown> = z.lazy(() =>
  z.object({
    id: z.string(),
    label: z.string().min(1),
    description: z.string().optional(),
    category: z.string().optional(),
    children: z.array(MindMapConceptNodeSchema).optional(),
  })
);

export const MindMapRequestSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  depth: z.number().int().min(1).max(4).optional(),
  originX: z.number().optional(),
  originY: z.number().optional(),
  layoutStyle: z.enum(["tree", "radial"]).optional(),
});

export const BoardQARequestSchema = z.object({
  query: z.string().min(1, "Query is required"),
  elements: z.array(z.any()),
  chatHistory: z
    .array(
      z.object({
        sender: z.string(),
        text: z.string(),
      })
    )
    .optional(),
});

export const BoardQAResponseSchema = z.object({
  answer: z.string().min(1),
  referencedElementIds: z.array(z.string()),
  suggestedFollowUps: z.array(z.string()).optional(),
});

export const QuizQuestionSchema = z.object({
  id: z.string(),
  question: z.string().min(1),
  options: z.array(z.string()).min(2),
  correctOptionIndex: z.number().int().min(0),
  explanation: z.string().min(1),
});

export const FlashcardSchema = z.object({
  id: z.string(),
  front: z.string().min(1),
  back: z.string().min(1),
  conceptTag: z.string().optional(),
});

export const LectureRecapRequestSchema = z.object({
  transcript: z.string().optional(),
  boardElements: z.array(z.any()).optional(),
  chatMessages: z
    .array(
      z.object({
        senderName: z.string(),
        body: z.string(),
      })
    )
    .optional(),
});

export const LectureRecapResponseSchema = z.object({
  summaryMarkdown: z.string().min(1),
  keyTakeaways: z.array(z.string()),
  quiz: z.array(QuizQuestionSchema),
  flashcards: z.array(FlashcardSchema),
});
