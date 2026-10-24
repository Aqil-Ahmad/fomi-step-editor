"use client";

import { useEffect, useId, useRef, useState } from "react";
import { motion } from "motion/react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

export function LockNotice({ lock, onUnlock, onClose, className, style }) {
  const [confirming, setConfirming] = useState(false);
  const dialogRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  function handleKeyDown(event) {
    if (event.key !== "Escape") return;
    event.preventDefault();
    event.stopPropagation();
    onClose();
  }

  return (
    <motion.div
      ref={dialogRef}
      role="dialog"
      aria-labelledby={titleId}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1, transition: { duration: 0.2, ease: [0.2, 0.8, 0.2, 1] } }}
      exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.14, ease: [0.4, 0, 1, 1] } }}
      className={cn(
        "w-60 origin-top-left rounded-card border border-edge bg-white p-3.5 text-sm shadow-float outline-none",
        className,
      )}
      style={style}
    >
      <p id={titleId} className="flex items-center gap-1.5 text-ui font-bold">
        <Lock aria-hidden="true" size={13} strokeWidth={2.4} />
        {lock.title} is locked
      </p>
      <p className="mt-1 text-ink-2">
        {confirming
          ? `Unlock ${lock.title.toLowerCase()}? Steps will be able to change it and its check stops running.`
          : "Steps can't change it, and it's checked after every step."}
      </p>
      <div className="mt-3 flex gap-1.5">
        {confirming ? (
          <>
            <Button variant="ink" size="sm" onClick={onUnlock}>
              Unlock
            </Button>
            <Button variant="line" size="sm" onClick={() => setConfirming(false)}>
              Keep locked
            </Button>
          </>
        ) : (
          <>
            <Button variant="line" size="sm" onClick={() => setConfirming(true)}>
              Unlock…
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          </>
        )}
      </div>
    </motion.div>
  );
}
