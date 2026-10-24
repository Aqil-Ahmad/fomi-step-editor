import Image from "next/image";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { toPercent } from "@/lib/geometry";
import { isInProgress } from "@/lib/shoot";
import styles from "./PhotoTile.module.css";

const TILE_SIZES = "(min-width: 1536px) 14vw, (min-width: 1024px) 16vw, (min-width: 768px) 30vw, 50vw";

function describe(photo, entry, driftLabel, stepCount) {
  const states = {
    ready: "ready",
    drift: `${driftLabel.toLowerCase()}, needs a fix`,
    applying: `applying step ${entry.step} of ${stepCount}`,
    queued: "queued",
    original: "look not applied yet",
  };
  return `Photo ${photo.n}, ${states[entry.status]}`;
}

function StatusChip({ status, driftLabel }) {
  if (status === "ready") {
    return (
      <span className={cn(styles.chip, "text-pass")}>
        <Check aria-hidden="true" size={11} strokeWidth={3.6} />
        Ready
      </span>
    );
  }
  if (status === "drift") return <span className={cn(styles.chip, styles.driftChip)}>{driftLabel}</span>;
  if (status === "queued") return <span className={cn(styles.chip, "text-ink-2")}>Queued</span>;
  if (status === "original") return <span className={cn(styles.chip, "text-ink-2")}>Original</span>;
  return null;
}

export function PhotoTile({ photo, entry, resultSrc, labelBox, driftLabel, stepCount, onOpen }) {
  const { status } = entry;
  const revealed = status === "ready" || status === "drift";

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={describe(photo, entry, driftLabel, stepCount)}
      className={cn(styles.tile, status === "drift" && styles.flagged, isInProgress(status) && styles.busy)}
    >
      <Image src={photo.orig} alt="" fill sizes={TILE_SIZES} className={styles.image} />
      <Image
        src={resultSrc}
        alt=""
        fill
        sizes={TILE_SIZES}
        className={cn(styles.image, styles.result, revealed && styles.revealed)}
      />
      <span className={styles.number}>{photo.n}</span>

      {status === "drift" && labelBox && (
        <span
          aria-hidden="true"
          className={styles.labelBox}
          style={{
            "--x0": toPercent(labelBox.x0),
            "--y0": toPercent(labelBox.y0),
            "--x1": toPercent(labelBox.x1),
            "--y1": toPercent(labelBox.y1),
          }}
        />
      )}

      {status === "applying" ? (
        <span className={styles.progress}>
          <span className="mb-1.5 block text-xs font-semibold text-ink">
            Applying step {entry.step} of {stepCount}
          </span>
          <span className={styles.track}>
            <span className={styles.fill} style={{ "--progress": entry.progress }} />
          </span>
        </span>
      ) : (
        <StatusChip status={status} driftLabel={driftLabel} />
      )}
    </button>
  );
}
