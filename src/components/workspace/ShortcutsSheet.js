"use client";

import { Kbd } from "@/components/ui/Kbd";
import { Sheet } from "@/components/ui/Sheet";

const SHORTCUTS = [
  { keys: ["V"], action: "Select" },
  { keys: ["B"], action: "Brush" },
  { keys: ["L"], action: "Lock an area" },
  { keys: ["C"], action: "Compare on or off" },
  { keys: ["1", "9"], action: "Jump to a step", range: true },
  { keys: ["[", "]"], action: "Strength down or up" },
  { keys: ["⌘", "Z"], action: "Undo" },
  { keys: ["⇧", "⌘", "Z"], action: "Redo" },
  { keys: ["Alt", "↑"], action: "Move a focused step" },
  { keys: ["E"], action: "Switch Edit and Shoot" },
  { keys: ["Esc"], action: "Close or deselect" },
  { keys: ["?"], action: "Show shortcuts" },
];

export default function ShortcutsSheet({ open, onClose }) {
  return (
    <Sheet side="center" title="Keyboard shortcuts" open={open} onClose={onClose}>
      <dl className="divide-y divide-line-2 px-5 py-2">
        {SHORTCUTS.map(({ keys, action, range }) => (
          <div key={action} className="flex items-center justify-between gap-4 py-2.5 text-ui">
            <dt>{action}</dt>
            <dd className="flex items-center gap-1 text-caption text-muted">
              {keys.map((key, index) => (
                <span key={key} className="flex items-center gap-1">
                  {index > 0 && range && "to"}
                  <Kbd>{key}</Kbd>
                </span>
              ))}
            </dd>
          </div>
        ))}
      </dl>
    </Sheet>
  );
}
