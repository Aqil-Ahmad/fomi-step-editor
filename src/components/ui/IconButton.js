import { cn } from "@/lib/cn";
import { Tooltip } from "./Tooltip";

const sizes = {
  sm: "size-7.5 rounded-control",
  md: "h-8.5 min-w-8.5 rounded-control px-2",
};

export function IconButton({
  label,
  shortcut,
  tooltipSide,
  size = "sm",
  pressed,
  className,
  children,
  type = "button",
  ...props
}) {
  return (
    <Tooltip label={label} shortcut={shortcut} side={tooltipSide}>
      <button
        type={type}
        aria-label={label}
        aria-pressed={pressed}
        className={cn(
          "inline-flex items-center justify-center gap-2 text-sm font-semibold text-ink-2 transition-[background-color,color,scale] duration-150 hover:bg-ink/6 hover:text-ink active:scale-96 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent aria-pressed:bg-ink aria-pressed:text-white pointer-coarse:min-h-11 pointer-coarse:min-w-11",
          sizes[size],
          className,
        )}
        {...props}
      >
        {children}
      </button>
    </Tooltip>
  );
}
