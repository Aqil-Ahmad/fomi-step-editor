import Image from "next/image";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import styles from "./Filmstrip.module.css";

export function Filmstrip({ photos, currentId, displayFor, onOpen, className }) {
  return (
    <nav aria-label="Shoot photos" className={cn(styles.strip, className)}>
      <h2 className="mb-3 ml-4.5 text-sm font-semibold text-ink-2">
        Shoot<span className="ml-1 font-regular text-muted">{photos.length}</span>
      </h2>
      <ol className={styles.list}>
        {photos.map((photo) => {
          const { status, src } = displayFor(photo);
          const hasLook = status === "ready";
          const isCurrent = photo.id === currentId;

          return (
            <li key={photo.id}>
              <button
                type="button"
                aria-current={isCurrent ? "true" : undefined}
                aria-label={`Photo ${photo.n}${hasLook ? ", look applied" : ""}${status === "drift" ? ", needs a fix" : ""}`}
                onClick={() => onOpen(photo.id)}
                className={styles.thumb}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="82px"
                  className="object-cover"
                />
                <span className="absolute bottom-1 left-1.25 text-2xs font-semibold text-white text-shadow-photo">
                  {photo.n}
                </span>
                {hasLook && (
                  <span className="absolute right-1 bottom-1 grid size-4 place-items-center rounded-full bg-white shadow-chip">
                    <Check aria-hidden="true" size={9} strokeWidth={4} className="text-pass" />
                  </span>
                )}
                {status === "drift" && (
                  <span className="absolute right-1 bottom-1 grid size-4 place-items-center rounded-full bg-drift text-2xs font-black text-white">
                    !
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
