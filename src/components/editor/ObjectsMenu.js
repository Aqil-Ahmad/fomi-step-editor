"use client";

import { ChevronDown } from "lucide-react";
import { Menu } from "@/components/ui/Menu";
import { contentLockFor } from "@/state/editorReducer";

export function ObjectsMenu({ objects, locks, tool, onPick }) {
  const items = objects.map((object) => ({
    value: object.id,
    label: contentLockFor(locks, object.id) ? `${object.label} (locked)` : object.label,
  }));

  return (
    <Menu
      label={tool === "lock" ? "Pick an object to lock" : "Pick an object to edit"}
      items={items}
      onSelect={onPick}
      renderTrigger={(props) => (
        <button
          type="button"
          {...props}
          className="inline-flex h-7 items-center gap-1 rounded-control px-2 text-caption font-semibold text-ink-2 hover:bg-ink/5 hover:text-ink pointer-coarse:h-11"
        >
          Objects
          <ChevronDown aria-hidden="true" size={12} strokeWidth={2.6} />
        </button>
      )}
    />
  );
}
