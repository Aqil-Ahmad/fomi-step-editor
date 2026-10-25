"use client";

import { useEffect, useReducer } from "react";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import { createShootState, shootReducer } from "@/state/shootReducer";

const POLL_MS = 400;
const EXPORT_PROGRESS_MS = 2400;

export function useShoot(project) {
  const [state, dispatch] = useReducer(shootReducer, project, createShootState);
  const toast = useToast();
  const { jobId } = state;

  useEffect(() => {
    if (!jobId) return;
    let cancelled = false;
    let timer;

    async function poll() {
      try {
        const snapshot = await api.getJob(jobId);
        if (cancelled) return;
        dispatch({ type: "job/progress", photos: snapshot.photos, done: snapshot.done });
        if (!snapshot.done) timer = setTimeout(poll, POLL_MS);
      } catch (error) {
        if (!cancelled) dispatch({ type: "job/failed", message: error.message });
      }
    }

    poll();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [jobId]);

  async function startApply() {
    const photoIds = project.photos.filter((photo) => photo.id !== project.referencePhotoId).map((photo) => photo.id);
    dispatch({ type: "job/queued", photoIds });
    try {
      const result = await api.startApply(project.id);
      dispatch({ type: "job/started", jobId: result.jobId });
    } catch (error) {
      dispatch({ type: "job/failed", message: error.message });
    }
  }

  async function fixPhoto(photoId, mode) {
    dispatch({ type: "fix/started", photoId, mode });
    try {
      await api.fixPhoto(project.id, photoId, mode);
      dispatch({ type: "fix/finished", photoId });
      const photo = project.photos.find((item) => item.id === photoId);
      toast({ title: `Photo ${photo.n} passes every check`, description: "It's added to the export." });
    } catch (error) {
      dispatch({ type: "fix/failed", message: error.message });
    }
  }

  async function exportPhotos(photoIds, sizeIds) {
    try {
      const { files } = await api.exportPhotos(project.id, { photoIds, sizes: sizeIds });
      toast({
        title: `Exporting ${files} files`,
        description: `${photoIds.length} photos in ${sizeIds.length} ${sizeIds.length === 1 ? "size" : "sizes"}`,
        progressMs: EXPORT_PROGRESS_MS,
      });
    } catch (error) {
      toast({ title: "The export didn't start", description: error.message });
    }
  }

  return { state, dispatch, startApply, fixPhoto, exportPhotos };
}
