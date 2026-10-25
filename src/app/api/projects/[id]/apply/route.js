import { getProject } from "@/lib/project";
import { encodeJob } from "@/lib/jobs";
import { errorResponse, failureRequested, wait } from "@/lib/server/http";

export async function POST(request, { params }) {
  const { id } = await params;
  const project = getProject(id);
  if (!project) return errorResponse("Project not found", 404);

  await wait([250, 450]);
  if (failureRequested(request)) return errorResponse("The shoot couldn't be queued. Try again.");

  return Response.json({ jobId: encodeJob({ projectId: id, startedAt: Date.now() }) }, { status: 202 });
}
