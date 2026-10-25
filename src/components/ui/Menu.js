"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

const placements = {
  "bottom-start": "top-full left-0 mt-1.5 origin-top-left",
  "bottom-end": "top-full right-0 mt-1.5 origin-top-right",
  "top-start": "bottom-full left-0 mb-1.5 origin-bottom-left",
};

function nextEnabled(items, from, step) {
  for (let i = 1; i <= items.length; i++) {
    const index = (from + step * i + items.length) % items.length;
    if (!items[index].disabled) return index;
  }
  return from;
}

export function Menu({ label, items, value, onSelect, placement = "bottom-start", renderTrigger, className }) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const listRef = useRef(null);
  const menuId = useId();
  const selectable = value !== undefined;

  useEffect(() => {
    if (!open) return;
    listRef.current?.focus();

    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  function openMenu() {
    const selected = items.findIndex((item) => item.value === value && !item.disabled);
    setActiveIndex(selected >= 0 ? selected : nextEnabled(items, -1, 1));
    setOpen(true);
  }

  function close({ restoreFocus = true } = {}) {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  }

  function choose(item) {
    if (item.disabled) return;
    onSelect(item.value);
    close();
  }

  function handleTriggerKeyDown(event) {
    if (["ArrowDown", "ArrowUp"].includes(event.key)) {
      event.preventDefault();
      openMenu();
    }
  }

  function handleListKeyDown(event) {
    const keyActions = {
      ArrowDown: () => setActiveIndex((index) => nextEnabled(items, index, 1)),
      ArrowUp: () => setActiveIndex((index) => nextEnabled(items, index, -1)),
      Home: () => setActiveIndex(nextEnabled(items, -1, 1)),
      End: () => setActiveIndex(nextEnabled(items, items.length, -1)),
      Enter: () => choose(items[activeIndex]),
      " ": () => choose(items[activeIndex]),
      Escape: () => close(),
    };

    if (event.key === "Tab") {
      close({ restoreFocus: false });
      return;
    }
    const action = keyActions[event.key];
    if (!action) return;
    event.preventDefault();
    event.stopPropagation();
    action();
  }

  return (
    <div ref={rootRef} className={cn("relative inline-flex", className)}>
      {renderTrigger({
        ref: triggerRef,
        "aria-haspopup": "menu",
        "aria-expanded": open,
        "aria-controls": open ? menuId : undefined,
        onClick: () => (open ? close() : openMenu()),
        onKeyDown: handleTriggerKeyDown,
      })}
      <AnimatePresence>
        {open && (
          <motion.ul
            ref={listRef}
            id={menuId}
            role="menu"
            aria-label={label}
            tabIndex={-1}
            aria-activedescendant={`${menuId}-${activeIndex}`}
            onKeyDown={handleListKeyDown}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1, transition: { duration: 0.18, ease: [0.2, 0.8, 0.2, 1] } }}
            exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.12, ease: [0.4, 0, 1, 1] } }}
            className={cn(
              "absolute z-30 min-w-48 rounded-field border border-edge bg-white p-1 shadow-float outline-none",
              placements[placement],
            )}
          >
            {items.map((item, index) => (
              <li
                key={item.value}
                id={`${menuId}-${index}`}
                role={selectable ? "menuitemradio" : "menuitem"}
                aria-checked={selectable ? item.value === value : undefined}
                aria-disabled={item.disabled || undefined}
                onPointerMove={() => !item.disabled && setActiveIndex(index)}
                onClick={() => choose(item)}
                className={cn(
                  "flex min-h-8 items-center gap-2 rounded-control px-2.5 py-1.5 text-ui font-medium text-ink select-none pointer-coarse:min-h-11",
                  index === activeIndex && "bg-chip",
                  item.disabled ? "cursor-not-allowed text-muted" : "cursor-pointer",
                )}
              >
                <span className="flex-1">
                  {item.label}
                  {item.detail && <span className="block text-caption font-regular text-muted">{item.detail}</span>}
                </span>
                {selectable && item.value === value && <Check aria-hidden="true" size={14} strokeWidth={2.6} />}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
