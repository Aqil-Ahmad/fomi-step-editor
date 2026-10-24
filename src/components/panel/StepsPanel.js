"use client";

import { useState } from "react";
import { Reorder } from "motion/react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { regionLabel } from "@/lib/regions";
import { useEditorState, useWorkspace } from "@/state/WorkspaceProvider";
import { PanelSection } from "./PanelSection";
import { StepRow } from "./StepRow";

export function StepsPanel({ isReference, referenceNumber, onOpenReference }) {
  const { project, dispatch, actions } = useWorkspace();
  const state = useEditorState();
  const { steps, regions } = state.doc;
  const [dragOrder, setDragOrder] = useState(null);
  const order = dragOrder ?? steps.map((step) => step.id);
  const byId = new Map(steps.map((step) => [step.id, step]));

  function finishDrag() {
    if (dragOrder) dispatch({ type: "step/reorder", stepIds: dragOrder });
    setDragOrder(null);
  }

  return (
    <PanelSection
      title="Edit steps"
      count={steps.length}
      labelId="steps-heading"
      action={
        <IconButton
          label="New step"
          tooltipSide="left"
          disabled={!isReference}
          onClick={() => dispatch({ type: "bubble/open", mode: "new" })}
        >
          <Plus aria-hidden="true" size={16} strokeWidth={2.2} />
        </IconButton>
      }
    >
      {!isReference && (
        <div className="mb-2 flex items-center justify-between gap-3 rounded-control bg-field px-3 py-2.5 text-sm text-ink-2">
          <p>Tune steps on the reference photo ({referenceNumber}). The shoot follows.</p>
          <Button variant="line" size="sm" onClick={onOpenReference}>
            Open
          </Button>
        </div>
      )}
      <Reorder.Group as="ol" axis="y" values={order} onReorder={setDragOrder} className="mt-1">
        {order.map((id) => byId.get(id)).map((step, index) => (
          <StepRow
            key={step.id}
            step={step}
            number={index + 1}
            regionName={regionLabel(project.regions, regions, step.region)}
            active={isReference && step.id === state.activeStepId}
            processing={state.processing?.stepId === step.id}
            disabled={!isReference}
            onActivate={() => dispatch({ type: "step/activate", stepId: step.id })}
            onToggle={() => dispatch({ type: "step/toggle", stepId: step.id })}
            onPreview={(value) => actions.previewStrength(step.id, value)}
            onCommit={(from, to) => {
              dispatch({ type: "step/strengthCommitted", stepId: step.id, from, to });
              actions.endStrengthPreview(step.id);
            }}
            onModelChange={(model) => dispatch({ type: "step/patch", stepId: step.id, patch: { model } })}
            onMove={(offset) => dispatch({ type: "step/move", stepId: step.id, offset })}
            onDragEnd={finishDrag}
          />
        ))}
      </Reorder.Group>
    </PanelSection>
  );
}
