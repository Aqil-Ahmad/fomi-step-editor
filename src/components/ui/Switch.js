import { cn } from "@/lib/cn";

export function Switch({ label, checked, onChange, className }) {
  return (
    <label className={cn("flex min-h-7 cursor-pointer items-center gap-2.5 text-ui pointer-coarse:min-h-11", className)}>
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="relative h-5 w-8.5 shrink-0 cursor-pointer appearance-none rounded-full bg-input transition-colors duration-150 before:absolute before:top-0.75 before:left-0.75 before:size-3.5 before:rounded-full before:bg-white before:transition-transform before:duration-150 checked:bg-ink checked:before:translate-x-3.5"
      />
      {label}
    </label>
  );
}
