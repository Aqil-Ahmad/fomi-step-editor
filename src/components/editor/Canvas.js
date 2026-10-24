"use client";

import { useRef, useState } from "react";
import { preload } from "react-dom";
import { AnimatePresence } from "motion/react";
import { Segmented } from "@/components/ui/Segmented";
import { useToast } from "@/components/ui/Toast";
import { useCompareDrag } from "@/hooks/useCompareDrag";
import { useElementWidth } from "@/hooks/useElementWidth";
import { cn } from "@/lib/cn";
import { toClipPath, toPercent } from "@/lib/geometry";
import { FALLBACK_REGION, objectList, photoPolygons, regionAnchor, regionLabel } from "@/lib/regions";
import { allVariantSources, composePhoto, compareTargetLabel } from "@/lib/variants";
import { contentLockFor, stepForRegion } from "@/state/editorReducer";
import { useEditorState, useWorkspace } from "@/state/WorkspaceProvider";
import { CompareHandle } from "./CompareHandle";
import { CompareTag, StaticTag } from "./CompareTag";
import { HitLayer } from "./HitLayer";
import { InstructionBubble } from "./InstructionBubble";
import { LockNotice } from "./LockNotice";
import { ObjectOverlay } from "./ObjectOverlay";
import { ObjectsMenu } from "./ObjectsMenu";
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

const CROP_FRAMES = {
  "9:16": { className: styles.crop916, label: "9:16 for Stories" },
  "1:1": { className: styles.crop11, label: "1:1 for the shop" },
};

function CropFrame({ crop }) {
  const frame = CROP_FRAMES[crop];
  if (!frame) return null;
  return (
    <div aria-hidden="true" className={styles.cropMask}>
      <div className={cn(styles.cropFrame, frame.className)}>
        <span className={styles.cropLabel}>{frame.label}</span>
      </div>
    </div>
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
  const toast = useToast();
  const frameRef = useRef(null);
  const frameWidth = useElementWidth(frameRef);
  const compareDrag = useCompareDrag(frameRef, DEFAULT_COMPARE_POSITION);
  const [hoverRegion, setHoverRegion] = useState(null);

  const { steps, locks, regions } = state.doc;
  const customRegions = isReference ? regions : [];
  const polygons = photoPolygons(outlines, photo.id, customRegions);
  const contentLocks = locks.filter((lock) => lock.kind === "content");
  const zoom = Math.round((frameWidth / project.editor.renderSize.width) * 100);

  const selection = isReference ? state.selection : null;
  const selectionName = selection && regionLabel(project.regions, regions, selection);
  const bubbleStep = selection && stepForRegion(steps, selection);
  const anchor = selection && regionAnchor(selection, polygons);
  const noticeLock = isReference && state.lockNotice && contentLockFor(locks, state.lockNotice);
  const noticeAnchor = noticeLock && regionAnchor(noticeLock.region, polygons);
  const processingRegion = isReference && state.processing?.region;

  if (isReference) {
    for (const src of allVariantSources(project.editor)) preload(src, { as: "image", fetchPriority: "low" });
  }

  function pick(region) {
    if (state.tool !== "lock") {
      dispatch({ type: "selection/set", region });
      return;
    }
    if (contentLockFor(locks, region)) {
      dispatch({ type: "lock/notice", region });
    } else if (region === FALLBACK_REGION) {
      toast({ title: "Pick an object to lock", description: "The backdrop is where the look changes most." });
    } else {
      const title = regionLabel(project.regions, regions, region);
      dispatch({ type: "lock/add", region, title });
      toast({ title: `${title} locked`, description: "Steps can't change it, and it's checked after every step." });
    }
  }

  function paint(polygon) {
    const count = regions.length + 1;
    const region = { id: `paint-${count}`, label: count === 1 ? "Painted area" : `Painted area ${count}`, polygon };
    dispatch({ type: "region/add", region });
    dispatch({ type: "tool/set", tool: "select" });
  }

  return (
    <main id="main" className={styles.canvas}>
      <div className={styles.header}>
        <h1 className="text-base font-bold">Photo {photo.n}</h1>
        <span className="text-caption text-muted">{photo.file}</span>
        {isReference && (
          <div className={styles.headerTools}>
            <ObjectsMenu
              objects={objectList(project.regions, regions)}
              locks={locks}
              tool={state.tool}
              onPick={pick}
            />
          </div>
        )}
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

          {processingRegion && (
            <div
              aria-hidden="true"
              className={styles.shimmer}
              style={{ clipPath: polygons[processingRegion] ? toClipPath(polygons[processingRegion]) : undefined }}
            />
          )}

          <CropFrame crop={state.crop} />

          {isReference && (
            <HitLayer
              tool={state.tool}
              polygons={polygons}
              customRegions={customRegions}
              onHover={setHoverRegion}
              onPick={pick}
              onPaint={paint}
            />
          )}

          <ObjectOverlay
            polygons={polygons}
            selection={selection}
            selectionLabel={selectionName}
            contentLocks={contentLocks}
            highlightRegion={highlightRegion}
            hoverRegion={isReference ? hoverRegion : null}
          />

          {state.compareOn && (
            <CompareHandle
              handleRef={compareDrag.handleRef}
              label="Compare position"
              valueNow={DEFAULT_COMPARE_POSITION}
              onPointerDown={compareDrag.onPointerDown}
              onKeyDown={compareDrag.onKeyDown}
              onDoubleClick={compareDrag.onDoubleClick}
            />
          )}

          <AnimatePresence>
            {noticeLock && (
              <LockNotice
                key={noticeLock.id}
                lock={noticeLock}
                className={styles.lockNotice}
                style={{ "--y0": toPercent(noticeAnchor.y0), "--x1": toPercent(noticeAnchor.x1) }}
                onUnlock={() => dispatch({ type: "lock/remove", lockId: noticeLock.id })}
                onClose={() => dispatch({ type: "lock/notice", region: null })}
              />
            )}
          </AnimatePresence>
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
