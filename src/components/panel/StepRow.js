"use client";

import { Reorder, useDragControls } from "motion/react";
import { ChevronDown, Eye, EyeOff, GripVertical, SquareDashed } from "lucide-react";
import { Menu } from "@/components/ui/Menu";
import { cn } from "@/lib/cn";
import { StrengthSlider } from "./StrengthSlider";

const MODELS = [
  { value: "edit-2", label: "Fomi Edit 2", detail: "General edits" },
  { value: "materials", label: "Fomi Materials", detail: "Surfaces and textures" },
  { value: "relight", label: "Fomi Relight", detail: "Light and shadow" },
];

function strengthLabel(step) {
  return step.showStrengthAs ?? `${Math.round(step.strength * 100)}%`;
}

export function StepRow({
  step,
  number,
  regionName,
  active,
  processing,
  disabled,
  onActivate,
  onToggle,
  onPreview,
  onCommit,
  onModelChange,
  onMove,
  onDragEnd,
}) {
  const dragControls = useDragControls();
  const modelItems = [{ value: "auto", label: step.modelHint, detail: "Picked for this kind of edit" }, ...MODELS];
  const modelLabel = modelItems.find((item) => item.value === step.model)?.label ?? step.modelHint;

  function handleKeyDown(event) {
    if (!event.altKey || !["ArrowUp", "ArrowDown"].includes(event.key)) return;
    event.preventDefault();
    onMove(event.key === "ArrowUp" ? -1 : 1);
  }

  return (
    <Reorder.Item
      as="li"
      value={step.id}
      dragListener={false}
      dragControls={dragControls}
      onDragEnd={onDragEnd}
      aria-label={`Step ${number}: ${step.title}`}
      onKeyDown={handleKeyDown}
      className={cn(
        "group relative -mx-2.5 grid grid-cols-[22px_1fr_auto] items-start gap-x-2.5 rounded-field p-2.5 transition-[background-color,box-shadow] duration-200",
        active ? "bg-white shadow-row" : "bg-panel hover:bg-white/60",
      )}
    >
      {!disabled && (
        <span
          aria-hidden="true"
          onPointerDown={(event) => dragControls.start(event)}
          className="absolute top-3 -left-4 grid h-5 w-3.5 cursor-grab touch-none place-items-center text-muted opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing pointer-coarse:hidden"
        >
          <GripVertical size={14} strokeWidth={2} />
        </span>
      )}
      <button
        type="button"
        aria-pressed={step.visible}
        aria-label={`${step.visible ? "Hide" : "Show"} step ${number}`}
        disabled={disabled}
        onClick={onToggle}
        className="-mt-1 -ml-1.5 grid size-7.5 place-items-center rounded-control text-ink-2 transition-colors hover:bg-ink/6 hover:text-ink aria-[pressed=false]:text-muted disabled:cursor-not-allowed disabled:opacity-50 pointer-coarse:size-11"
      >
        {step.visible ? (
          <Eye aria-hidden="true" size={18} strokeWidth={1.9} />
        ) : (
          <EyeOff aria-hidden="true" size={18} strokeWidth={1.9} />
        )}
      </button>

      <div className="min-w-0">
        <button
          type="button"
          aria-expanded={active}
          aria-keyshortcuts="Alt+ArrowUp Alt+ArrowDown"
          onClick={onActivate}
          className={cn(
            "block w-full text-left text-base font-semibold hover:underline hover:decoration-line hover:underline-offset-4",
            !step.visible && "text-muted",
          )}
        >
          {step.title}
        </button>
        <span
          className={cn(
            "mt-0.75 inline-flex items-center gap-1.25 text-caption",
            active ? "font-semibold text-marker" : "text-muted",
          )}
        >
          <SquareDashed aria-hidden="true" size={11} strokeWidth={2.4} />
          {processing ? "Updating…" : regionName}
        </span>

        {active && (
          <div className="mt-2.5">
            <p className="rounded-control bg-field px-2.5 py-2 text-sm text-ink-2">{step.instruction}</p>
            {step.showStrengthAs ? (
              <p className="mt-3 flex justify-between text-caption text-ink-2">
                Strength<span className="font-semibold text-ink">{step.showStrengthAs}</span>
              </p>
            ) : (
              <StrengthSlider
                value={step.strength}
                disabled={disabled || !step.visible}
                onPreview={onPreview}
                onCommit={onCommit}
                className="mt-3"
              />
            )}
            <div className="mt-2.5 flex items-center justify-between text-caption text-muted">
              Model
              <Menu
                label="Model"
                items={modelItems}
                value={step.model}
                onSelect={onModelChange}
                placement="bottom-end"
                renderTrigger={(props) => (
                  <button
                    type="button"
                    {...props}
                    className="-mr-1.5 inline-flex h-7 items-center gap-1 rounded-control px-1.5 font-medium text-ink-2 hover:bg-ink/5 hover:text-ink pointer-coarse:h-11"
                  >
                    {modelLabel}
                    <ChevronDown aria-hidden="true" size={11} strokeWidth={2.6} />
                  </button>
                )}
              />
            </div>
          </div>
        )}
      </div>

      <span className={cn("pt-px text-sm", step.visible ? "text-ink-2" : "text-muted")}>{strengthLabel(step)}</span>
    </Reorder.Item>
  );
}
