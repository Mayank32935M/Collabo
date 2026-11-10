/**
 * COLLABO — Infinite Canvas Camera & Coordinate Transformation Engine
 * Provides pure mathematical helpers for converting between screen space
 * (DOM client pixels) and infinite whiteboard world space, along with
 * focal-point zooming around pointer positions.
 */

import { ViewportTransform } from "@collabo/shared";

/**
 * Maps screen coordinates (DOM pointer position) to infinite world coordinates.
 *
 * Formula:
 * xWorld = (xScreen - camera.x) / camera.scale
 * yWorld = (yScreen - camera.y) / camera.scale
 */
export function screenToWorld(
  screenPos: { x: number; y: number },
  camera: ViewportTransform
): { x: number; y: number } {
  const scale = camera.scale || 1;
  return {
    x: (screenPos.x - camera.x) / scale,
    y: (screenPos.y - camera.y) / scale,
  };
}

/**
 * Maps infinite world coordinates to screen space (DOM client pixels).
 *
 * Formula:
 * xScreen = xWorld * camera.scale + camera.x
 * yScreen = yWorld * camera.scale + camera.y
 */
export function worldToScreen(
  worldPos: { x: number; y: number },
  camera: ViewportTransform
): { x: number; y: number } {
  const scale = camera.scale || 1;
  return {
    x: worldPos.x * scale + camera.x,
    y: worldPos.y * scale + camera.y,
  };
}

/**
 * Clamps scale factor within acceptable boundaries (e.g., 0.1x to 5.0x).
 */
export function clampScale(
  scale: number,
  minScale = 0.1,
  maxScale = 5.0
): number {
  return Math.min(Math.max(scale, minScale), maxScale);
}

/**
 * Calculates updated camera position when zooming so the point currently
 * under the pointer remains stationary in screen space (focal point zooming).
 *
 * Mathematical derivation:
 * Before zoom: pointerWorld = (pointerScreen - camera.x) / oldScale
 * After zoom:  pointerScreen = pointerWorld * newScale + newCamera.x
 * => newCamera.x = pointerScreen - pointerWorld * newScale
 */
export function calculateZoomAtPointer(
  pointerScreen: { x: number; y: number },
  currentCamera: ViewportTransform,
  targetScale: number,
  minScale = 0.1,
  maxScale = 5.0
): ViewportTransform {
  const newScale = clampScale(targetScale, minScale, maxScale);
  const pointerWorld = screenToWorld(pointerScreen, currentCamera);

  return {
    scale: newScale,
    x: pointerScreen.x - pointerWorld.x * newScale,
    y: pointerScreen.y - pointerWorld.y * newScale,
  };
}

