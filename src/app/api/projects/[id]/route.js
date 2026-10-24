import { getProject } from "@/lib/project";
import { errorResponse } from "@/lib/server/http";

export async function GET(request, { params }) {
  const { id } = await params;
  const project = getProject(id);
  if (!project) return errorResponse("Project not found", 404);
  return Response.json(project);
}
