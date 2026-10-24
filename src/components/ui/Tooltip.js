import { cn } from "@/lib/cn";
import { Kbd } from "./Kbd";

const sides = {
  top: "bottom-full left-1/2 mb-2 -translate-x-1/2",
  bottom: "top-full left-1/2 mt-2 -translate-x-1/2",
  left: "right-full top-1/2 mr-2 -translate-y-1/2",
};

export function Tooltip({ label, shortcut, side = "top", className, children }) {
  return (
    <span className={cn("group/tip relative inline-flex", className)}>
      {children}
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute z-40 flex items-center gap-2 rounded-control bg-ink px-2 py-1 text-xs font-semibold whitespace-nowrap text-white opacity-0 transition-opacity delay-0 duration-150 group-hover/tip:opacity-100 group-hover/tip:delay-300 group-has-focus-visible/tip:opacity-100 pointer-coarse:hidden",
          sides[side],
        )}
      >
        {label}
        {shortcut && <Kbd tone="dark">{shortcut}</Kbd>}
      </span>
    </span>
  );
}
