/**
 * COLLABO Intelligence — Google Gemini API Provider
 * Leverages Google Gemini 2.5 Flash for high-speed multi-modal comprehension,
 * structured JSON mind-map generation, and spatial board reasoning.
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
import { MockAIProvider } from "./mock-provider";

export interface GeminiConfig {
  apiKey: string;
  model?: string;
}

export class GeminiAIProvider implements AIProvider {
  readonly name = "GeminiAIProvider";
  private readonly apiKey: string;
  private readonly model: string;
  private readonly fallbackProvider: MockAIProvider;

  constructor(config: GeminiConfig) {
    if (!config.apiKey) {
      throw new Error("GeminiAIProvider requires a valid GEMINI_API_KEY");
    }
    this.apiKey = config.apiKey;
    this.model = config.model || "gemini-2.5-flash";
    this.fallbackProvider = new MockAIProvider();
  }

  isAvailable(): boolean {
    return Boolean(this.apiKey && this.apiKey.length > 5);
  }

  private async callGemini(
    prompt: string,
    systemInstruction?: string,
    isJson = true
  ): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    const body: Record<string, unknown> = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    };

    if (systemInstruction) {
      body.systemInstruction = {
        parts: [{ text: systemInstruction }],
      };
    }

    if (isJson) {
      body.generationConfig = {
        responseMimeType: "application/json",
      };
    }

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error [${response.status}]: ${errText}`);
    }

    const data = await response.json();
    const candidateText =
      data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      throw new Error("Gemini returned an empty response");
    }

    return candidateText;
  }

  async generateMindMap(request: MindMapRequest): Promise<MindMapResponse> {
    try {
      const systemInstruction = `You are an expert pedagogical concept modeler. Given a topic, output a structured concept tree as JSON conforming to this schema:
{
  "id": "root",
  "label": "Main Topic",
  "description": "Short 1-sentence overview",
  "children": [
    {
      "id": "child-1",
      "label": "Subconcept Name",
      "description": "Key point",
      "children": [ ... ]
    }
  ]
}
Generate 3 to 4 major sub-branches, with 2 sub-nodes under each branch. Keep labels concise (2 to 4 words). Output ONLY pure JSON.`;

      const rawJson = await this.callGemini(
        `Topic: ${request.topic}`,
        systemInstruction,
        true
      );
      const parsedTree: MindMapConceptNode = JSON.parse(rawJson);

      const elements = layoutConceptTree(parsedTree, {
        originX: request.originX ?? 300,
        originY: request.originY ?? 300,
      });

      return {
        topic: request.topic,
        elements,
        rootNodeId: parsedTree.id,
      };
    } catch (err) {
      console.warn(
        "[GeminiAIProvider] Error generating mind map, falling back to mock:",
        err
      );
      return this.fallbackProvider.generateMindMap(request);
    }
  }

  async answerBoardQuery(request: BoardQARequest): Promise<BoardQAResponse> {
    try {
      const serializedElements = request.elements.map((el) => {
        const text = "text" in el ? el.text : undefined;
        return {
          id: el.id,
          type: el.type,
          x: el.x,
          y: el.y,
          color: el.color,
          text,
        };
      });

      const systemInstruction = `You are a helpful educational teaching assistant examining an interactive 2D whiteboard.
You are given a user question and a list of canvas elements with their spatial coordinates, colors, and text.
Answer the question accurately, referencing specific element IDs and concepts where relevant.
Output JSON format:
{
  "answer": "Clear explanation referencing canvas nodes",
  "referencedElementIds": ["id1", "id2"],
  "suggestedFollowUps": ["Follow-up question 1?", "Follow-up question 2?"]
}`;

      const prompt = `User Question: "${request.query}"\nCanvas Elements:\n${JSON.stringify(
        serializedElements,
        null,
        2
      )}`;

      const rawJson = await this.callGemini(prompt, systemInstruction, true);
      const parsed: BoardQAResponse = JSON.parse(rawJson);
      return parsed;
    } catch (err) {
      console.warn(
        "[GeminiAIProvider] Error answering board query, falling back to mock:",
        err
      );
      return this.fallbackProvider.answerBoardQuery(request);
    }
  }

  async summarizeLecture(
    request: LectureRecapRequest
  ): Promise<LectureRecapResponse> {
    try {
      const systemInstruction = `You are an expert educational curriculum synthesizer.
Analyze the lecture inputs (board text, chat discussions, transcripts) and generate a comprehensive study package in JSON:
{
  "summaryMarkdown": "## Markdown lecture summary...",
  "keyTakeaways": ["Takeaway 1", "Takeaway 2"],
  "quiz": [
    {
      "id": "q1",
      "question": "Question text?",
      "options": ["A", "B", "C", "D"],
      "correctOptionIndex": 0,
      "explanation": "Why A is correct..."
    }
  ],
  "flashcards": [
    {
      "id": "f1",
      "front": "Concept name",
      "back": "Definition / explanation",
      "conceptTag": "Tag"
    }
  ]
}`;

      const prompt = `Whiteboard Elements: ${JSON.stringify(
        request.boardElements?.map((e) => ("text" in e ? e.text : e.type)) || []
      )}\nChat Logs: ${JSON.stringify(
        request.chatMessages || []
      )}\nTranscript: ${request.transcript || "None"}`;

      const rawJson = await this.callGemini(prompt, systemInstruction, true);
      const parsed: LectureRecapResponse = JSON.parse(rawJson);
      return parsed;
    } catch (err) {
      console.warn(
        "[GeminiAIProvider] Error summarizing lecture, falling back to mock:",
        err
      );
      return this.fallbackProvider.summarizeLecture(request);
    }
  }
}
