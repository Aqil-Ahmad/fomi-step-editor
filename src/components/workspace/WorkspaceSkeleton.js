import { cn } from "@/lib/cn";
import styles from "./WorkspaceSkeleton.module.css";

function Block({ className }) {
  return <span className={cn(styles.block, className)} />;
}

export function WorkspaceSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading the project" className="grid h-dvh grid-rows-[56px_minmax(0,1fr)] overflow-hidden bg-studio">
      <div className="flex items-center gap-4.5 border-b border-line bg-panel pr-4 pl-5.5">
        <Block className="h-5 w-14" />
        <Block className="h-4 w-52" />
        <Block className="ml-auto h-9 w-40 max-md:hidden" />
        <Block className="h-9 w-20" />
      </div>
      <div className="grid min-h-0 grid-cols-[120px_minmax(0,1fr)_376px] max-lg:grid-cols-[minmax(0,1fr)]">
        <div className="grid content-start justify-items-center gap-3 border-r border-line bg-panel pt-12 max-lg:hidden">
          {Array.from({ length: 6 }, (_, index) => (
            <Block key={index} className="h-25.5 w-20.5" />
          ))}
        </div>
        <div className={styles.canvas}>
          <Block className={styles.photo} />
        </div>
        <div className="grid content-start gap-4 border-l border-line bg-panel px-5 pt-5 max-lg:hidden">
          <Block className="h-5 w-28" />
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="grid gap-2">
              <Block className="h-4 w-60" />
              <Block className="h-3 w-24" />
            </div>
          ))}
          <Block className="mt-4 h-5 w-24" />
          <Block className="h-10 w-full" />
          <Block className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}
