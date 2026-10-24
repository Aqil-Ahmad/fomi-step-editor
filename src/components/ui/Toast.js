"use client";

import { createContext, useContext, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import styles from "./Toast.module.css";

const ToastContext = createContext(null);

const DEFAULT_DURATION = 3200;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  function dismiss(id) {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }

  function show({ title, description, progressMs, duration = DEFAULT_DURATION }) {
    nextId.current += 1;
    const id = nextId.current;
    setToasts((current) => [...current, { id, title, description, progressMs }]);
    setTimeout(() => dismiss(id), (progressMs ?? 0) + duration);
    return id;
  }

  return (
    <ToastContext value={show}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-20 z-50 flex flex-col items-center gap-2 md:inset-x-auto md:right-6 md:bottom-6 md:items-end"
      >
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.22, ease: [0.2, 0.8, 0.2, 1] } }}
              exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.14, ease: [0.4, 0, 1, 1] } }}
              className="pointer-events-auto w-full max-w-88 rounded-card bg-ink p-3.5 pr-10 text-white shadow-float"
            >
              <p className="text-ui font-semibold">{toast.title}</p>
              {toast.description && <p className="mt-0.5 text-caption text-white/70">{toast.description}</p>}
              {toast.progressMs && (
                <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-white/20">
                  <div className={styles.progress} style={{ "--toast-progress-ms": `${toast.progressMs}ms` }} />
                </div>
              )}
              <button
                type="button"
                aria-label="Dismiss"
                onClick={() => dismiss(toast.id)}
                className="absolute top-2.5 right-2.5 grid size-7 place-items-center rounded-control text-white/70 hover:bg-white/10 hover:text-white"
              >
                <X aria-hidden="true" size={14} strokeWidth={2.4} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext>
  );
}

export function useToast() {
  const show = useContext(ToastContext);
  if (!show) throw new Error("useToast must be used inside ToastProvider");
  return show;
}
