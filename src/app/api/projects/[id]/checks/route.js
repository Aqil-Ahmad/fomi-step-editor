import { getProject } from "@/lib/project";
import { evaluateChecks } from "@/lib/checks";
import { errorResponse, failureRequested, readJson, wait } from "@/lib/server/http";

const CHECK_LATENCY = [600, 900];

export async function POST(request, { params }) {
  const { id } = await params;
  const project = getProject(id);
  if (!project) return errorResponse("Project not found", 404);

  const { locks = [], photoId, drifted = false } = await readJson(request);

  await wait(CHECK_LATENCY);
  if (failureRequested(request)) return errorResponse("Checks couldn't run. Your steps are saved.");

  const photoResult = drifted ? project.applyPlan.photos[photoId] : null;
  return Response.json({ checks: evaluateChecks(project.checks, locks, photoResult) });
}
