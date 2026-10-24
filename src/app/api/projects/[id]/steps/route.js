import { randomUUID } from "node:crypto";
import { getProject } from "@/lib/project";
import { adjustmentForNewStep, titleFromInstruction } from "@/lib/instructions";
import { errorResponse, failureRequested, readJson, wait } from "@/lib/server/http";

const STEP_LATENCY = [900, 1500];

export async function POST(request, { params }) {
  const { id } = await params;
  const project = getProject(id);
  if (!project) return errorResponse("Project not found", 404);

  const { region, instruction } = await readJson(request);
  if (typeof region !== "string" || typeof instruction !== "string" || !instruction.trim()) {
    return errorResponse("A region and an instruction are required", 400);
  }

  await wait(STEP_LATENCY);
  if (failureRequested(request)) return errorResponse("The model didn't respond. Nothing was changed.");

  const text = instruction.trim().slice(0, 280);
  return Response.json({
    step: {
      id: `u-${randomUUID().slice(0, 8)}`,
      title: titleFromInstruction(text),
      region,
      instruction: text,
      strength: 1,
      visible: true,
      model: "auto",
      modelHint: "Auto, best for local edits",
      effect: { kind: "adjust" },
      adjust: adjustmentForNewStep(text),
    },
  });
}
