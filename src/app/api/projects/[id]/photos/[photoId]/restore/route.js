import { getProject } from "@/lib/project";
import { errorResponse, failureRequested, readJson, wait } from "@/lib/server/http";

const LATENCY = {
  restore: [900, 1200],
  rerun: [1500, 2000],
};

export async function POST(request, { params }) {
  const { id, photoId } = await params;
  const project = getProject(id);
  const photo = project?.photos.find((item) => item.id === photoId);
  if (!photo) return errorResponse("Photo not found", 404);

  const { mode = "restore" } = await readJson(request);
  if (!LATENCY[mode]) return errorResponse("Unknown fix", 400);

  await wait(LATENCY[mode]);
  if (failureRequested(request)) return errorResponse(`Photo ${photo.n} couldn't be fixed. Try again.`);

  return Response.json({ photo: { id: photo.id, status: "ready" } });
}
