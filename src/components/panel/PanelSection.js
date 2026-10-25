"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";

export function PanelSection({ title, count, action, className, children }) {
  const labelId = useId();

  return (
    <section aria-labelledby={labelId} className={cn("px-5 pt-4.5 pb-3.5", className)}>
      <div className="mb-2 flex min-h-7.5 items-center justify-between gap-3">
        <h2 id={labelId} className="text-lg font-bold">
          {title}
          {count !== undefined && <span className="ml-1.5 font-regular text-muted">{count}</span>}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}
