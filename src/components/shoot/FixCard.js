"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { boundingBox, clampBox } from "@/lib/geometry";
import styles from "./FixCard.module.css";

const LABEL_FILL = 0.9;
const CROP_SIZES = "(min-width: 1024px) 40vw, 90vw";

function zoomVars(outline) {
  const label = clampBox(boundingBox(outline.label));
  const letter = boundingBox(outline.letterChanged);
  return {
    "--zoom": LABEL_FILL / (label.x1 - label.x0),
    "--cx": (label.x0 + label.x1) / 2,
    "--cy": (label.y0 + label.y1) / 2,
    "--lx0": letter.x0,
    "--ly0": letter.y0,
    "--lx1": letter.x1,
    "--ly1": letter.y1,
  };
}

export function FixCard({ photo, plan, outline, stepNumber, fixing, error, onFix, onOpen }) {
  const vars = zoomVars(outline);
  const busy = Boolean(fixing);

  return (
    <motion.section
      layout
      aria-labelledby="fix-heading"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.24, ease: [0.2, 0.8, 0.2, 1] } }}
      exit={{ opacity: 0, y: 8, transition: { duration: 0.16, ease: [0.4, 0, 1, 1] } }}
      className={styles.card}
      style={vars}
    >
      <figure className={styles.crop}>
        <Image src={photo.orig} alt={`Photo ${photo.n}, locked label from the original`} width={1216} height={1520} sizes={CROP_SIZES} className={styles.cropImage} />
        <figcaption className={styles.caption}>
          <Lock aria-hidden="true" size={12} strokeWidth={2.4} />
          Locked label
        </figcaption>
      </figure>

      <figure className={styles.crop}>
        <Image src={plan.file} alt={`Photo ${photo.n}, label after step ${stepNumber} with the changed letter`} width={1216} height={1520} sizes={CROP_SIZES} className={styles.cropImage} />
        <figcaption className={styles.caption}>After step {stepNumber}</figcaption>
        <span aria-hidden="true" className={styles.letterBox} />
      </figure>

      <div className={cn(styles.details, "flex flex-col pt-1")}>
        <span className="self-start rounded-chip bg-drift-bg px-2 py-1 text-xs font-bold text-drift-ink">
          Photo {photo.n} needs a fix
        </span>
        <h2 id="fix-heading" className="mt-3 mb-1.5 text-title font-heavy tracking-heading">
          {plan.headline}
        </h2>
        <p className="text-ui leading-normal text-ink-2">
          {plan.reason} {plan.explanation}
        </p>
        {error && (
          <p role="alert" className="mt-3 text-sm font-semibold text-drift-ink">
            {error}
          </p>
        )}
        <div className="mt-auto flex flex-wrap gap-2 pt-4">
          <Button variant="ink" disabled={busy} aria-busy={fixing?.mode === "restore"} onClick={() => onFix("restore")}>
            {fixing?.mode === "restore" ? "Restoring…" : plan.fix}
          </Button>
          <Button variant="line" disabled={busy} aria-busy={fixing?.mode === "rerun"} onClick={() => onFix("rerun")}>
            {fixing?.mode === "rerun" ? `Re-running step ${stepNumber}…` : `Re-run step ${stepNumber}`}
          </Button>
          <Button variant="ghost" onClick={onOpen}>
            Open
          </Button>
        </div>
      </div>
    </motion.section>
  );
}
