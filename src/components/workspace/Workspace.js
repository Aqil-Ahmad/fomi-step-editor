"use client";

import { useState } from "react";
import { MotionConfig } from "motion/react";
import { EditView } from "@/components/editor/EditView";
import { ToastProvider } from "@/components/ui/Toast";
import { useWorkspaceUrl } from "@/hooks/useWorkspaceUrl";
import { initialPhotoStatuses } from "@/lib/shoot";
import { useWorkspace, WorkspaceProvider } from "@/state/WorkspaceProvider";
import { TopBar } from "./TopBar";

function WorkspaceLayout() {
  const { project, rootRef } = useWorkspace();
  const { view, photoId, setView, openPhoto } = useWorkspaceUrl(project);
  const [statuses] = useState(() => initialPhotoStatuses(project));

  return (
    <div ref={rootRef} className="grid h-dvh grid-rows-[56px_minmax(0,1fr)] overflow-hidden bg-studio">
      <TopBar view={view} onViewChange={setView} />
      <EditView photoId={photoId} statuses={statuses} onOpenPhoto={openPhoto} onApply={() => setView("shoot")} />
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
