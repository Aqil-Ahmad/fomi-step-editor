import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

export function Checkbox({ label, detail, checked, onChange, className }) {
  return (
    <label className={cn("flex min-h-7 cursor-pointer items-center gap-2.5 text-ui pointer-coarse:min-h-11", className)}>
      <span className="relative grid size-4.5 shrink-0 place-items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="peer size-full cursor-pointer appearance-none rounded-tiny border-[1.5px] border-input bg-white transition-colors duration-150 checked:border-ink checked:bg-ink"
        />
        <Check
          aria-hidden="true"
          size={11}
          strokeWidth={3.6}
          className="pointer-events-none absolute text-white opacity-0 peer-checked:opacity-100"
        />
      </span>
      <span className="flex-1">{label}</span>
      {detail && <span className="text-caption text-muted">{detail}</span>}
    </label>
  );
}
