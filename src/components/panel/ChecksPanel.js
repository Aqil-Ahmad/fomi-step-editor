import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { PanelSection } from "./PanelSection";
import styles from "./ChecksPanel.module.css";

function summaryFor({ status, results }) {
  const failing = results.filter((check) => check.status === "fail").length;
  if (status === "running") return { text: "Checking…", tone: "text-muted" };
  if (status === "error") return { text: "Didn't run", tone: "text-drift" };
  if (failing > 0) return { text: `${failing} needs a fix`, tone: "text-drift" };
  return { text: "All passed", tone: "text-pass" };
}

function announcementFor({ status, results }) {
  const failing = results.filter((check) => check.status === "fail").length;
  if (status === "running") return "Running checks";
  if (status === "error") return "Checks didn't run";
  if (failing > 0) return `${failing} check needs a fix`;
  return "All checks passed";
}

export function ChecksPanel({ title, checks, emptyText, onRetry, onFix, fixing }) {
  const summary = summaryFor(checks);

  return (
    <PanelSection
      title={title}
      action={checks.results.length > 0 && <span className={cn("text-sm font-semibold", summary.tone)}>{summary.text}</span>}
    >
      <p className="sr-only" aria-live="polite">
        {checks.results.length > 0 ? announcementFor(checks) : ""}
      </p>

      {checks.results.length === 0 && <p className="py-2 text-sm text-muted">{emptyText}</p>}

      {checks.status === "error" && (
        <div role="alert" className="mb-2 flex items-center justify-between gap-3 rounded-control bg-drift-bg px-3 py-2 text-sm text-drift">
          {checks.error}
          <Button variant="line" size="sm" onClick={onRetry}>
            Try again
          </Button>
        </div>
      )}

      <ul className="divide-y divide-line-2">
        {checks.results.map((check, index) => {
          const pending = checks.status === "running";
          const failed = !pending && check.status === "fail";

          return (
            <li
              key={`${checks.runId}:${check.id}`}
              className={cn(styles.row, pending && styles.pending)}
              style={{ "--i": index }}
            >
              <div className="flex items-center gap-2.5 py-2.25 text-ui">
                <span
                  aria-hidden="true"
                  className={cn(
                    "grid size-5 shrink-0 place-items-center rounded-full",
                    pending && "border-[1.5px] border-dashed border-input",
                    !pending && !failed && "bg-pass-bg text-pass",
                    failed && "bg-drift-bg text-xs font-black text-drift",
                  )}
                >
                  {!pending && (failed ? "!" : <Check size={11} strokeWidth={3.6} />)}
                </span>
                <span className={cn("flex-1", pending && "text-ink-2")}>{check.title}</span>
                <span className={cn("text-caption", failed ? "font-semibold text-drift" : "text-muted")}>
                  {pending ? "" : check.detail}
                </span>
              </div>
              {failed && (
                <div className="mb-2.5 ml-7.5 rounded-control bg-drift-bg p-2.5 text-sm text-drift">
                  <p>{check.reason}</p>
                  {check.fix && onFix && (
                    <Button variant="ink" size="sm" className="mt-2" disabled={fixing} onClick={() => onFix(check)}>
                      {fixing ? "Fixing…" : check.fix}
                    </Button>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </PanelSection>
  );
}
