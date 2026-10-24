import { Brush, Columns2, Lock, MousePointer2, Redo2, Undo2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { IconButton } from "@/components/ui/IconButton";

const TOOLS = [
  { id: "brush", label: "Brush", shortcut: "B", Icon: Brush },
  { id: "lock", label: "Lock an area", shortcut: "L", Icon: Lock },
];

function Separator() {
  return <span aria-hidden="true" className="mx-1.25 h-5 w-px bg-line" />;
}

export function ToolPalette({ tool, compareOn, zoom, canUndo, canRedo, dispatch, className }) {
  const isSelect = tool === "select";

  return (
    <div
      role="toolbar"
      aria-label="Canvas tools"
      className={cn(
        "flex items-center gap-0.5 rounded-palette border border-edge bg-white p-1.25 shadow-palette",
        className,
      )}
    >
      <IconButton
        label="Select"
        shortcut="V"
        size="md"
        pressed={isSelect}
        onClick={() => dispatch({ type: "tool/set", tool: "select" })}
        className="w-auto px-2.25"
      >
        <MousePointer2 aria-hidden="true" size={16} strokeWidth={2.2} />
        <span aria-hidden="true" className="max-sm:hidden">
          Select
        </span>
      </IconButton>
      {TOOLS.map(({ id, label, shortcut, Icon }) => (
        <IconButton
          key={id}
          label={label}
          shortcut={shortcut}
          size="md"
          pressed={tool === id}
          onClick={() => dispatch({ type: "tool/set", tool: tool === id ? "select" : id })}
        >
          <Icon aria-hidden="true" size={17} strokeWidth={2} />
        </IconButton>
      ))}
      <IconButton
        label="Compare"
        shortcut="C"
        size="md"
        pressed={compareOn}
        onClick={() => dispatch({ type: "compare/toggle" })}
      >
        <Columns2 aria-hidden="true" size={17} strokeWidth={2} />
      </IconButton>
      <Separator />
      <output aria-label="Zoom" className="flex h-8.5 min-w-11 items-center justify-center text-sm font-semibold text-ink-2">
        {zoom}%
      </output>
      <Separator />
      <IconButton
        label="Undo"
        shortcut="⌘Z"
        size="md"
        disabled={!canUndo}
        onClick={() => dispatch({ type: "history/undo" })}
      >
        <Undo2 aria-hidden="true" size={17} strokeWidth={2} />
      </IconButton>
      <IconButton
        label="Redo"
        shortcut="⇧⌘Z"
        size="md"
        disabled={!canRedo}
        onClick={() => dispatch({ type: "history/redo" })}
      >
        <Redo2 aria-hidden="true" size={17} strokeWidth={2} />
      </IconButton>
    </div>
  );
}
