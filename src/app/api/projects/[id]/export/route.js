import { randomUUID } from "node:crypto";
import { getProject } from "@/lib/project";
import { errorResponse, failureRequested, readJson, wait } from "@/lib/server/http";

export async function POST(request, { params }) {
  const { id } = await params;
  const project = getProject(id);
  if (!project) return errorResponse("Project not found", 404);

  const { photoIds = [], sizes = [] } = await readJson(request);
  if (photoIds.length === 0 || sizes.length === 0) {
    return errorResponse("Pick at least one photo and one size", 400);
  }

  await wait([200, 400]);
  if (failureRequested(request)) return errorResponse("The export couldn't start. Try again.");

  return Response.json({ exportId: randomUUID(), files: photoIds.length * sizes.length }, { status: 202 });
}
