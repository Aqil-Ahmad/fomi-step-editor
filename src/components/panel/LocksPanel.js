"use client";

import { useState } from "react";
import { Lock, LockOpen } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { useEditorState, useWorkspace } from "@/state/WorkspaceProvider";
import { PanelSection } from "./PanelSection";

export function LocksPanel({ onHighlight }) {
  const { dispatch } = useWorkspace();
  const state = useEditorState();
  const [confirmingId, setConfirmingId] = useState(null);
  const { locks } = state.doc;
  const lockMode = state.tool === "lock";

  function unlock(lock) {
    dispatch({ type: "lock/remove", lockId: lock.id });
    setConfirmingId(null);
    onHighlight(null);
  }

  return (
    <PanelSection
      title="Locked"
      count={locks.length}
      action={
        <Button
          variant="ghost"
          aria-pressed={lockMode}
          onClick={() => dispatch({ type: "tool/set", tool: lockMode ? "select" : "lock" })}
          className="h-7.5 px-1.5 aria-pressed:bg-ink aria-pressed:text-white aria-pressed:hover:bg-ink-hover"
        >
          {lockMode ? "Done locking" : "Lock an area"}
        </Button>
      }
    >
      {locks.length === 0 ? (
        <p className="py-2 text-sm text-muted">Nothing is locked. Lock the label or product so steps can&apos;t change them.</p>
      ) : (
        <ul className="divide-y divide-line-2">
          {locks.map((lock) => (
            <li
              key={lock.id}
              onPointerEnter={() => onHighlight(lock.region)}
              onPointerLeave={() => onHighlight(null)}
              onFocus={() => onHighlight(lock.region)}
              onBlur={() => onHighlight(null)}
              className="group grid grid-cols-[22px_1fr_auto] items-start gap-x-2.5 py-2"
            >
              <Lock aria-hidden="true" size={18} strokeWidth={2} className="mt-0.5" />
              <div>
                <p className="text-base font-semibold">{lock.title}</p>
                <p className="text-caption text-muted">{lock.detail}</p>
                {confirmingId === lock.id && (
                  <div role="alert" className="mt-2 rounded-control bg-drift-bg p-2.5 text-sm text-drift">
                    <p>Unlock {lock.title.toLowerCase()}? Steps will be able to change it and its check stops running.</p>
                    <div className="mt-2 flex gap-1.5">
                      <Button variant="ink" size="sm" onClick={() => unlock(lock)}>
                        Unlock
                      </Button>
                      <Button variant="line" size="sm" onClick={() => setConfirmingId(null)}>
                        Keep locked
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              <IconButton
                label={`Unlock ${lock.title.toLowerCase()}`}
                tooltipSide="left"
                onClick={() => setConfirmingId(lock.id)}
                className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 pointer-coarse:opacity-100"
              >
                <LockOpen aria-hidden="true" size={15} strokeWidth={2} />
              </IconButton>
            </li>
          ))}
        </ul>
      )}
    </PanelSection>
  );
}
