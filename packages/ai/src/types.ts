/**
 * COLLABO Intelligence — AI Provider Interface Contracts
 */

import {
  BoardQARequest,
  BoardQAResponse,
  LectureRecapRequest,
  LectureRecapResponse,
  MindMapRequest,
  MindMapResponse,
} from "@collabo/shared";

export interface AIProvider {
  name: string;
  isAvailable(): boolean;
  generateMindMap(request: MindMapRequest): Promise<MindMapResponse>;
  answerBoardQuery(request: BoardQARequest): Promise<BoardQAResponse>;
  summarizeLecture(request: LectureRecapRequest): Promise<LectureRecapResponse>;
}
