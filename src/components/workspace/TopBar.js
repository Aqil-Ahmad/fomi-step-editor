"use client";

import { Button } from "@/components/ui/Button";
import { Segmented } from "@/components/ui/Segmented";
import { useToast } from "@/components/ui/Toast";
import { useWorkspace } from "@/state/WorkspaceProvider";
import { Presence } from "./Presence";
import { ProjectSwitcher } from "./ProjectSwitcher";

const VIEWS = [
  { value: "edit", label: "Edit" },
  { value: "shoot", label: "Shoot" },
];

export function TopBar({ view, onViewChange }) {
  const { project } = useWorkspace();
  const toast = useToast();

  async function shareLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copied", description: "Anyone on the project can open this view." });
    } catch {
      toast({ title: "Couldn't copy the link", description: "Copy it from the address bar instead." });
    }
  }

  return (
    <header className="relative col-span-full flex h-14 items-center gap-4.5 border-b border-line bg-panel pr-4 pl-5.5">
      <span className="font-wordmark text-wordmark font-black tracking-title">Fomi</span>
      <span aria-hidden="true" className="h-5.5 w-px bg-line" />
      <ProjectSwitcher project={project} />
      <Segmented
        variant="soft"
        label="View"
        options={VIEWS}
        value={view}
        onChange={onViewChange}
        className="absolute left-1/2 -translate-x-1/2"
      />
      <div className="ml-auto flex items-center gap-2.5">
        <Presence people={project.collaborators} />
        <Button variant="line" onClick={shareLink}>
          Share
        </Button>
        <Button variant="ink" onClick={() => onViewChange("shoot")}>
          Export
        </Button>
      </div>
    </header>
  );
}
