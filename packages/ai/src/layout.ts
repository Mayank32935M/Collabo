/**
 * COLLABO Intelligence — Spatial Tree Layout Engine
 * Calculates non-overlapping 2D world coordinates for hierarchical concept trees
 * and generates structured CanvasElement shapes with connecting relationship lines.
 */

import {
  CanvasElement,
  MindMapConceptNode,
} from "@collabo/shared";
import {
  createPenElement,
  createRectElement,
  createStickyElement,
} from "@collabo/whiteboard";

export interface LayoutOptions {
  originX?: number;
  originY?: number;
  horizontalSpacing?: number;
  verticalSpacing?: number;
  nodeWidth?: number;
  nodeHeight?: number;
}

export function layoutConceptTree(
  root: MindMapConceptNode,
  options?: LayoutOptions
): CanvasElement[] {
  const elements: CanvasElement[] = [];
  const originX = options?.originX ?? 400;
  const originY = options?.originY ?? 300;
  const horizontalSpacing = options?.horizontalSpacing ?? 260;
  const verticalSpacing = options?.verticalSpacing ?? 140;
  const nodeWidth = options?.nodeWidth ?? 180;
  const nodeHeight = options?.nodeHeight ?? 90;

  // Level-based visual styles
  const levelFills = ["#e0e7ff", "#fef3c7", "#dcfce7", "#fce7f3", "#cffafe"];
  const levelStrokes = ["#4338ca", "#b45309", "#15803d", "#be185d", "#0e7490"];

  function getSubtreeLeafCount(node: MindMapConceptNode): number {
    if (!node.children || node.children.length === 0) return 1;
    return node.children.reduce(
      (acc, child) => acc + getSubtreeLeafCount(child),
      0
    );
  }

  function positionNode(
    node: MindMapConceptNode,
    x: number,
    yTop: number,
    yBottom: number,
    level: number,
    parentId?: string,
    parentRightEdge?: { x: number; y: number }
  ): { x: number; y: number } {
    const y = (yTop + yBottom) / 2 - nodeHeight / 2;
    const currentCenter = { x: x + nodeWidth / 2, y: y + nodeHeight / 2 };
    const rightEdge = { x: x + nodeWidth, y: y + nodeHeight / 2 };

    const colorIdx = level % levelFills.length;
    const fill = levelFills[colorIdx];
    const stroke = levelStrokes[colorIdx];

    if (level === 0) {
      // Root concept: prominent sticky note
      const rootSticky = createStickyElement({
        id: node.id,
        x: Math.round(x),
        y: Math.round(y),
        width: nodeWidth,
        height: nodeHeight,
        text: `★ ${node.label}\n${node.description || ""}`.trim(),
        fill: "#e0e7ff",
        color: "#4338ca",
      });
      elements.push(rootSticky);
    } else {
      // Sub-concepts: styled cards
      const childCard = createStickyElement({
        id: node.id,
        x: Math.round(x),
        y: Math.round(y),
        width: nodeWidth,
        height: nodeHeight,
        text: `${node.label}\n${node.description || ""}`.trim(),
        fill,
        color: stroke,
      });
      elements.push(childCard);
    }

    // Connective vector line from parent to this node
    if (parentRightEdge) {
      const lineId = `conn-${parentId}-${node.id}`;
      const startX = parentRightEdge.x;
      const startY = parentRightEdge.y;
      const endX = x;
      const endY = y + nodeHeight / 2;
      const midX = (startX + endX) / 2;

      const connector = createPenElement({
        id: lineId,
        points: [
          Math.round(startX),
          Math.round(startY),
          Math.round(midX),
          Math.round(startY),
          Math.round(midX),
          Math.round(endY),
          Math.round(endX),
          Math.round(endY),
        ],
        color: stroke,
        strokeWidth: 2,
      });
      elements.push(connector);
    }

    // Position children recursively
    if (node.children && node.children.length > 0) {
      const totalLeaves = getSubtreeLeafCount(node);
      let currentY = yTop;

      for (const child of node.children) {
        const childLeaves = getSubtreeLeafCount(child);
        const childSliceHeight =
          (childLeaves / totalLeaves) * (yBottom - yTop);
        const nextX = x + horizontalSpacing;

        positionNode(
          child,
          nextX,
          currentY,
          currentY + childSliceHeight,
          level + 1,
          node.id,
          rightEdge
        );

        currentY += childSliceHeight;
      }
    }

    return currentCenter;
  }

  const rootLeaves = getSubtreeLeafCount(root);
  const totalHeight = Math.max(nodeHeight * 2, rootLeaves * verticalSpacing);
  positionNode(
    root,
    originX,
    originY - totalHeight / 2,
    originY + totalHeight / 2,
    0
  );

  return elements;
}
