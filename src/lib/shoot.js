export function initialPhotoStatuses(project) {
  return Object.fromEntries(
    project.photos.map((photo) => [
      photo.id,
      photo.status === "original" ? { status: "original", progress: 0 } : { status: "ready", progress: 1 },
    ]),
  );
}

export function photoDisplay(photo, entry, applyPlan) {
  const status = entry?.status ?? "original";
  if (status === "drift") return { status, src: applyPlan.photos[photo.id]?.file ?? photo.edit };
  if (status === "ready") return { status, src: photo.edit };
  return { status, src: photo.orig };
}

const IN_PROGRESS = new Set(["queued", "applying"]);

export function summarizeShoot(project, statuses) {
  const entries = project.photos.map((photo) => statuses[photo.id]?.status ?? "original");
  const count = (predicate) => entries.filter(predicate).length;
  const checked = project.photos.filter((photo) => ["ready", "drift"].includes(statuses[photo.id]?.status));

  const checks = project.checks.map((check) => {
    const failing = checked.filter(
      (photo) => statuses[photo.id].status === "drift" && project.applyPlan.photos[photo.id]?.failedCheck === check.id,
    ).length;
    return { id: check.id, title: check.title, passing: checked.length - failing, total: checked.length };
  });

  return {
    ready: count((status) => status === "ready"),
    drift: count((status) => status === "drift"),
    inProgress: count((status) => IN_PROGRESS.has(status)),
    waiting: count((status) => status === "original"),
    checkedCount: checked.length,
    checks,
  };
}

export function isInProgress(status) {
  return IN_PROGRESS.has(status);
}
