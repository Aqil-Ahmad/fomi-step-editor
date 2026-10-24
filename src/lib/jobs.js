function hash(text) {
  let value = 0;
  for (const char of text) value = (value * 31 + char.charCodeAt(0)) >>> 0;
  return value;
}

export function encodeJob(job) {
  return Buffer.from(JSON.stringify(job)).toString("base64url");
}

export function decodeJob(jobId) {
  try {
    const job = JSON.parse(Buffer.from(jobId, "base64url").toString());
    return typeof job.startedAt === "number" && typeof job.projectId === "string" ? job : null;
  } catch {
    return null;
  }
}

export function jobSnapshot(applyPlan, stepCount, job, now) {
  const { order, msPerPhoto, photos: plan } = applyPlan;
  const [minMs, maxMs] = msPerPhoto;
  const elapsed = now - job.startedAt;
  let cursor = 0;

  const photos = order.map((id) => {
    const duration = minMs + (hash(`${id}:${job.startedAt}`) % (maxMs - minMs)) + (plan[id]?.extraMs ?? 0);
    const start = cursor;
    cursor += duration;

    if (elapsed < start) return { id, status: "queued", progress: 0, step: 0 };
    if (elapsed < start + duration) {
      const progress = (elapsed - start) / duration;
      return { id, status: "applying", progress, step: Math.min(stepCount, Math.floor(progress * stepCount) + 1) };
    }
    return { id, status: plan[id]?.result === "drift" ? "drift" : "ready", progress: 1, step: stepCount };
  });

  return { photos, done: elapsed >= cursor };
}
