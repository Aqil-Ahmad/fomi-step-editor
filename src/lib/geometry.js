export const OVERLAY_WIDTH = 100;
export const OVERLAY_HEIGHT = 125;

export function pointInPolygon([x, y], polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    const crosses = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (crosses) inside = !inside;
  }
  return inside;
}

export function boundingBox(polygon) {
  return polygon.reduce(
    (box, [x, y]) => ({
      x0: Math.min(box.x0, x),
      y0: Math.min(box.y0, y),
      x1: Math.max(box.x1, x),
      y1: Math.max(box.y1, y),
    }),
    { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity },
  );
}

export function clampBox(box) {
  return {
    x0: Math.max(0, box.x0),
    y0: Math.max(0, box.y0),
    x1: Math.min(1, box.x1),
    y1: Math.min(1, box.y1),
  };
}

export function toPercent(value) {
  return `${(value * 100).toFixed(2)}%`;
}

export function toClipPath(polygon) {
  return `polygon(${polygon.map(([x, y]) => `${toPercent(x)} ${toPercent(y)}`).join(", ")})`;
}

export function toSvgPath(polygon) {
  const points = polygon.map(([x, y]) => `${(x * OVERLAY_WIDTH).toFixed(2)} ${(y * OVERLAY_HEIGHT).toFixed(2)}`);
  return `M${points.join("L")}Z`;
}

export function simplifyPath(points, minDistance) {
  return points.reduce((kept, point) => {
    const last = kept.at(-1);
    if (!last || Math.hypot(point[0] - last[0], point[1] - last[1]) >= minDistance) kept.push(point);
    return kept;
  }, []);
}
