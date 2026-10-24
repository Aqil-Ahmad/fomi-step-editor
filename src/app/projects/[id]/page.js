import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Workspace } from "@/components/workspace/Workspace";
import { WorkspaceSkeleton } from "@/components/workspace/WorkspaceSkeleton";
import { evaluateChecks } from "@/lib/checks";
import { getOutlines, getProject, getProjectIds } from "@/lib/project";

export function generateStaticParams() {
  return getProjectIds().map((id) => ({ id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const project = getProject(id);
  return { title: project ? project.name : "Project not found" };
}

function ProjectWorkspace({ id }) {
  const project = getProject(id);
  if (!project) notFound();

  return (
    <Workspace
      project={project}
      outlines={getOutlines()}
      initialChecks={evaluateChecks(project.checks, project.locks, null)}
    />
  );
}

export default function ProjectPage({ params }) {
  return (
    <Suspense fallback={<WorkspaceSkeleton />}>
      {params.then(({ id }) => (
        <ProjectWorkspace id={id} />
      ))}
    </Suspense>
  );
}
