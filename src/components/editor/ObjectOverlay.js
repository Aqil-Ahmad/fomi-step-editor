import { Lock } from "lucide-react";
import { cn } from "@/lib/cn";
import { toPercent, toSvgPath } from "@/lib/geometry";
import { regionAnchor } from "@/lib/regions";
import styles from "./ObjectOverlay.module.css";

const FULL_FRAME_PATH = "M0.4 0.4H99.6V124.6H0.4Z";

function outlinePath(region, polygons) {
  return polygons[region] ? toSvgPath(polygons[region]) : FULL_FRAME_PATH;
}

function anchorStyle({ x0, y0, x1 }) {
  return { "--x0": toPercent(x0), "--y0": toPercent(y0), "--x1": toPercent(x1) };
}

export function ObjectOverlay({ polygons, selection, selectionLabel, contentLocks, highlightRegion, hoverRegion }) {
  const selectionAnchor = selection && regionAnchor(selection, polygons);

  return (
    <>
      <svg className={styles.outlines} viewBox="0 0 100 125" preserveAspectRatio="none" aria-hidden="true">
        {contentLocks.map(
          (lock) =>
            polygons[lock.region] && (
              <path key={lock.id} d={toSvgPath(polygons[lock.region])} className={styles.lockOutline} />
            ),
        )}
        {highlightRegion && <path d={outlinePath(highlightRegion, polygons)} className={styles.highlightOutline} />}
        {hoverRegion && hoverRegion !== selection && (
          <path d={outlinePath(hoverRegion, polygons)} className={styles.hoverOutline} />
        )}
        {selection && <path d={outlinePath(selection, polygons)} className={styles.selectionOutline} />}
      </svg>

      {contentLocks.map((lock) => {
        if (!polygons[lock.region]) return null;
        return (
          <span key={lock.id} className={cn(styles.chip, styles.lockChip)} style={anchorStyle(regionAnchor(lock.region, polygons))}>
            <Lock aria-hidden="true" size={12} strokeWidth={2.4} />
            {lock.title} locked
          </span>
        );
      })}

      {selectionAnchor && (
        <span
          className={cn(styles.chip, styles.selectionChip, selectionAnchor.fullFrame && styles.selectionChipInside)}
          style={anchorStyle(selectionAnchor)}
        >
          {selectionLabel}
        </span>
      )}
    </>
  );
}
