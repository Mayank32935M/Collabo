"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Stage, Layer, Line, Rect, Circle, Text, Group, Transformer } from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";
import type Konva from "konva";
import {
  CanvasElement,
  ToolbarState,
  PenElement,
  RectElement,
  CircleElement,
} from "@/types/canvas";

export interface CanvasStageProps {
  elements: CanvasElement[];
  onElementsChange: (elements: CanvasElement[]) => void;
  onCommitElements: (elements: CanvasElement[]) => void;
  toolbarState: ToolbarState;
  selectedId: string | null;
  onSelectElement: (id: string | null) => void;
}

export const CanvasStage: React.FC<CanvasStageProps> = ({
  elements,
  onElementsChange,
  onCommitElements,
  toolbarState,
  selectedId,
  onSelectElement,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });

  // Refs for tracking drawing in progress without waiting for React re-render cycles
  const isDrawingRef = useRef(false);
  const activeElementIdRef = useRef<string | null>(null);
  const dragStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const transformerRef = useRef<Konva.Transformer>(null);

  const isSelectMode = toolbarState.activeTool === "select";

  // Dynamically resize Stage to fill the container 100%
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Attach Transformer to the selected node whenever selection changes
  useEffect(() => {
    if (transformerRef.current) {
      const stage = transformerRef.current.getStage();
      if (selectedId && isSelectMode && stage) {
        const selectedNode = stage.findOne("#" + selectedId);
        if (selectedNode) {
          transformerRef.current.nodes([selectedNode]);
          transformerRef.current.getLayer()?.batchDraw();
          return;
        }
      }
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [selectedId, isSelectMode, elements]);

  // Keyboard shortcut: Delete or Backspace to remove selected element
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      if ((e.key === "Delete" || e.key === "Backspace") && selectedId && isSelectMode) {
        e.preventDefault();
        const nextElements = elements.filter((el) => el.id !== selectedId);
        onCommitElements(nextElements);
        onSelectElement(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedId, isSelectMode, elements, onCommitElements, onSelectElement]);

  // 1. Mouse/Touch Down: Start drawing, place initial element, or select
  const handlePointerDown = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;

    // Check if clicked the empty stage background or layer
    const isStageOrLayer = e.target === stage || e.target.getType() === "Layer";

    if (isStageOrLayer) {
      // Deselect when clicking empty space
      if (isSelectMode) {
        onSelectElement(null);
      }
    }

    if (!isStageOrLayer && toolbarState.activeTool === "eraser") {
      return; // Handled by element click
    }

    if (toolbarState.activeTool === "pen") {
      isDrawingRef.current = true;
      const id = `pen-${Date.now()}`;
      activeElementIdRef.current = id;

      const newPen: PenElement = {
        id,
        type: "pen",
        color: toolbarState.activeColor,
        strokeWidth: toolbarState.strokeWidth,
        points: [pos.x, pos.y],
      };

      onElementsChange([...elements, newPen]);
    } else if (toolbarState.activeTool === "rectangle") {
      isDrawingRef.current = true;
      const id = `rect-${Date.now()}`;
      activeElementIdRef.current = id;
      dragStartPosRef.current = { x: pos.x, y: pos.y };

      const newRect: RectElement = {
        id,
        type: "rectangle",
        color: toolbarState.activeColor,
        strokeWidth: toolbarState.strokeWidth,
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
        fill: `${toolbarState.activeColor}15`,
      };

      onElementsChange([...elements, newRect]);
    } else if (toolbarState.activeTool === "circle") {
      isDrawingRef.current = true;
      const id = `circle-${Date.now()}`;
      activeElementIdRef.current = id;
      dragStartPosRef.current = { x: pos.x, y: pos.y };

      const newCircle: CircleElement = {
        id,
        type: "circle",
        color: toolbarState.activeColor,
        strokeWidth: toolbarState.strokeWidth,
        x: pos.x,
        y: pos.y,
        radius: 0,
        fill: `${toolbarState.activeColor}15`,
      };

      onElementsChange([...elements, newCircle]);
    } else if (toolbarState.activeTool === "sticky") {
      const id = `sticky-${Date.now()}`;
      const stickyColors = ["#fef3c7", "#fce7f3", "#cffafe", "#dcfce7"];
      const randomFill = stickyColors[elements.length % stickyColors.length];

      const newSticky: CanvasElement = {
        id,
        type: "sticky",
        x: Math.round(pos.x - 70),
        y: Math.round(pos.y - 70),
        width: 140,
        height: 140,
        color: toolbarState.activeColor,
        strokeWidth: 1,
        text: "Double-click to brainstorm ideas...",
        fill: randomFill,
      };

      onCommitElements([...elements, newSticky]);
    } else if (toolbarState.activeTool === "text") {
      const id = `text-${Date.now()}`;
      const newText: CanvasElement = {
        id,
        type: "text",
        x: Math.round(pos.x),
        y: Math.round(pos.y),
        color: toolbarState.activeColor,
        strokeWidth: 1,
        text: "COLLABO Canvas Text",
        fontSize: 20,
      };

      onCommitElements([...elements, newText]);
    }
  };

  // 2. Mouse/Touch Move: Update line points or box/circle dimensions live
  const handlePointerMove = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (!isDrawingRef.current || !activeElementIdRef.current) return;

    const stage = e.target.getStage();
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;

    const activeId = activeElementIdRef.current;

    onElementsChange(
      elements.map((el) => {
        if (el.id !== activeId) return el;

        if (el.type === "pen") {
          return {
            ...el,
            points: [...el.points, pos.x, pos.y],
          };
        }

        if (el.type === "rectangle") {
          const startX = dragStartPosRef.current.x;
          const startY = dragStartPosRef.current.y;
          return {
            ...el,
            x: Math.min(startX, pos.x),
            y: Math.min(startY, pos.y),
            width: Math.abs(pos.x - startX),
            height: Math.abs(pos.y - startY),
          };
        }

        if (el.type === "circle") {
          const startX = dragStartPosRef.current.x;
          const startY = dragStartPosRef.current.y;
          const radius = Math.round(Math.hypot(pos.x - startX, pos.y - startY));
          return {
            ...el,
            radius,
          };
        }

        return el;
      })
    );
  };

  // 3. Mouse/Touch Up: Finalize drawing and commit snapshot to history
  const handlePointerUp = () => {
    if (!isDrawingRef.current) return;

    const activeId = activeElementIdRef.current;

    const finalElements = elements.map((el) => {
      if (el.id !== activeId) return el;

      if (el.type === "rectangle" && el.width < 5 && el.height < 5) {
        return { ...el, width: 140, height: 90 };
      }

      if (el.type === "circle" && el.radius < 5) {
        return { ...el, radius: 45 };
      }

      return el;
    });

    onCommitElements(finalElements);
    isDrawingRef.current = false;
    activeElementIdRef.current = null;
  };

  // 4. Element interaction: selection, deletion, or text editing
  const handleElementClick = (elementId: string) => {
    if (toolbarState.activeTool === "eraser") {
      onCommitElements(elements.filter((el) => el.id !== elementId));
      if (selectedId === elementId) onSelectElement(null);
    } else if (isSelectMode) {
      onSelectElement(elementId);
    }
  };

  const handleDragEnd = useCallback(
    (id: string, newX: number, newY: number) => {
      const updated = elements.map((el) => {
        if (el.id !== id) return el;
        return {
          ...el,
          x: Math.round(newX),
          y: Math.round(newY),
        };
      });
      onCommitElements(updated);
    },
    [elements, onCommitElements]
  );

  // 5. Transformer: Resizing and Rotating
  const handleTransformEnd = (e: KonvaEventObject<Event>, id: string) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    const rotation = Math.round(node.rotation());

    // Reset internal scale so future transforms don't compound
    node.scaleX(1);
    node.scaleY(1);

    const updated = elements.map((el) => {
      if (el.id !== id) return el;

      if (el.type === "rectangle") {
        return {
          ...el,
          x: Math.round(node.x()),
          y: Math.round(node.y()),
          width: Math.max(10, Math.round(node.width() * scaleX)),
          height: Math.max(10, Math.round(node.height() * scaleY)),
          rotation,
        };
      }

      if (el.type === "circle") {
        return {
          ...el,
          x: Math.round(node.x()),
          y: Math.round(node.y()),
          radius: Math.max(
            10,
            Math.round(el.radius * Math.max(Math.abs(scaleX), Math.abs(scaleY)))
          ),
          rotation,
        };
      }

      if (el.type === "sticky") {
        return {
          ...el,
          x: Math.round(node.x()),
          y: Math.round(node.y()),
          width: Math.max(60, Math.round(el.width * scaleX)),
          height: Math.max(60, Math.round(el.height * scaleY)),
          rotation,
        };
      }

      if (el.type === "text") {
        return {
          ...el,
          x: Math.round(node.x()),
          y: Math.round(node.y()),
          fontSize: Math.max(12, Math.round(el.fontSize * Math.abs(scaleY))),
          rotation,
        };
      }

      return el;
    });

    onCommitElements(updated);
  };

  // 6. Double click to edit sticky note or text
  const handleDoubleClick = (el: CanvasElement) => {
    if (el.type === "sticky" || el.type === "text") {
      const newText = window.prompt("Edit text:", el.text);
      if (newText !== null && newText.trim() !== "") {
        const updated = elements.map((item) =>
          item.id === el.id ? { ...item, text: newText.trim() } : item
        );
        onCommitElements(updated);
      }
    }
  };

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden">
      <Stage
        width={dimensions.width}
        height={dimensions.height}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
      >
        <Layer>
          {elements.map((el) => {
            switch (el.type) {
              case "pen":
                return (
                  <Line
                    key={el.id}
                    id={el.id}
                    points={el.points}
                    stroke={el.color}
                    strokeWidth={el.strokeWidth}
                    tension={0.4}
                    lineCap="round"
                    lineJoin="round"
                    draggable={isSelectMode}
                    onClick={() => handleElementClick(el.id)}
                    onTap={() => handleElementClick(el.id)}
                    onDragEnd={(e) =>
                      handleDragEnd(el.id, e.target.x(), e.target.y())
                    }
                  />
                );

              case "rectangle":
                return (
                  <Rect
                    key={el.id}
                    id={el.id}
                    x={el.x}
                    y={el.y}
                    width={el.width}
                    height={el.height}
                    rotation={el.rotation || 0}
                    stroke={el.color}
                    strokeWidth={el.strokeWidth}
                    fill={el.fill || `${el.color}15`}
                    cornerRadius={8}
                    draggable={isSelectMode}
                    onClick={() => handleElementClick(el.id)}
                    onTap={() => handleElementClick(el.id)}
                    onDragEnd={(e) =>
                      handleDragEnd(el.id, e.target.x(), e.target.y())
                    }
                    onTransformEnd={(e) => handleTransformEnd(e, el.id)}
                  />
                );

              case "circle":
                return (
                  <Circle
                    key={el.id}
                    id={el.id}
                    x={el.x}
                    y={el.y}
                    radius={el.radius}
                    rotation={el.rotation || 0}
                    stroke={el.color}
                    strokeWidth={el.strokeWidth}
                    fill={el.fill || `${el.color}15`}
                    draggable={isSelectMode}
                    onClick={() => handleElementClick(el.id)}
                    onTap={() => handleElementClick(el.id)}
                    onDragEnd={(e) =>
                      handleDragEnd(el.id, e.target.x(), e.target.y())
                    }
                    onTransformEnd={(e) => handleTransformEnd(e, el.id)}
                  />
                );

              case "sticky":
                return (
                  <Group
                    key={el.id}
                    id={el.id}
                    x={el.x}
                    y={el.y}
                    rotation={el.rotation || 0}
                    draggable={isSelectMode}
                    onClick={() => handleElementClick(el.id)}
                    onTap={() => handleElementClick(el.id)}
                    onDblClick={() => handleDoubleClick(el)}
                    onDblTap={() => handleDoubleClick(el)}
                    onDragEnd={(e) =>
                      handleDragEnd(el.id, e.target.x(), e.target.y())
                    }
                    onTransformEnd={(e) => handleTransformEnd(e, el.id)}
                  >
                    <Rect
                      width={el.width}
                      height={el.height}
                      fill={el.fill}
                      stroke="#cbd5e1"
                      strokeWidth={1}
                      shadowColor="rgba(0,0,0,0.12)"
                      shadowBlur={8}
                      shadowOffset={{ x: 2, y: 3 }}
                      cornerRadius={6}
                    />
                    <Text
                      text={el.text}
                      x={14}
                      y={14}
                      width={el.width - 28}
                      height={el.height - 28}
                      fontSize={13}
                      fontFamily="sans-serif"
                      fill="#1e293b"
                    />
                  </Group>
                );

              case "text":
                return (
                  <Text
                    key={el.id}
                    id={el.id}
                    x={el.x}
                    y={el.y}
                    rotation={el.rotation || 0}
                    text={el.text}
                    fontSize={el.fontSize}
                    fontFamily="sans-serif"
                    fontStyle="bold"
                    fill={el.color}
                    draggable={isSelectMode}
                    onClick={() => handleElementClick(el.id)}
                    onTap={() => handleElementClick(el.id)}
                    onDblClick={() => handleDoubleClick(el)}
                    onDblTap={() => handleDoubleClick(el)}
                    onDragEnd={(e) =>
                      handleDragEnd(el.id, e.target.x(), e.target.y())
                    }
                    onTransformEnd={(e) => handleTransformEnd(e, el.id)}
                  />
                );

              default:
                return null;
            }
          })}

          {/* Konva Transformer Bounding Box with Resize Handles */}
          {isSelectMode && (
            <Transformer
              ref={transformerRef}
              boundBoxFunc={(oldBox, newBox) => {
                // Minimum size constraint
                if (newBox.width < 15 || newBox.height < 15) {
                  return oldBox;
                }
                return newBox;
              }}
              anchorStroke="#6366f1"
              anchorFill="#ffffff"
              anchorSize={9}
              anchorCornerRadius={2}
              borderStroke="#6366f1"
              borderDash={[4, 4]}
              rotateAnchorOffset={24}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default CanvasStage;
