"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Stage, Layer, Line, Rect, Circle, Text, Group } from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";
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
  toolbarState: ToolbarState;
}

export const CanvasStage: React.FC<CanvasStageProps> = ({
  elements,
  onElementsChange,
  toolbarState,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });

  // Refs for tracking drawing in progress without waiting for React re-render cycles
  const isDrawingRef = useRef(false);
  const activeElementIdRef = useRef<string | null>(null);
  const dragStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

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

  // 1. Mouse/Touch Down: Start drawing or place initial element
  const handlePointerDown = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;

    // Only initiate new drawings if clicking the empty stage or layer background
    const isStageOrLayer = e.target === stage || e.target.getType() === "Layer";

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

      onElementsChange([
        ...elements,
        {
          id,
          type: "sticky",
          x: pos.x - 70,
          y: pos.y - 70,
          width: 140,
          height: 140,
          color: toolbarState.activeColor,
          strokeWidth: 1,
          text: "Double-click to brainstorm ideas...",
          fill: randomFill,
        },
      ]);
    } else if (toolbarState.activeTool === "text") {
      const id = `text-${Date.now()}`;
      onElementsChange([
        ...elements,
        {
          id,
          type: "text",
          x: pos.x,
          y: pos.y,
          color: toolbarState.activeColor,
          strokeWidth: 1,
          text: "COLLABO Canvas Text",
          fontSize: 20,
        },
      ]);
    }
  };

  // 2. Mouse/Touch Move: Update line points or box/circle dimensions
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

  // 3. Mouse/Touch Up: Finalize drawing
  const handlePointerUp = () => {
    if (!isDrawingRef.current) return;

    const activeId = activeElementIdRef.current;

    // Provide default dimensions if user simply clicked without dragging
    onElementsChange(
      elements.map((el) => {
        if (el.id !== activeId) return el;

        if (el.type === "rectangle" && el.width < 5 && el.height < 5) {
          return { ...el, width: 140, height: 90 };
        }

        if (el.type === "circle" && el.radius < 5) {
          return { ...el, radius: 45 };
        }

        return el;
      })
    );

    isDrawingRef.current = false;
    activeElementIdRef.current = null;
  };

  // Element interaction: Deletion with eraser, or dragging with select
  const handleElementClick = (elementId: string) => {
    if (toolbarState.activeTool === "eraser") {
      onElementsChange(elements.filter((el) => el.id !== elementId));
    }
  };

  const handleDragEnd = useCallback(
    (id: string, newX: number, newY: number) => {
      onElementsChange(
        elements.map((el) => {
          if (el.id !== id) return el;
          return {
            ...el,
            x: Math.round(newX),
            y: Math.round(newY),
          };
        })
      );
    },
    [elements, onElementsChange]
  );

  const isSelectMode = toolbarState.activeTool === "select";

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
                    points={el.points}
                    stroke={el.color}
                    strokeWidth={el.strokeWidth}
                    tension={0.4}
                    lineCap="round"
                    lineJoin="round"
                    draggable={isSelectMode}
                    onClick={() => handleElementClick(el.id)}
                    onTap={() => handleElementClick(el.id)}
                  />
                );

              case "rectangle":
                return (
                  <Rect
                    key={el.id}
                    x={el.x}
                    y={el.y}
                    width={el.width}
                    height={el.height}
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
                  />
                );

              case "circle":
                return (
                  <Circle
                    key={el.id}
                    x={el.x}
                    y={el.y}
                    radius={el.radius}
                    stroke={el.color}
                    strokeWidth={el.strokeWidth}
                    fill={el.fill || `${el.color}15`}
                    draggable={isSelectMode}
                    onClick={() => handleElementClick(el.id)}
                    onTap={() => handleElementClick(el.id)}
                    onDragEnd={(e) =>
                      handleDragEnd(el.id, e.target.x(), e.target.y())
                    }
                  />
                );

              case "sticky":
                return (
                  <Group
                    key={el.id}
                    x={el.x}
                    y={el.y}
                    draggable={isSelectMode}
                    onClick={() => handleElementClick(el.id)}
                    onTap={() => handleElementClick(el.id)}
                    onDragEnd={(e) =>
                      handleDragEnd(el.id, e.target.x(), e.target.y())
                    }
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
                    x={el.x}
                    y={el.y}
                    text={el.text}
                    fontSize={el.fontSize}
                    fontFamily="sans-serif"
                    fontStyle="bold"
                    fill={el.color}
                    draggable={isSelectMode}
                    onClick={() => handleElementClick(el.id)}
                    onTap={() => handleElementClick(el.id)}
                    onDragEnd={(e) =>
                      handleDragEnd(el.id, e.target.x(), e.target.y())
                    }
                  />
                );

              default:
                return null;
            }
          })}
        </Layer>
      </Stage>
    </div>
  );
};

export default CanvasStage;

