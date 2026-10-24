"use client";

import { useRef } from "react";
import { AnimatePresence } from "motion/react";
import { Segmented } from "@/components/ui/Segmented";
import { useElementWidth } from "@/hooks/useElementWidth";
import { cn } from "@/lib/cn";
import { toPercent } from "@/lib/geometry";
import { photoPolygons, regionAnchor, regionLabel } from "@/lib/regions";
import { composePhoto, compareTargetLabel } from "@/lib/variants";
import { stepForRegion } from "@/state/editorReducer";
import { useEditorState, useWorkspace } from "@/state/WorkspaceProvider";
import { CompareHandle } from "./CompareHandle";
import { CompareTag, StaticTag } from "./CompareTag";
import { InstructionBubble } from "./InstructionBubble";
import { ObjectOverlay } from "./ObjectOverlay";
import { PhotoStack, StaticPhoto } from "./PhotoStack";
import { ToolPalette } from "./ToolPalette";
import styles from "./Canvas.module.css";

const CROP_OPTIONS = [
  { value: "4:5", label: "4:5" },
  { value: "9:16", label: "9:16" },
  { value: "1:1", label: "1:1" },
];

const DEFAULT_COMPARE_POSITION = 47;

function CropMarks() {
  return (
    <>
      <span aria-hidden="true" className={cn(styles.corner, styles.topLeft)} />
      <span aria-hidden="true" className={cn(styles.corner, styles.topRight)} />
      <span aria-hidden="true" className={cn(styles.corner, styles.bottomLeft)} />
      <span aria-hidden="true" className={cn(styles.corner, styles.bottomRight)} />
    </>
  );
}

function ReferenceComparison({ state, editor, polygons, photo, stepCount, dispatch }) {
  const { steps } = state.doc;
  const { left, right } = state.compare;
  const rightComposition = composePhoto(editor, steps, right);
  const altFor = (upTo) => `Photo ${photo.n}, ${photo.alt.toLowerCase()}, ${compareTargetLabel(upTo).toLowerCase()}`;

  if (!state.compareOn) {
    return (
      <>
        <PhotoStack composition={rightComposition} polygons={polygons} alt={altFor(right)} priority />
        <div className={styles.soloTag}>
          <CompareTag side="right" upTo={right} stepCount={stepCount} onChange={(upTo) => dispatch({ type: "compare/target", side: "right", upTo })} />
        </div>
      </>
    );
  }

  return (
    <>
      <PhotoStack composition={composePhoto(editor, steps, left)} polygons={polygons} alt={altFor(left)} priority className={styles.leftSide} />
      <PhotoStack composition={rightComposition} polygons={polygons} alt={altFor(right)} priority className={styles.rightSide} />
      <div className={styles.leftTag}>
        <CompareTag side="left" upTo={left} stepCount={stepCount} onChange={(upTo) => dispatch({ type: "compare/target", side: "left", upTo })} />
      </div>
      <div className={styles.rightTag}>
        <CompareTag side="right" upTo={right} stepCount={stepCount} onChange={(upTo) => dispatch({ type: "compare/target", side: "right", upTo })} />
      </div>
    </>
  );
}

function ShootPhotoComparison({ photo, display, compareOn }) {
  const resultLabel = display.status === "original" ? "Look not applied" : "With the look";

  if (!compareOn) {
    return (
      <>
        <StaticPhoto src={display.src} alt={`Photo ${photo.n}, ${photo.alt.toLowerCase()}`} priority />
        <div className={styles.soloTag}>
          <StaticTag>{resultLabel}</StaticTag>
        </div>
      </>
    );
  }

  return (
    <>
      <StaticPhoto src={photo.orig} alt={`Photo ${photo.n}, original`} priority className={styles.leftSide} />
      <StaticPhoto src={display.src} alt={`Photo ${photo.n}, ${resultLabel.toLowerCase()}`} priority className={styles.rightSide} />
      <div className={styles.leftTag}>
        <StaticTag>Original</StaticTag>
      </div>
      <div className={styles.rightTag}>
        <StaticTag>{resultLabel}</StaticTag>
      </div>
    </>
  );
}

export function Canvas({ photo, display, isReference, highlightRegion }) {
  const { project, outlines, dispatch, actions } = useWorkspace();
  const state = useEditorState();
  const frameRef = useRef(null);
  const frameWidth = useElementWidth(frameRef);

  const { steps, locks, regions } = state.doc;
  const polygons = photoPolygons(outlines, photo.id, isReference ? regions : []);
  const contentLocks = locks.filter((lock) => lock.kind === "content");
  const zoom = Math.round((frameWidth / project.editor.renderSize.width) * 100);

  const selection = isReference ? state.selection : null;
  const selectionName = selection && regionLabel(project.regions, regions, selection);
  const bubbleStep = selection && stepForRegion(steps, selection);
  const anchor = selection && regionAnchor(selection, polygons);

  return (
    <main id="main" className={styles.canvas}>
      <div className={styles.header}>
        <h1 className="text-base font-bold">Photo {photo.n}</h1>
        <span className="text-caption text-muted">{photo.file}</span>
      </div>

      <Segmented
        label="Crop marks"
        caption="Crop marks"
        options={CROP_OPTIONS}
        value={state.crop}
        onChange={(crop) => dispatch({ type: "crop/set", crop })}
        className={styles.crops}
      />

      <div ref={frameRef} className={styles.frame}>
        <CropMarks />
        <div className={styles.photo}>
          {isReference ? (
            <ReferenceComparison
              state={state}
              editor={project.editor}
              polygons={polygons}
              photo={photo}
              stepCount={steps.length}
              dispatch={dispatch}
            />
          ) : (
            <ShootPhotoComparison photo={photo} display={display} compareOn={state.compareOn} />
          )}

          <ObjectOverlay
            polygons={polygons}
            selection={selection}
            selectionLabel={selectionName}
            contentLocks={contentLocks}
            highlightRegion={highlightRegion}
          />

          {state.compareOn && (
            <CompareHandle label="Compare position" valueNow={DEFAULT_COMPARE_POSITION} />
          )}
        </div>

        {anchor && state.bubble && (
          <span
            aria-hidden="true"
            className={styles.connector}
            style={{ "--cy": toPercent(anchor.cy), "--x1": toPercent(anchor.x1) }}
          />
        )}

        <AnimatePresence>
          {anchor && state.bubble && (
            <div key={`${selection}:${state.bubble.mode}`} className={styles.bubbleAnchor} style={{ "--cy": toPercent(anchor.cy) }}>
              <InstructionBubble
                regionName={selectionName}
                step={bubbleStep}
                stepNumber={bubbleStep ? steps.indexOf(bubbleStep) + 1 : steps.length + 1}
                mode={state.bubble.mode}
                processing={Boolean(state.processing)}
                error={state.stepError}
                onSubmit={(mode, instruction) =>
                  actions.submitInstruction({ mode, step: bubbleStep, region: selection, instruction })
                }
                onClose={() => dispatch({ type: "bubble/close" })}
              />
            </div>
          )}
        </AnimatePresence>
      </div>

      <ToolPalette
        tool={state.tool}
        compareOn={state.compareOn}
        zoom={zoom}
        canUndo={state.past.length > 0}
        canRedo={state.future.length > 0}
        dispatch={dispatch}
        className={styles.palette}
      />
    </main>
  );
}
