import { cn } from "@/lib/cn";

export function PanelFooter({ note, className, children }) {
  return (
    <div className={cn("mt-auto border-t border-line bg-panel px-5 pt-4 pb-5", className)}>
      {note && <p className="mb-3 text-ui text-ink-2">{note}</p>}
      {children}
    </div>
  );
}
