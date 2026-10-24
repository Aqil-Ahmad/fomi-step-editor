"use client";

import { useEffect } from "react";
import { readStored, writeStored } from "@/lib/storage";

export function useRememberedView(projectId, { view, photoId }) {
  const key = `view:${projectId}`;

  useEffect(() => {
    if (window.location.search) return;
    const saved = readStored(key, null);
    if (!saved) return;
    const params = new URLSearchParams();
    if (saved.view === "shoot") params.set("view", "shoot");
    if (saved.photoId) params.set("photo", saved.photoId);
    const query = params.toString();
    if (query) window.history.replaceState(null, "", `?${query}`);
  }, [key]);

  useEffect(() => {
    writeStored(key, { view, photoId });
  }, [key, view, photoId]);
}
