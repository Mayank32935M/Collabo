/**
 * COLLABO Intelligence — Main Package Entrypoint
 */

import { AIProvider } from "./types";
import { MockAIProvider } from "./providers/mock-provider";
import { GeminiAIProvider } from "./providers/gemini-provider";

export * from "./types";
export * from "./layout";
export * from "./schemas";
export * from "./providers/mock-provider";
export * from "./providers/gemini-provider";

/**
 * Returns an active AIProvider instance.
 * Automatically utilizes GeminiAIProvider if GEMINI_API_KEY is configured;
 * otherwise gracefully falls back to MockAIProvider for zero-config offline development.
 */
export function getAIProvider(config?: {
  apiKey?: string;
  model?: string;
}): AIProvider {
  const apiKey = config?.apiKey || process.env.GEMINI_API_KEY;
  if (apiKey && apiKey.length > 5) {
    return new GeminiAIProvider({ apiKey, model: config?.model });
  }
  return new MockAIProvider();
}
