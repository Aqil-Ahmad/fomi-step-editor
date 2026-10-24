"use client";

import { useEffect, useEffectEvent } from "react";

function isTyping(target) {
  return target instanceof Element && Boolean(target.closest("input, textarea, select, [contenteditable='true']"));
}

export function useShortcuts(handlers) {
  const handleKeyDown = useEffectEvent((event) => {
    if (event.defaultPrevented || isTyping(event.target)) return;

    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
      const handler = event.shiftKey ? handlers.redo : handlers.undo;
      if (!handler) return;
      event.preventDefault();
      handler();
      return;
    }

    if (event.metaKey || event.ctrlKey || event.altKey) return;
    const handler = handlers[event.key] ?? handlers[event.key.toLowerCase()];
    if (!handler) return;
    event.preventDefault();
    handler(event);
  });

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}
