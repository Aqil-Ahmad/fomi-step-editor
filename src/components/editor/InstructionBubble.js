"use client";

import { useEffect, useId, useRef, useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/Button";
import { applySuggestion } from "@/lib/instructions";
import { cn } from "@/lib/cn";
import styles from "./InstructionBubble.module.css";

const DEFAULT_SUGGESTIONS = ["Lighter", "Warmer", "Softer"];

export function InstructionBubble({
  regionName,
  step,
  stepNumber,
  mode,
  processing,
  error,
  onSubmit,
  onClose,
  className,
  style,
}) {
  const [text, setText] = useState(step && mode === "update" ? step.instruction : "");
  const fieldRef = useRef(null);
  const titleId = useId();
  const primaryMode = step && mode === "update" ? "update" : "new";
  const suggestions = step?.suggestions ?? DEFAULT_SUGGESTIONS;
  const canSubmit = text.trim().length > 0 && !processing;

  useEffect(() => {
    const previous = document.activeElement;
    const field = fieldRef.current;
    field?.focus();
    field?.setSelectionRange(field.value.length, field.value.length);

    return () => {
      if (previous instanceof HTMLElement && previous !== document.body && previous.isConnected) {
        previous.focus({ preventScroll: true });
      }
    };
  }, []);

  function submit(submitMode) {
    if (canSubmit) onSubmit(submitMode, text.trim());
  }

  function handleKeyDown(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    } else if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit(primaryMode);
    }
  }

  return (
    <motion.section
      role="dialog"
      aria-labelledby={titleId}
      onKeyDown={handleKeyDown}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1, transition: { duration: 0.2, ease: [0.2, 0.8, 0.2, 1] } }}
      exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.14, ease: [0.4, 0, 1, 1] } }}
      className={cn(styles.bubble, className)}
      style={style}
    >
      <header className="flex items-center gap-2 text-ui font-bold">
        <span aria-hidden="true" className="size-2 rounded-full bg-marker" />
        <h2 id={titleId}>{regionName}</h2>
        <span className="ml-auto text-caption font-medium text-muted">
          {primaryMode === "update" ? `Step ${stepNumber}` : "New step"}
        </span>
      </header>

      <label className="sr-only" htmlFor={`${titleId}-field`}>
        Instruction for {regionName.toLowerCase()}
      </label>
      <textarea
        id={`${titleId}-field`}
        ref={fieldRef}
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={2}
        maxLength={280}
        placeholder={`What should change on the ${regionName.toLowerCase()}?`}
        disabled={processing}
        className={styles.field}
      />

      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            disabled={processing}
            onClick={() => {
              setText((current) => applySuggestion(current, suggestion));
              fieldRef.current?.focus();
            }}
            className="h-6.5 rounded-chip bg-chip px-2.25 text-caption font-medium text-ink-2 transition-colors duration-150 hover:bg-segment hover:text-ink active:scale-98 disabled:opacity-50 pointer-coarse:h-9"
          >
            {suggestion}
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className="mt-2.5 rounded-control bg-drift-bg px-2.5 py-2 text-sm text-drift">
          {error}
        </p>
      )}

      <div className="mt-3 flex items-center gap-1.5">
        <Button
          variant="ink"
          size="sm"
          disabled={!canSubmit}
          aria-busy={processing}
          onClick={() => submit(primaryMode)}
          className={cn(processing && styles.processing)}
        >
          {processing ? "Updating…" : error ? "Try again" : primaryMode === "update" ? "Update step" : "New step"}
        </Button>
        {primaryMode === "update" && (
          <Button variant="line" size="sm" disabled={!canSubmit} onClick={() => submit("new")}>
            New step
          </Button>
        )}
        <kbd className="ml-auto font-sans text-2xs font-medium text-muted pointer-coarse:hidden">Enter</kbd>
      </div>
    </motion.section>
  );
}
