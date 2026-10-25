"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Switch } from "@/components/ui/Switch";
import { PanelFooter } from "@/components/panel/PanelFooter";
import { PanelSection } from "@/components/panel/PanelSection";
import { cn } from "@/lib/cn";
import { CountUp } from "./CountUp";

function exportNote({ driftPhotos, inProgress, waiting, onlyPassing }) {
  if (driftPhotos.length > 0 && onlyPassing) {
    const numbers = driftPhotos.map((photo) => photo.n);
    return numbers.length === 1
      ? `Photo ${numbers[0]} is added to the export as soon as it passes.`
      : `Photos ${numbers.join(", ")} are added to the export as soon as they pass.`;
  }
  if (inProgress > 0) return "Photos still applying are added when they finish.";
  if (waiting > 0) return "Apply the look to add the rest of the shoot.";
  return "Every photo is ready to export.";
}

export function ShootPanel({ look, steps, summary, driftPhotos, exportSizes, shootState, dispatch, onEditLook, onExport }) {
  const selectedSizes = exportSizes.filter((size) => shootState.sizes[size.id]);
  const photoCount = shootState.onlyPassing ? summary.ready : summary.ready + summary.drift;
  const canExport = photoCount > 0 && selectedSizes.length > 0;

  return (
    <aside aria-label="Look, checks and export" className="flex flex-col border-line bg-panel max-lg:border-t lg:min-h-0 lg:border-l">
      <div className="flex-1 divide-y divide-line-2 lg:min-h-0 lg:overflow-y-auto">
        <PanelSection
          title={look.name}
          count={`${steps.length} steps`}
          action={
            <Button variant="ghost" onClick={onEditLook} className="h-7.5 px-1.5">
              Edit look
            </Button>
          }
        >
          <ol className="mt-0.5">
            {steps.map((step, index) => (
              <li key={step.id} className="flex gap-2.5 py-1.5 text-ui">
                <span className="grid size-5 shrink-0 place-items-center rounded-md bg-segment text-2xs font-bold text-ink-2">
                  {index + 1}
                </span>
                <span className={cn(!step.visible && "text-muted line-through")}>{step.title}</span>
              </li>
            ))}
          </ol>
        </PanelSection>

        <PanelSection title={`Checks on ${summary.checkedCount} photos`}>
          {summary.checkedCount === 0 ? (
            <p className="py-2 text-sm text-muted">Checks run on each photo as the look is applied.</p>
          ) : (
            <ul className="divide-y divide-line-2">
              {summary.checks.map((check) => {
                const failing = check.passing < check.total;
                return (
                  <li key={check.id} className="flex items-center gap-2.5 py-2.25 text-ui">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "grid size-5 shrink-0 place-items-center rounded-full",
                        failing ? "bg-drift-bg text-xs font-black text-drift-ink" : "text-pass",
                      )}
                    >
                      {failing ? "!" : <Check size={12} strokeWidth={3.4} />}
                    </span>
                    <span className="flex-1">{check.title}</span>
                    <span className={cn("text-sm font-semibold", failing && "text-drift-ink")}>
                      <CountUp value={check.passing} /> of <CountUp value={check.total} />
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </PanelSection>

        <PanelSection title="Export sizes">
          <div className="mt-1 grid gap-1">
            {exportSizes.map((size) => (
              <Checkbox
                key={size.id}
                label={size.label}
                detail={size.pixels}
                checked={shootState.sizes[size.id]}
                onChange={(checked) => dispatch({ type: "size/toggle", sizeId: size.id, checked })}
              />
            ))}
          </div>
          <Switch
            label="Only export photos that pass every check"
            checked={shootState.onlyPassing}
            onChange={(value) => dispatch({ type: "export/onlyPassing", value })}
            className="mt-3.5 border-t border-line-2 pt-3"
          />
        </PanelSection>
      </div>

      <PanelFooter
        className="max-lg:sticky max-lg:bottom-0"
        note={exportNote({
          driftPhotos,
          inProgress: summary.inProgress,
          waiting: summary.waiting,
          onlyPassing: shootState.onlyPassing,
        })}
      >
        <Button
          variant="ink"
          size="lg"
          disabled={!canExport}
          onClick={() => onExport(selectedSizes.map((size) => size.id))}
          className="w-full"
        >
          <span>
            Export <CountUp value={photoCount} /> {photoCount === 1 ? "photo" : "photos"} in {selectedSizes.length}{" "}
            {selectedSizes.length === 1 ? "size" : "sizes"}
          </span>
        </Button>
      </PanelFooter>
    </aside>
  );
}
