"use client";

import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  Stage,
  Layer,
  Line,
  Rect,
  Circle,
  Text,
  Group,
  Image as KonvaImage,
  Transformer,
} from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";
import type Konva from "konva";
import {
  CanvasElement,
  CircleElement,
  ImageElement,
  PenElement,
  RectElement,
  ToolbarState,
  ViewportTransform,
} from "@collabo/shared";
import {
  calculateZoomAtPointer,
  clampScale,
  createImageElement,
  screenToWorld,
  worldToScreen,
} from "@collabo/whiteboard";

export interface PeerCursor {
  profileId: string;
  name: string;
  x: number; // World coordinate
  y: number; // World coordinate
  color?: string;
  lastActive?: number;
}

export interface CanvasStageProps {
  elements: CanvasElement[];
  previewElements?: CanvasElement[];
  onElementsChange: (elements: CanvasElement[]) => void;
  onCommitElements: (elements: CanvasElement[]) => void;
  toolbarState: ToolbarState;
  selectedId: string | null;
  onSelectElement: (id: string | null) => void;
  camera?: ViewportTransform;
  onCameraChange?: (camera: ViewportTransform) => void;
  peerCursors?: PeerCursor[];
  onCursorMove?: (worldPos: { x: number; y: number }) => void;
}

// URL Image component for asynchronously rendering uploaded / dropped images
const CanvasURLImage: React.FC<{
  element: ImageElement;
  isSelectMode: boolean;
  onClick: () => void;
  onDragEnd: (x: number, y: number) => void;
  onTransformEnd: (e: KonvaEventObject<Event>) => void;
}> = ({ element, isSelectMode, onClick, onDragEnd, onTransformEnd }) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!element.src) return;
    const img = new window.Image();
    img.src = element.src;
    img.onload = () => setImage(img);
  }, [element.src]);

  return (
    <KonvaImage
      id={element.id}
      image={image || undefined}
      x={element.x}
      y={element.y}
      width={element.width}
      height={element.height}
      rotation={element.rotation || 0}
      draggable={isSelectMode}
      onClick={onClick}
      onTap={onClick}
      onDragEnd={(e) => onDragEnd(e.target.x(), e.target.y())}
      onTransformEnd={onTransformEnd}
      stroke="#cbd5e1"
      strokeWidth={element.strokeWidth || 1}
      cornerRadius={6}
      shadowColor="rgba(0,0,0,0.12)"
      shadowBlur={8}
      shadowOffset={{ x: 2, y: 3 }}
    />
  );
};

