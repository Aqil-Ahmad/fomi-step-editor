"use client";

import { AnimatePresence, motion } from "motion/react";

export function CountUp({ value }) {
  return (
    <span className="relative inline-grid overflow-hidden align-bottom">
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={value}
          initial={{ y: "60%", opacity: 0 }}
          animate={{ y: 0, opacity: 1, transition: { duration: 0.22, ease: [0.2, 0.8, 0.2, 1] } }}
          exit={{ y: "-60%", opacity: 0, transition: { duration: 0.14, ease: [0.4, 0, 1, 1] } }}
          className="col-start-1 row-start-1"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
