import { cn } from "@/lib/cn";

const variants = {
  soft: {
    root: "rounded-field bg-segment p-0.75 gap-0.5",
    item: "h-7.5 rounded-control px-4 text-ui font-medium text-ink-2 hover:text-ink aria-pressed:bg-white aria-pressed:text-ink aria-pressed:shadow-segment",
  },
  solid: {
    root: "rounded-field border border-control bg-white/70 p-0.75 gap-0.5",
    item: "h-7 rounded-chip px-2.5 text-sm font-semibold text-ink-2 hover:bg-ink/5 hover:text-ink aria-pressed:bg-ink aria-pressed:text-white",
  },
};

export function Segmented({ label, caption, captionClassName, options, value, onChange, variant = "solid", className }) {
  const styles = variants[variant];

  return (
    <div role="group" aria-label={label} className={cn("inline-flex items-center", styles.root, className)}>
      {caption && <span className={cn("pr-2 pl-1.5 text-caption text-muted", captionClassName)}>{caption}</span>}
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
          className={cn(
            "flex items-center gap-1.5 whitespace-nowrap transition-[background-color,color,box-shadow] duration-150 pointer-coarse:min-h-11",
            styles.item,
          )}
        >
          {option.label}
          {option.count !== undefined && <span className="font-medium opacity-70">{option.count}</span>}
        </button>
      ))}
    </div>
  );
}
