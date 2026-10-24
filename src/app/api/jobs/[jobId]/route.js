import { connection } from "next/server";
import { getProject } from "@/lib/project";
import { decodeJob, jobSnapshot } from "@/lib/jobs";
import { errorResponse } from "@/lib/server/http";

export async function GET(request, { params }) {
  await connection();
  const { jobId } = await params;
  const job = decodeJob(jobId);
  const project = job && getProject(job.projectId);
  if (!project) return errorResponse("Job not found", 404);

  return Response.json(jobSnapshot(project.applyPlan, project.look.steps.length, job, Date.now()));
}
