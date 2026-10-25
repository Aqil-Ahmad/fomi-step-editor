import project from "@/data/project.json";
import outlines from "@/data/outlines.json";

export function getProject(id) {
  return id === project.id ? project : null;
}

export function getOutlines() {
  return outlines;
}

export function getProjectIds() {
  return [project.id];
}
