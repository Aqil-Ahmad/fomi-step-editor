"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/cn";
import { toClipPath } from "@/lib/geometry";
import { FALLBACK_REGION, WHOLE_PHOTO } from "@/lib/regions";
import { strengthOpacity } from "@/lib/variants";
import styles from "./PhotoStack.module.css";

const CROSSFADE = { duration: 0.3, ease: "easeOut" };

export const CANVAS_SIZES = "(min-width: 1536px) 760px, (min-width: 768px) 640px, calc(100vw - 80px)";

function AdjustmentLayer({ adjustment, src, polygons }) {
  const { region, filter } = adjustment;
  const isFullFrame = region === WHOLE_PHOTO || region === FALLBACK_REGION;
  const clip = isFullFrame ? undefined : polygons[region] && toClipPath(polygons[region]);
  const protectedShapes = region === FALLBACK_REGION ? Object.values(polygons) : [];

  return (
    <div className={styles.layer} style={{ opacity: strengthOpacity(adjustment) }}>
      <Image src={src} alt="" fill sizes={CANVAS_SIZES} className={styles.image} style={{ filter, clipPath: clip }} />
      {protectedShapes.map((polygon, index) => (
        <Image key={index} src={src} alt="" fill sizes={CANVAS_SIZES} className={styles.image} style={{ clipPath: toClipPath(polygon) }} />
      ))}
    </div>
  );
}

export function PhotoStack({ composition, polygons, alt, priority = false, className }) {
  const { layers, adjustments, overlays, topSrc } = composition;

  return (
    <div className={cn(styles.stack, className)}>
      <AnimatePresence initial={false}>
        {layers.map((layer, index) => (
          <motion.div
            key={layer.src}
            className={styles.layer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={CROSSFADE}
          >
            <Image
              src={layer.src}
              alt={index === 0 ? alt : ""}
              fill
              sizes={CANVAS_SIZES}
              priority={priority && index === 0}
              className={styles.image}
              style={{ opacity: strengthOpacity(layer) }}
            />
          </motion.div>
        ))}
        {adjustments.map((adjustment) => (
          <motion.div
            key={`${adjustment.id}:${adjustment.filter}:${topSrc}`}
            className={styles.layer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={CROSSFADE}
          >
            <AdjustmentLayer adjustment={adjustment} src={topSrc} polygons={polygons} />
          </motion.div>
        ))}
        {overlays.map((overlay) => (
          <motion.div
            key={overlay.id}
            className={styles.layer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={CROSSFADE}
          >
            <Image src={overlay.src} alt="" fill sizes={CANVAS_SIZES} className={styles.image} style={{ opacity: strengthOpacity(overlay) }} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function StaticPhoto({ src, alt, priority = false, className }) {
  return (
    <div className={cn(styles.stack, className)}>
      <AnimatePresence initial={false}>
        <motion.div
          key={src}
          className={styles.layer}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={CROSSFADE}
        >
          <Image src={src} alt={alt} fill priority={priority} sizes={CANVAS_SIZES} className={styles.image} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
