"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { ChecksPanel } from "@/components/panel/ChecksPanel";
import { LocksPanel } from "@/components/panel/LocksPanel";
import { PanelFooter } from "@/components/panel/PanelFooter";
import { StepsPanel } from "@/components/panel/StepsPanel";
import { photoDisplay } from "@/lib/shoot";
import { useEditorState, useWorkspace } from "@/state/WorkspaceProvider";
import { Canvas } from "./Canvas";
import { Filmstrip } from "./Filmstrip";

export function EditView({ photoId, statuses, onOpenPhoto, onApply }) {
  const { project, actions } = useWorkspace();
  const state = useEditorState();
  const toast = useToast();
  const [highlightRegion, setHighlightRegion] = useState(null);

  const photo = project.photos.find((item) => item.id === photoId);
  const reference = project.photos.find((item) => item.id === project.referencePhotoId);
  const isReference = photo.id === reference.id;
  const displayFor = (item) => photoDisplay(item, statuses[item.id], project.applyPlan);
  const otherPhotos = project.photos.length - 1;

  function saveLook() {
    toast({
      title: `${project.look.name} saved`,
      description: `${state.doc.steps.length} steps and ${state.doc.locks.length} locks, ready for any shoot.`,
    });
  }

  return (
    <div className="grid min-h-0 grid-cols-[120px_minmax(0,1fr)_376px]">
      <Filmstrip photos={project.photos} currentId={photo.id} displayFor={displayFor} onOpen={onOpenPhoto} />

      <Canvas photo={photo} display={displayFor(photo)} isReference={isReference} highlightRegion={highlightRegion} />

      <aside aria-label="Steps, locks and checks" className="flex min-h-0 flex-col border-l border-line bg-panel">
        <div className="min-h-0 flex-1 divide-y divide-line-2 overflow-y-auto">
          <StepsPanel
            isReference={isReference}
            referenceNumber={reference.n}
            onOpenReference={() => onOpenPhoto(reference.id)}
          />
          <LocksPanel onHighlight={setHighlightRegion} />
          <ChecksPanel
            title={`Checks after step ${state.checks.afterStep}`}
            checks={state.checks}
            emptyText="Lock something to check it after every step."
            onRetry={actions.rerunChecks}
          />
        </div>
        <PanelFooter note="Run the same steps and checks on the rest of the shoot.">
          <div className="grid grid-cols-[auto_1fr] gap-2.5">
            <Button variant="line" size="lg" onClick={saveLook}>
              Save as look
            </Button>
            <Button variant="ink" size="lg" onClick={onApply}>
              Apply to {otherPhotos} photos
            </Button>
          </div>
        </PanelFooter>
      </aside>
    </div>
  );
}
