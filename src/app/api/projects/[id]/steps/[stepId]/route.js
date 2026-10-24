import { getProject } from "@/lib/project";
import { adjustmentFor } from "@/lib/instructions";
import { errorResponse, failureRequested, readJson, wait } from "@/lib/server/http";

const STEP_LATENCY = [900, 1500];

function clampStrength(value, fallback) {
  return typeof value === "number" ? Math.min(1, Math.max(0, value)) : fallback;
}

export async function POST(request, { params }) {
  const { id, stepId } = await params;
  const project = getProject(id);
  if (!project) return errorResponse("Project not found", 404);

  const { step } = await readJson(request);
  if (!step || step.id !== stepId) return errorResponse("Step not found", 404);

  await wait(STEP_LATENCY);
  if (failureRequested(request)) return errorResponse(`The model didn't respond. Step "${step.title}" is unchanged.`);

  const original = project.look.steps.find((lookStep) => lookStep.id === stepId);
  const instruction = typeof step.instruction === "string" ? step.instruction.trim().slice(0, 280) : "";
  const adjust = original ? adjustmentFor(instruction, original.instruction) : step.adjust;

  return Response.json({
    step: {
      ...step,
      instruction,
      strength: clampStrength(step.strength, 1),
      visible: step.visible !== false,
      adjust,
    },
  });
}
