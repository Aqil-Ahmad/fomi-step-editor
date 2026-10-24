"use client";

import { useLayoutEffect, useRef } from "react";
import { readStored, writeStored } from "@/lib/storage";

const STORAGE_KEY = "compare-position";
const CENTER = 50;

function clamp(value) {
  return Math.min(100, Math.max(0, value));
}

export function useCompareDrag(frameRef, defaultPosition) {
  const handleRef = useRef(null);
  const position = useRef(null);

  function apply(value) {
    position.current = clamp(value);
    const rounded = Math.round(position.current);
    frameRef.current?.style.setProperty("--pos", `${position.current}%`);
    handleRef.current?.setAttribute("aria-valuenow", String(rounded));
    handleRef.current?.setAttribute("aria-valuetext", `${rounded}% original`);
  }

  function persist() {
    writeStored(STORAGE_KEY, position.current);
  }

  useLayoutEffect(() => {
    if (position.current === null) position.current = readStored(STORAGE_KEY, defaultPosition);
    apply(position.current);
  });

  function onPointerDown(event) {
    if (event.button !== 0) return;
    event.preventDefault();
    const handle = event.currentTarget;
    const rect = frameRef.current.getBoundingClientRect();
    handle.setPointerCapture(event.pointerId);
    handle.focus({ preventScroll: true });

    function move(moveEvent) {
      apply(((moveEvent.clientX - rect.left) / rect.width) * 100);
    }

    function end() {
      handle.removeEventListener("pointermove", move);
      handle.removeEventListener("pointerup", end);
      handle.removeEventListener("pointercancel", end);
      persist();
    }

    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", end);
    handle.addEventListener("pointercancel", end);
  }

  function onKeyDown(event) {
    const step = event.shiftKey ? 10 : 2;
    const targets = {
      ArrowLeft: position.current - step,
      ArrowDown: position.current - step,
      ArrowRight: position.current + step,
      ArrowUp: position.current + step,
      Home: 0,
      End: 100,
    };
    if (!(event.key in targets)) return;
    event.preventDefault();
    event.stopPropagation();
    apply(targets[event.key]);
    persist();
  }

  function onDoubleClick() {
    apply(CENTER);
    persist();
  }

  return { handleRef, onPointerDown, onKeyDown, onDoubleClick };
}
