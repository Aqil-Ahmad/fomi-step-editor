"use client";

import { useEffect, useState } from "react";
import { Images, ListChecks, SlidersHorizontal } from "lucide-react";
import { EditPanel } from "@/components/panel/EditPanel";
import { Sheet } from "@/components/ui/Sheet";
import { cn } from "@/lib/cn";
import { photoDisplay } from "@/lib/shoot";
import { useEditorState, useWorkspace } from "@/state/WorkspaceProvider";
import { Canvas } from "./Canvas";
import { Filmstrip } from "./Filmstrip";
import styles from "./EditView.module.css";

const COMPACT_QUERY = "(max-width: 1023.98px)";

function checksSummary(checks) {
  if (checks.status === "running") return "Checking";
  const failing = checks.results.filter((check) => check.status === "fail").length;
  return failing > 0 ? `${failing} to fix` : "All passed";
}

function BarButton({ icon: Icon, label, detail, onClick }) {
  return (
    <button type="button" onClick={onClick} className={styles.barButton}>
      <Icon aria-hidden="true" size={18} strokeWidth={2} />
      <span className="text-xs font-semibold">{label}</span>
      {detail && <span className="text-2xs text-muted">{detail}</span>}
    </button>
  );
}

export function EditView({ photoId, shoot, onOpenPhoto, onApply, onShowShoot }) {
  const { project, dispatch } = useWorkspace();
  const state = useEditorState();
  const [highlightRegion, setHighlightRegion] = useState(null);
  const [openSheet, setOpenSheet] = useState(null);

  const photo = project.photos.find((item) => item.id === photoId);
  const reference = project.photos.find((item) => item.id === project.referencePhotoId);
  const displayFor = (item) => photoDisplay(item, shoot.state.statuses[item.id], project.applyPlan);
  const stepCount = state.doc.steps.length;
  const closeSheet = () => setOpenSheet(null);

  useEffect(() => {
    if (window.matchMedia(COMPACT_QUERY).matches) dispatch({ type: "bubble/close" });
  }, [dispatch]);

  const panelProps = {
    photo,
    reference,
    shoot,
    onOpenPhoto,
    onApply,
    onHighlight: setHighlightRegion,
  };

  return (
    <div className={styles.layout}>
      <Filmstrip
        photos={project.photos}
        currentId={photo.id}
        displayFor={displayFor}
        onOpen={onOpenPhoto}
        className={styles.strip}
      />

      <Canvas
        photo={photo}
        display={displayFor(photo)}
        isReference={photo.id === reference.id}
        highlightRegion={highlightRegion}
        className={styles.canvas}
      />

      <aside aria-label="Steps, locks and checks" className={cn(styles.panel, "border-l border-line bg-panel")}>
        <EditPanel {...panelProps} />
      </aside>

      <button type="button" onClick={() => setOpenSheet("panel")} className={styles.panelTrigger}>
        <SlidersHorizontal aria-hidden="true" size={16} strokeWidth={2.2} />
        Steps
        <span className="grid h-5 min-w-5 place-items-center rounded-full bg-white/20 px-1.5 text-xs">{stepCount}</span>
      </button>

      <nav aria-label="Review" className={styles.bar}>
        <BarButton icon={SlidersHorizontal} label="Steps" detail={String(stepCount)} onClick={() => setOpenSheet("steps")} />
        <BarButton icon={ListChecks} label="Checks" detail={checksSummary(state.checks)} onClick={() => setOpenSheet("checks")} />
        <BarButton icon={Images} label="Shoot" detail={`${project.photos.length} photos`} onClick={onShowShoot} />
      </nav>

      <Sheet side="right" title="Edit steps" open={openSheet === "panel"} onClose={closeSheet}>
        <EditPanel {...panelProps} />
      </Sheet>
      <Sheet side="bottom" title="Steps and locks" open={openSheet === "steps"} onClose={closeSheet}>
        <EditPanel {...panelProps} sections={["steps", "locks"]} />
      </Sheet>
      <Sheet side="bottom" title="Checks" open={openSheet === "checks"} onClose={closeSheet}>
        <EditPanel {...panelProps} sections={["checks"]} showFooter={false} />
      </Sheet>
    </div>
  );
}
