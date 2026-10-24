"use client";

import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { evaluateChecks } from "@/lib/checks";
import { cn } from "@/lib/cn";
import { isInProgress } from "@/lib/shoot";
import { useEditorState, useWorkspace } from "@/state/WorkspaceProvider";
import { ChecksPanel } from "./ChecksPanel";
import { LocksPanel } from "./LocksPanel";
import { PanelFooter } from "./PanelFooter";
import { StepsPanel } from "./StepsPanel";

const ALL_SECTIONS = ["steps", "locks", "checks"];

function photoChecks(project, locks, photo, entry) {
  const status = entry?.status ?? "original";
  if (status === "original") return { status: "done", results: [], runId: photo.id };
  const result = status === "drift" ? project.applyPlan.photos[photo.id] : null;
  return {
    status: isInProgress(status) ? "running" : "done",
    results: evaluateChecks(project.checks, locks, result),
    runId: `${photo.id}:${status}`,
  };
}

export function EditPanel({
  photo,
  reference,
  shoot,
  sections = ALL_SECTIONS,
  showFooter = true,
  onOpenPhoto,
  onApply,
  onHighlight,
  className,
}) {
  const { project, actions } = useWorkspace();
  const state = useEditorState();
  const toast = useToast();
  const isReference = photo.id === reference.id;
  const { statuses, fixing } = shoot.state;

  function saveLook() {
    toast({
      title: `${project.look.name} saved`,
      description: `${state.doc.steps.length} steps and ${state.doc.locks.length} locks, ready for any shoot.`,
    });
  }

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      <div className="min-h-0 flex-1 divide-y divide-line-2 overflow-y-auto">
        {sections.includes("steps") && (
          <StepsPanel
            isReference={isReference}
            referenceNumber={reference.n}
            onOpenReference={() => onOpenPhoto(reference.id)}
          />
        )}
        {sections.includes("locks") && <LocksPanel onHighlight={onHighlight} />}
        {sections.includes("checks") &&
          (isReference ? (
            <ChecksPanel
              title={`Checks after step ${state.checks.afterStep}`}
              checks={state.checks}
              emptyText="Lock something to check it after every step."
              onRetry={actions.rerunChecks}
            />
          ) : (
            <ChecksPanel
              title={`Checks on photo ${photo.n}`}
              checks={photoChecks(project, state.doc.locks, photo, statuses[photo.id])}
              emptyText="Checks run when the look is applied to this photo."
              fixing={fixing?.photoId === photo.id}
              onFix={() => shoot.fixPhoto(photo.id, "restore")}
            />
          ))}
      </div>
      {showFooter && (
        <PanelFooter note="Run the same steps and checks on the rest of the shoot.">
          <div className="grid grid-cols-[auto_1fr] gap-2.5">
            <Button variant="line" size="lg" onClick={saveLook}>
              Save as look
            </Button>
            <Button variant="ink" size="lg" onClick={onApply}>
              Apply to {project.photos.length - 1} photos
            </Button>
          </div>
        </PanelFooter>
      )}
    </div>
  );
}
