"use client";

import { createContext, useContext, useEffect, useEffectEvent, useReducer, useRef } from "react";
import { api } from "@/lib/api";
import { strengthVar } from "@/lib/variants";
import { createEditorState, editorReducer } from "./editorReducer";

const WorkspaceContext = createContext(null);
const EditorStateContext = createContext(null);

export function WorkspaceProvider({ project, outlines, initialChecks, children }) {
  const [state, dispatch] = useReducer(editorReducer, null, () => createEditorState(project, initialChecks));
  const rootRef = useRef(null);
  const initialDoc = useRef(state.doc);
  const checksRun = useRef(0);

  function runChecks({ locks, steps }) {
    const runId = ++checksRun.current;
    dispatch({ type: "checks/started", runId });
    api
      .runChecks(project.id, { locks, photoId: project.referencePhotoId })
      .then(({ checks }) => dispatch({ type: "checks/finished", runId, results: checks, afterStep: steps.length }))
      .catch((error) => dispatch({ type: "checks/failed", runId, message: error.message }));
  }

  const onDocChange = useEffectEvent((doc) => runChecks(doc));

  useEffect(() => {
    if (state.doc !== initialDoc.current) onDocChange(state.doc);
  }, [state.doc]);

  async function submitInstruction({ mode, step, region, instruction }) {
    dispatch({ type: "step/processing", stepId: mode === "update" ? step.id : null, region });
    try {
      if (mode === "update") {
        const result = await api.updateStep(project.id, { ...step, instruction });
        dispatch({ type: "step/updated", step: result.step });
      } else {
        const result = await api.createStep(project.id, { region, instruction });
        dispatch({ type: "step/created", step: result.step });
      }
    } catch (error) {
      dispatch({ type: "step/failed", message: error.message });
    }
  }

  function previewStrength(stepId, value) {
    rootRef.current?.style.setProperty(strengthVar(stepId), String(value));
  }

  function endStrengthPreview(stepId) {
    rootRef.current?.style.removeProperty(strengthVar(stepId));
  }

  const workspace = {
    project,
    outlines,
    dispatch,
    rootRef,
    actions: { submitInstruction, previewStrength, endStrengthPreview, rerunChecks: () => runChecks(state.doc) },
  };

  return (
    <WorkspaceContext value={workspace}>
      <EditorStateContext value={state}>{children}</EditorStateContext>
    </WorkspaceContext>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error("useWorkspace must be used inside WorkspaceProvider");
  return context;
}

export function useEditorState() {
  const context = useContext(EditorStateContext);
  if (!context) throw new Error("useEditorState must be used inside WorkspaceProvider");
  return context;
}
