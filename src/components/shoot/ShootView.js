"use client";

import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/Button";
import { Segmented } from "@/components/ui/Segmented";
import { boundingBox, clampBox } from "@/lib/geometry";
import { photoDisplay, summarizeShoot } from "@/lib/shoot";
import { cn } from "@/lib/cn";
import { useEditorState, useWorkspace } from "@/state/WorkspaceProvider";
import { FixCard } from "./FixCard";
import { PhotoTile } from "./PhotoTile";
import { ShootPanel } from "./ShootPanel";

const FILTER_MATCHES = {
  all: () => true,
  fix: (status) => status === "drift",
  ready: (status) => status === "ready",
};

function StatusDot({ className }) {
  return <i aria-hidden="true" className={cn("size-2 rounded-full", className)} />;
}

function announcement(summary, driftPhotos) {
  if (summary.inProgress > 0) return "Applying the look to the shoot";
  if (driftPhotos.length > 0) return `${driftPhotos.map((photo) => `Photo ${photo.n}`).join(", ")} needs a fix`;
  if (summary.waiting > 0) return "";
  return "Every photo passes every check";
}

export function ShootView({ shoot, onOpenPhoto, onEditLook }) {
  const { project, outlines } = useWorkspace();
  const editor = useEditorState();
  const { state, dispatch, startApply, fixPhoto, exportPhotos } = shoot;
  const { photos, look, applyPlan } = project;

  const statusOf = (id) => state.statuses[id]?.status ?? "original";
  const summary = summarizeShoot(project, state.statuses);
  const driftPhotos = photos.filter((photo) => statusOf(photo.id) === "drift");
  const visiblePhotos = photos.filter((photo) => FILTER_MATCHES[state.filter](statusOf(photo.id)));
  const fixTarget = driftPhotos[0];
  const fixPlan = fixTarget && applyPlan.photos[fixTarget.id];
  const steps = editor.doc.steps;

  const filters = [
    { value: "all", label: "All", count: photos.length },
    { value: "fix", label: "Needs a fix", count: summary.drift },
    { value: "ready", label: "Ready", count: summary.ready },
  ];

  if (photos.length === 0) {
    return (
      <main id="main" className="grid place-items-center p-8 text-center">
        <div>
          <h1 className="text-title font-heavy">No photos in this shoot yet</h1>
          <p className="mt-1 text-ui text-ink-2">Upload the shoot, then apply a look to every photo at once.</p>
          <Button variant="ink" className="mt-4">
            Upload photos
          </Button>
        </div>
      </main>
    );
  }

  return (
    <div className="grid min-h-0 max-lg:overflow-y-auto lg:grid-cols-[minmax(0,1fr)_340px] 2xl:grid-cols-[minmax(0,1fr)_376px]">
      <main id="main" className="px-4 pt-5 pb-6 sm:px-7 sm:pt-5.5 lg:min-h-0 lg:overflow-y-auto">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-wide text-display font-heavy tracking-title">
              {look.name} on all {photos.length} photos
            </h1>
            <p className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-ui text-ink-2">
              <span className="inline-flex items-center gap-1.75">
                <StatusDot className="bg-pass" />
                {summary.ready} ready
              </span>
              {summary.drift > 0 && (
                <span className="inline-flex items-center gap-1.75">
                  <StatusDot className="bg-drift" />
                  {summary.drift} {summary.drift === 1 ? "needs" : "need"} a fix
                </span>
              )}
              {summary.inProgress > 0 && (
                <span className="inline-flex items-center gap-1.75">
                  <StatusDot className="bg-muted" />
                  {summary.inProgress} still applying
                </span>
              )}
              {summary.waiting > 0 && (
                <span className="inline-flex items-center gap-1.75">
                  <StatusDot className="bg-line" />
                  {summary.waiting} without the look
                </span>
              )}
            </p>
            <p className="sr-only" aria-live="polite">
              {announcement(summary, driftPhotos)}
            </p>
          </div>
          <Segmented
            label="Filter photos"
            options={filters}
            value={state.filter}
            onChange={(filter) => dispatch({ type: "filter/set", filter })}
          />
        </div>

        {(state.jobError || (summary.waiting > 0 && summary.inProgress === 0)) && (
          <div
            role={state.jobError ? "alert" : undefined}
            className={cn(
              "mt-4 flex flex-wrap items-center justify-between gap-3 rounded-field px-4 py-3 text-ui",
              state.jobError ? "bg-drift-bg text-drift-ink" : "bg-white/70 text-ink-2",
            )}
          >
            {state.jobError ?? `${summary.waiting} photos don't have the ${look.name.toLowerCase()} yet.`}
            <Button variant={state.jobError ? "line" : "ink"} size="sm" onClick={startApply}>
              {state.jobError ? "Try again" : `Apply to ${summary.waiting} photos`}
            </Button>
          </div>
        )}

        <motion.ul
          layout
          className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-7 4xl:grid-cols-8"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {visiblePhotos.map((photo) => {
              const entry = state.statuses[photo.id] ?? { status: "original" };
              const plan = applyPlan.photos[photo.id];
              const resultSrc = entry.status === "drift" ? photoDisplay(photo, entry, applyPlan).src : photo.edit;
              const label = outlines.photos[photo.id]?.label;

              return (
                <motion.li
                  key={photo.id}
                  layout
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
                >
                  <PhotoTile
                    photo={photo}
                    entry={entry}
                    resultSrc={resultSrc}
                    labelBox={label && clampBox(boundingBox(label))}
                    driftLabel={plan?.label ?? "Needs a fix"}
                    stepCount={steps.length}
                    onOpen={() => onOpenPhoto(photo.id)}
                  />
                </motion.li>
              );
            })}
          </AnimatePresence>
        </motion.ul>

        {visiblePhotos.length === 0 && (
          <p className="mt-6 rounded-field bg-white/70 px-4 py-6 text-center text-ui text-ink-2">
            {state.filter === "fix" ? "Nothing needs a fix." : "No photos are ready yet."}
          </p>
        )}

        <div className="mt-6">
          <AnimatePresence>
            {fixTarget && (
              <FixCard
                key={fixTarget.id}
                photo={fixTarget}
                plan={fixPlan}
                outline={outlines.photos[fixTarget.id]}
                stepNumber={steps.findIndex((step) => step.id === fixPlan.stepId) + 1}
                fixing={state.fixing?.photoId === fixTarget.id ? state.fixing : null}
                error={state.fixError}
                onFix={(mode) => fixPhoto(fixTarget.id, mode)}
                onOpen={() => onOpenPhoto(fixTarget.id)}
              />
            )}
          </AnimatePresence>
        </div>
      </main>

      <ShootPanel
        look={look}
        steps={steps}
        summary={summary}
        driftPhotos={driftPhotos}
        exportSizes={project.exportSizes}
        shootState={state}
        dispatch={dispatch}
        onEditLook={onEditLook}
        onExport={(sizeIds) =>
          exportPhotos(
            photos
              .filter((photo) => statusOf(photo.id) === "ready" || (!state.onlyPassing && statusOf(photo.id) === "drift"))
              .map((photo) => photo.id),
            sizeIds,
          )
        }
      />
    </div>
  );
}
