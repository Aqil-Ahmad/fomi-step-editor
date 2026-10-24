"use client";

import { ChevronDown } from "lucide-react";
import { Menu } from "@/components/ui/Menu";

export function ProjectSwitcher({ project }) {
  const items = [
    { value: project.id, label: project.name, detail: project.client },
    { value: "all", label: "All projects", detail: "Coming soon", disabled: true },
  ];

  return (
    <Menu
      label="Projects"
      items={items}
      value={project.id}
      onSelect={() => {}}
      renderTrigger={(props) => (
        <button
          type="button"
          {...props}
          className="flex h-9 max-w-full min-w-0 items-center gap-2 rounded-control px-1.5 text-lg font-semibold hover:bg-ink/5"
        >
          <span className="truncate">{project.name}</span>
          <ChevronDown aria-hidden="true" size={14} strokeWidth={2.4} className="shrink-0 text-ink-2" />
          <span className="ml-1 text-ui font-regular whitespace-nowrap text-muted max-lg:hidden">
            {project.photos.length} photos
          </span>
        </button>
      )}
    />
  );
}
