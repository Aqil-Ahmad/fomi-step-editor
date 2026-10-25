import { boundingBox, clampBox, pointInPolygon } from "./geometry";

export const HIT_ORDER = ["label", "bottle", "stones"];
export const FALLBACK_REGION = "backdrop";
export const WHOLE_PHOTO = "whole";

const OBJECT_ORDER = ["backdrop", "bottle", "label", "stones"];

export function photoPolygons(outlines, photoId, customRegions = []) {
  const shapes = outlines.photos[photoId] ?? {};
  const polygons = Object.fromEntries(HIT_ORDER.filter((id) => shapes[id]).map((id) => [id, shapes[id]]));
  for (const region of customRegions) polygons[region.id] = region.polygon;
  return polygons;
}

export function hitTest(point, polygons, customRegions = []) {
  const order = [...customRegions.map((region) => region.id).reverse(), ...HIT_ORDER];
  return order.find((id) => polygons[id] && pointInPolygon(point, polygons[id])) ?? FALLBACK_REGION;
}

export function regionLabel(regionNames, customRegions, id) {
  return regionNames[id] ?? customRegions.find((region) => region.id === id)?.label ?? id;
}

export function objectList(regionNames, customRegions) {
  return [
    ...OBJECT_ORDER.map((id) => ({ id, label: regionNames[id] })),
    ...customRegions.map((region) => ({ id: region.id, label: region.label })),
  ];
}

export function regionAnchor(region, polygons) {
  const polygon = polygons[region];
  if (!polygon) return { fullFrame: true, x0: 0, y0: 0, x1: 1, y1: 1, cy: 0.5 };
  const box = clampBox(boundingBox(polygon));
  return { fullFrame: false, ...box, cy: (box.y0 + box.y1) / 2 };
}
