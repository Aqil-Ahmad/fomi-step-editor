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
