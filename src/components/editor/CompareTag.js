"use client";

import { ChevronDown } from "lucide-react";
import { Menu } from "@/components/ui/Menu";
import { compareTargetLabel } from "@/lib/variants";

const tagClasses =
  "flex h-7 items-center gap-1.5 rounded-control bg-white/92 px-2.5 text-caption font-semibold text-ink shadow-chip pointer-coarse:h-9";

export function CompareTag({ side, upTo, stepCount, onChange }) {
  const items = Array.from({ length: stepCount + 1 }, (_, index) => ({
    value: index,
    label: compareTargetLabel(index),
  }));

  return (
    <Menu
      label={`${side === "left" ? "Left" : "Right"} side of the comparison`}
      items={items}
      value={upTo}
      onSelect={onChange}
      placement={side === "left" ? "bottom-end" : "bottom-start"}
      renderTrigger={(props) => (
        <button type="button" {...props} className={`${tagClasses} hover:bg-white`}>
          {compareTargetLabel(upTo)}
          <ChevronDown aria-hidden="true" size={12} strokeWidth={2.6} className="text-ink-2" />
        </button>
      )}
    />
  );
}

export function StaticTag({ children }) {
  return <span className={tagClasses}>{children}</span>;
}
