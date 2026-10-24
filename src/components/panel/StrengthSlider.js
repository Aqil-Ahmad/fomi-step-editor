"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/cn";
import styles from "./StrengthSlider.module.css";

export function StrengthSlider({ value, onPreview, onCommit, disabled, className }) {
  const [draft, setDraft] = useState(null);
  const id = useId();
  const current = draft ?? value;
  const percent = Math.round(current * 100);

  function preview(next) {
    setDraft(next);
    onPreview(next);
  }

  function commit() {
    if (draft === null) return;
    onCommit(value, draft);
    setDraft(null);
  }

  return (
    <div className={cn("grid grid-cols-[62px_1fr_38px] items-center gap-2.5 text-caption text-ink-2", className)}>
      <label htmlFor={id}>Strength</label>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        step={1}
        value={percent}
        disabled={disabled}
        aria-valuetext={`${percent}%`}
        onChange={(event) => preview(Number(event.target.value) / 100)}
        onPointerUp={commit}
        onKeyUp={commit}
        onBlur={commit}
        className={styles.slider}
        style={{ "--fill": `${percent}%` }}
      />
      <output htmlFor={id} className="text-right font-semibold text-ink">
        {percent}%
      </output>
    </div>
  );
}
