"use client";

import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import styles from "./Sheet.module.css";

export function Sheet({ open, onClose, title, side = "bottom", className, children }) {
  const dialogRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function handleClick(event) {
    if (event.target === dialogRef.current) onClose();
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={handleClick}
      className={cn(styles.sheet, styles[side], className)}
    >
      <div className={styles.body}>
        <header className="flex items-center justify-between gap-3 border-b border-line-2 px-5 py-3">
          <h2 id={titleId} className="text-lg font-bold">
            {title}
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="grid size-11 place-items-center rounded-control text-ink-2 hover:bg-ink/5 hover:text-ink"
          >
            <X aria-hidden="true" size={18} strokeWidth={2.2} />
          </button>
        </header>
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">{children}</div>
      </div>
    </dialog>
  );
}
