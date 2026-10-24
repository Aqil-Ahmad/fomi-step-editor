"use client";

import { useSearchParams } from "next/navigation";

export function useWorkspaceUrl(project) {
  const searchParams = useSearchParams();
  const view = searchParams.get("view") === "shoot" ? "shoot" : "edit";
  const requestedPhoto = searchParams.get("photo");
  const photoId = project.photos.some((photo) => photo.id === requestedPhoto)
    ? requestedPhoto
    : project.referencePhotoId;

  function update(changes) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value === null) params.delete(key);
      else params.set(key, value);
    }
    const query = params.toString();
    window.history.pushState(null, "", query ? `?${query}` : window.location.pathname);
  }

  return {
    view,
    photoId,
    setView: (nextView) => update({ view: nextView === "shoot" ? "shoot" : null }),
    openPhoto: (id) =>
      update({ view: null, photo: id === project.referencePhotoId ? null : id }),
  };
}
