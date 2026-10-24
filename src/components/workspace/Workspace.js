"use client";

import { MotionConfig } from "motion/react";
import { EditView } from "@/components/editor/EditView";
import { ShootView } from "@/components/shoot/ShootView";
import { ToastProvider } from "@/components/ui/Toast";
import { useShoot } from "@/hooks/useShoot";
import { useShortcuts } from "@/hooks/useShortcuts";
import { useWorkspaceUrl } from "@/hooks/useWorkspaceUrl";
import { useEditorState, useWorkspace, WorkspaceProvider } from "@/state/WorkspaceProvider";
import { TopBar } from "./TopBar";

const STRENGTH_STEP = 0.05;

function useEditorShortcuts({ view, setView }) {
  const { dispatch } = useWorkspace();
  const state = useEditorState();
  const inEdit = view === "edit";
  const activeStep = state.doc.steps.find((step) => step.id === state.activeStepId);

  function nudgeStrength(delta) {
    if (!activeStep || activeStep.showStrengthAs) return;
    const to = Math.round(Math.min(1, Math.max(0, activeStep.strength + delta)) * 100) / 100;
    dispatch({ type: "step/strengthCommitted", stepId: activeStep.id, from: activeStep.strength, to });
  }

  function escape() {
    if (state.bubble) dispatch({ type: "bubble/close" });
    else if (state.lockNotice) dispatch({ type: "lock/notice", region: null });
    else if (state.tool !== "select") dispatch({ type: "tool/set", tool: "select" });
    else dispatch({ type: "selection/clear" });
  }

  const stepKeys = Object.fromEntries(
    state.doc.steps.slice(0, 9).map((step, index) => [String(index + 1), () => dispatch({ type: "step/activate", stepId: step.id })]),
  );

  const editHandlers = {
    v: () => dispatch({ type: "tool/set", tool: "select" }),
    b: () => dispatch({ type: "tool/set", tool: "brush" }),
    l: () => dispatch({ type: "tool/set", tool: "lock" }),
    c: () => dispatch({ type: "compare/toggle" }),
    "[": () => nudgeStrength(-STRENGTH_STEP),
    "]": () => nudgeStrength(STRENGTH_STEP),
    undo: () => dispatch({ type: "history/undo" }),
    redo: () => dispatch({ type: "history/redo" }),
    Escape: escape,
    ...stepKeys,
  };

  useShortcuts({
    e: () => setView(inEdit ? "shoot" : "edit"),
    ...(inEdit ? editHandlers : {}),
  });
}

function WorkspaceLayout() {
  const { project, rootRef } = useWorkspace();
  const { view, photoId, setView, openPhoto } = useWorkspaceUrl(project);
  const shoot = useShoot(project);
  useEditorShortcuts({ view, setView });

  function applyToShoot() {
    shoot.startApply();
    setView("shoot");
  }

  return (
    <div ref={rootRef} className="grid h-dvh grid-rows-[56px_minmax(0,1fr)] overflow-hidden bg-studio">
      <TopBar view={view} onViewChange={setView} />
      {view === "shoot" ? (
        <ShootView shoot={shoot} onOpenPhoto={openPhoto} onEditLook={() => setView("edit")} />
      ) : (
        <EditView
          photoId={photoId}
          shoot={shoot}
          onOpenPhoto={openPhoto}
          onApply={applyToShoot}
          onShowShoot={() => setView("shoot")}
        />
      )}
    </div>
  );
}

export function Workspace({ project, outlines, initialChecks }) {
  return (
    <WorkspaceProvider project={project} outlines={outlines} initialChecks={initialChecks}>
      <MotionConfig reducedMotion="user">
        <ToastProvider>
          <WorkspaceLayout />
        </ToastProvider>
      </MotionConfig>
    </WorkspaceProvider>
  );
}