export const CanvasStage: React.FC<CanvasStageProps> = ({
  elements,
  previewElements = [],
  onElementsChange,
  onCommitElements,
  toolbarState,
  selectedId,
  onSelectElement,
  camera: externalCamera,
  onCameraChange,
  peerCursors = [],
  onCursorMove,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });

  // Camera State: World position (x, y) and zoom scale factor
  const [internalCamera, setInternalCamera] = useState<ViewportTransform>({
    x: 0,
    y: 0,
    scale: 1,
  });
  const camera = externalCamera || internalCamera;

  const updateCamera = useCallback(
    (newCamera: ViewportTransform) => {
      if (onCameraChange) {
        onCameraChange(newCamera);
      } else {
        setInternalCamera(newCamera);
      }
    },
    [onCameraChange]
  );

  // Drawing & interaction tracking refs
  const isDrawingRef = useRef(false);
  const activeElementIdRef = useRef<string | null>(null);
  const dragStartWorldPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const transformerRef = useRef<Konva.Transformer>(null);

  // Camera panning tracking refs
  const isPanningRef = useRef(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const panStartRef = useRef<{
    pointerX: number;
    pointerY: number;
    camX: number;
    camY: number;
  }>({ pointerX: 0, pointerY: 0, camX: 0, camY: 0 });

  // Inline sticky text editor state
  const [editingElement, setEditingElement] = useState<{
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    text: string;
    fontSize?: number;
  } | null>(null);

  const isSelectMode = toolbarState.activeTool === "select";

  // Resize Stage to fill container
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

  // Keyboard listeners: Spacebar for panning, Delete/Backspace for element deletion
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

      if (e.code === "Space" && !e.repeat) {
        setIsSpacePressed(true);
      }

      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        selectedId &&
        isSelectMode
      ) {
        e.preventDefault();
        const nextElements = elements.filter((el) => el.id !== selectedId);
        onCommitElements(nextElements);
        onSelectElement(null);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsSpacePressed(false);
        isPanningRef.current = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [selectedId, isSelectMode, elements, onCommitElements, onSelectElement]);

  // Attach Transformer to the selected node
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

  // 1. Mouse Wheel: Focal-point zoom around cursor
  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = e.target.getStage();
    if (!stage) return;

    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const zoomFactor = e.evt.deltaY < 0 ? 1.1 : 0.9;
    const targetScale = clampScale(camera.scale * zoomFactor, 0.1, 5.0);
    const newCamera = calculateZoomAtPointer(pointer, camera, targetScale);
    updateCamera(newCamera);
  };

  // 2. Pointer Down: Start drawing, select, or initiate panning
  const handlePointerDown = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;

    const screenPos = stage.getPointerPosition();
    if (!screenPos) return;

    // Check if middle click or Spacebar is held -> Pan mode
    const isMiddleClick =
      "button" in e.evt && (e.evt as MouseEvent).button === 1;
    if (isSpacePressed || isMiddleClick) {
      isPanningRef.current = true;
      panStartRef.current = {
        pointerX: screenPos.x,
        pointerY: screenPos.y,
        camX: camera.x,
        camY: camera.y,
      };
      return;
    }

    const worldPos = screenToWorld(screenPos, camera);
    const isStageOrLayer =
      e.target === stage || e.target.getType() === "Layer";

    if (isStageOrLayer && isSelectMode) {
      onSelectElement(null);
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
        points: [worldPos.x, worldPos.y],
      };

      onElementsChange([...elements, newPen]);
    } else if (toolbarState.activeTool === "rectangle") {
      isDrawingRef.current = true;
      const id = `rect-${Date.now()}`;
      activeElementIdRef.current = id;
      dragStartWorldPosRef.current = { x: worldPos.x, y: worldPos.y };

      const newRect: RectElement = {
        id,
        type: "rectangle",
        color: toolbarState.activeColor,
        strokeWidth: toolbarState.strokeWidth,
        x: worldPos.x,
        y: worldPos.y,
        width: 0,
        height: 0,
        fill: `${toolbarState.activeColor}15`,
      };

      onElementsChange([...elements, newRect]);
    } else if (toolbarState.activeTool === "circle") {
      isDrawingRef.current = true;
      const id = `circle-${Date.now()}`;
      activeElementIdRef.current = id;
      dragStartWorldPosRef.current = { x: worldPos.x, y: worldPos.y };

      const newCircle: CircleElement = {
        id,
        type: "circle",
        color: toolbarState.activeColor,
        strokeWidth: toolbarState.strokeWidth,
        x: worldPos.x,
        y: worldPos.y,
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
        x: Math.round(worldPos.x - 70),
        y: Math.round(worldPos.y - 70),
        width: 140,
        height: 140,
        color: toolbarState.activeColor,
        strokeWidth: 1,
        text: "Double-click to write notes...",
        fill: randomFill,
      };

      onCommitElements([...elements, newSticky]);
    } else if (toolbarState.activeTool === "text") {
      const id = `text-${Date.now()}`;
      const newText: CanvasElement = {
        id,
        type: "text",
        x: Math.round(worldPos.x),
        y: Math.round(worldPos.y),
        color: toolbarState.activeColor,
        strokeWidth: 1,
        text: "Double-click to type text",
        fontSize: 20,
      };

      onCommitElements([...elements, newText]);
    }
  };

  // 3. Pointer Move: Update pan offset, active drawing geometry, or broadcast cursor
  const handlePointerMove = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;

    const screenPos = stage.getPointerPosition();
    if (!screenPos) return;

    // Handle viewport camera panning
    if (isPanningRef.current) {
      const dx = screenPos.x - panStartRef.current.pointerX;
      const dy = screenPos.y - panStartRef.current.pointerY;
      updateCamera({
        ...camera,
        x: panStartRef.current.camX + dx,
        y: panStartRef.current.camY + dy,
      });
      return;
    }

    const worldPos = screenToWorld(screenPos, camera);
    if (onCursorMove) {
      onCursorMove(worldPos);
    }

    if (!isDrawingRef.current || !activeElementIdRef.current) return;

    const activeId = activeElementIdRef.current;

    onElementsChange(
      elements.map((el) => {
        if (el.id !== activeId) return el;

        if (el.type === "pen") {
          return {
            ...el,
            points: [...el.points, worldPos.x, worldPos.y],
          };
        }

        if (el.type === "rectangle") {
          const startX = dragStartWorldPosRef.current.x;
          const startY = dragStartWorldPosRef.current.y;
          return {
            ...el,
            x: Math.min(startX, worldPos.x),
            y: Math.min(startY, worldPos.y),
            width: Math.abs(worldPos.x - startX),
            height: Math.abs(worldPos.y - startY),
          };
        }

        if (el.type === "circle") {
          const startX = dragStartWorldPosRef.current.x;
          const startY = dragStartWorldPosRef.current.y;
          const radius = Math.round(
            Math.hypot(worldPos.x - startX, worldPos.y - startY)
          );
          return {
            ...el,
            radius,
          };
        }

        return el;
      })
    );
  };

  // 4. Pointer Up: Finalize drawing or camera panning
  const handlePointerUp = () => {
    if (isPanningRef.current) {
      isPanningRef.current = false;
      return;
    }

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

  // 5. Element Selection & Dragging
  const handleElementClick = (elementId: string) => {
    if (toolbarState.activeTool === "eraser") {
      onCommitElements(elements.filter((el) => el.id !== elementId));
      if (selectedId === elementId) onSelectElement(null);
    } else if (isSelectMode) {
      onSelectElement(elementId);
    }
  };

  const handleDragEnd = useCallback(
    (id: string, newWorldX: number, newWorldY: number) => {
      const updated = elements.map((el) => {
        if (el.id !== id) return el;
        return {
          ...el,
          x: Math.round(newWorldX),
          y: Math.round(newWorldY),
        };
      });
      onCommitElements(updated);
    },
    [elements, onCommitElements]
  );

  // 6. Transformer Transformation Handlers
  const handleTransformEnd = (e: KonvaEventObject<Event>, id: string) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    const rotation = Math.round(node.rotation());

    node.scaleX(1);
    node.scaleY(1);

    const updated = elements.map((el) => {
      if (el.id !== id) return el;

      if (el.type === "pen") {
        return {
          ...el,
          x: Math.round(node.x()),
          y: Math.round(node.y()),
          rotation,
        };
      }

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

      if (el.type === "image") {
        return {
          ...el,
          x: Math.round(node.x()),
          y: Math.round(node.y()),
          width: Math.max(20, Math.round(node.width() * scaleX)),
          height: Math.max(20, Math.round(node.height() * scaleY)),
          rotation,
        };
      }

      return el;
    });

    onCommitElements(updated);
  };

  // 7. Inline Floating Textarea Editor Trigger
  const handleDoubleClick = (el: CanvasElement) => {
    if (el.type === "sticky") {
      setEditingElement({
        id: el.id,
        x: el.x,
        y: el.y,
        width: el.width,
        height: el.height,
        text: el.text,
      });
    } else if (el.type === "text") {
      setEditingElement({
        id: el.id,
        x: el.x,
        y: el.y,
        width: Math.max(120, el.text.length * 10),
        height: 60,
        text: el.text,
        fontSize: el.fontSize,
      });
    }
  };

  const handleCommitInlineEdit = () => {
    if (!editingElement) return;
    const updated = elements.map((item) =>
      item.id === editingElement.id
        ? ({ ...item, text: editingElement.text } as CanvasElement)
        : item
    );
    onCommitElements(updated);
    setEditingElement(null);
  };

  // 8. Drag and Drop Image File Upload Handler
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      if (!src) return;

      const rect = containerRef.current?.getBoundingClientRect();
      const screenX = rect ? e.clientX - rect.left : e.clientX;
      const screenY = rect ? e.clientY - rect.top : e.clientY;

      const worldPos = screenToWorld({ x: screenX, y: screenY }, camera);

      const newImg = createImageElement({
        x: Math.round(worldPos.x - 160),
        y: Math.round(worldPos.y - 120),
        src,
        width: 320,
        height: 240,
      });

      onCommitElements([...elements, newImg]);
    };
    reader.readAsDataURL(file);
  };

  // Compute inline editor screen space coordinates
  const inlineScreenPos = editingElement
    ? worldToScreen({ x: editingElement.x, y: editingElement.y }, camera)
    : null;

  return (
    <div
      ref={containerRef}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className={`relative h-full w-full overflow-hidden ${
        isSpacePressed ? "cursor-grab" : ""
      }`}
    >
      {/* Floating Inline HTML Textarea Editor (Replacing modal prompt) */}
      {editingElement && inlineScreenPos && (
        <textarea
          value={editingElement.text}
          autoFocus
          onChange={(e) =>
            setEditingElement({ ...editingElement, text: e.target.value })
          }
          onBlur={handleCommitInlineEdit}
          onKeyDown={(e) => {
            if (e.key === "Escape") setEditingElement(null);
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              handleCommitInlineEdit();
            }
          }}
          style={{
            position: "absolute",
            top: `${inlineScreenPos.y + 10}px`,
            left: `${inlineScreenPos.x + 10}px`,
            width: `${Math.max(100, (editingElement.width - 20) * camera.scale)}px`,
            height: `${Math.max(60, (editingElement.height - 20) * camera.scale)}px`,
            zIndex: 35,
            fontSize: `${Math.max(
              12,
              (editingElement.fontSize || 14) * camera.scale
            )}px`,
          }}
          className="rounded-lg border border-indigo-400 bg-white/95 p-2 shadow-xl outline-none ring-2 ring-indigo-300 resize-none font-sans"
        />
      )}

      {/* Main Konva 2D Stage */}
      <Stage
        width={dimensions.width}
        height={dimensions.height}
        x={camera.x}
        y={camera.y}
        scaleX={camera.scale}
        scaleY={camera.scale}
        onWheel={handleWheel}
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
                    x={el.x ?? 0}
                    y={el.y ?? 0}
                    rotation={el.rotation ?? 0}
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

              case "image":
                return (
                  <CanvasURLImage
                    key={el.id}
                    element={el}
                    isSelectMode={isSelectMode}
                    onClick={() => handleElementClick(el.id)}
                    onDragEnd={(newX, newY) => handleDragEnd(el.id, newX, newY)}
                    onTransformEnd={(e) => handleTransformEnd(e, el.id)}
                  />
                );

              default:
                return null;
            }
          })}

          {/* AI Mind Map Preview Elements Layer (65% opacity, dashed, non-interactive overlay) */}
          {previewElements.length > 0 && (
            <Group opacity={0.65} listening={false}>
              {previewElements.map((el) => {
                switch (el.type) {
                  case "pen":
                    return (
                      <Line
                        key={`preview-${el.id}`}
                        points={el.points}
                        stroke={el.color}
                        strokeWidth={el.strokeWidth}
                        dash={[6, 4]}
                        tension={0.4}
                        lineCap="round"
                        lineJoin="round"
                      />
                    );
                  case "sticky":
                    return (
                      <Group key={`preview-${el.id}`} x={el.x} y={el.y}>
                        <Rect
                          width={el.width}
                          height={el.height}
                          fill={el.fill}
                          stroke="#6366f1"
                          strokeWidth={2}
                          dash={[6, 4]}
                          shadowColor="rgba(99,102,241,0.2)"
                          shadowBlur={10}
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
                  case "rectangle":
                    return (
                      <Rect
                        key={`preview-${el.id}`}
                        x={el.x}
                        y={el.y}
                        width={el.width}
                        height={el.height}
                        fill={el.fill || "transparent"}
                        stroke={el.color || "#6366f1"}
                        strokeWidth={el.strokeWidth || 2}
                        dash={[6, 4]}
                        cornerRadius={4}
                      />
                    );
                  case "circle":
                    return (
                      <Circle
                        key={`preview-${el.id}`}
                        x={el.x}
                        y={el.y}
                        radius={el.radius}
                        fill={el.fill || "transparent"}
                        stroke={el.color || "#6366f1"}
                        strokeWidth={el.strokeWidth || 2}
                        dash={[6, 4]}
                      />
                    );
                  case "text":
                    return (
                      <Text
                        key={`preview-${el.id}`}
                        x={el.x}
                        y={el.y}
                        text={el.text}
                        fontSize={el.fontSize}
                        fontFamily="sans-serif"
                        fontStyle="bold"
                        fill={el.color}
                      />
                    );
                  default:
                    return null;
                }
              })}
            </Group>
          )}

          {/* Peer Presence Live Cursors */}
          {peerCursors.map((peer) => (
            <Group key={peer.profileId} x={peer.x} y={peer.y}>
              <Circle
                radius={4}
                fill={peer.color || "#ec4899"}
                stroke="#ffffff"
                strokeWidth={1.5}
              />
              <Rect
                x={8}
                y={-8}
                width={Math.max(60, peer.name.length * 7 + 10)}
                height={16}
                fill={peer.color || "#ec4899"}
                cornerRadius={4}
              />
              <Text
                x={12}
                y={-6}
                text={peer.name}
                fontSize={9}
                fontFamily="sans-serif"
                fontStyle="bold"
                fill="#ffffff"
              />
            </Group>
          ))}

          {/* Konva Transformer Bounding Box */}
          {isSelectMode && (
            <Transformer
              ref={transformerRef}
              boundBoxFunc={(oldBox, newBox) => {
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
