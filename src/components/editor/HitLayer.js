"use client";

import { useRef } from "react";
import { cn } from "@/lib/cn";
import { simplifyPath, toSvgPath } from "@/lib/geometry";
import { hitTest } from "@/lib/regions";
import styles from "./HitLayer.module.css";

const MIN_BRUSH_POINTS = 6;
const BRUSH_SPACING = 0.004;

export function HitLayer({ tool, polygons, customRegions, onHover, onPick, onPaint }) {
  const layerRef = useRef(null);
  const pathRef = useRef(null);
  const points = useRef([]);

  function toPoint(event) {
    const rect = layerRef.current.getBoundingClientRect();
    return [(event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height];
  }

  function regionAt(event) {
    return hitTest(toPoint(event), polygons, customRegions);
  }

  function handlePointerDown(event) {
    if (tool !== "brush" || event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    points.current = [toPoint(event)];
  }

  function handlePointerMove(event) {
    if (tool === "brush") {
      if (points.current.length === 0) return;
      points.current.push(toPoint(event));
      pathRef.current.setAttribute("d", toSvgPath(points.current));
      return;
    }
    if (event.pointerType === "mouse") onHover(regionAt(event));
  }

  function handlePointerUp() {
    if (tool !== "brush" || points.current.length === 0) return;
    const polygon = simplifyPath(points.current, BRUSH_SPACING);
    points.current = [];
    pathRef.current.removeAttribute("d");
    if (polygon.length >= MIN_BRUSH_POINTS) onPaint(polygon);
  }

  function handleClick(event) {
    if (tool !== "brush") onPick(regionAt(event));
  }

  return (
    <div
      ref={layerRef}
      aria-hidden="true"
      className={cn(styles.layer, styles[tool])}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={() => onHover(null)}
      onClick={handleClick}
    >
      <svg className={styles.trace} viewBox="0 0 100 125" preserveAspectRatio="none">
        <path ref={pathRef} />
      </svg>
    </div>
  );
}
