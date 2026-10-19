"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import Button from "../design-system/components/Button";

// Plain confirmations go quickly; toasts with Undo stay longer so there's time to reach the button.
const TOAST_MS = 4000;
const UNDO_TOAST_MS = 8000;

type Toast = { id: number; message: string; undo?: () => void };
type ShowToast = (message: string, undo?: () => void) => void;

const ToastContext = createContext<ShowToast | null>(null);

export function useToast(): ShowToast {
  const show = useContext(ToastContext);
  if (!show) throw new Error("useToast must be used inside a ToastProvider");
  return show;
}

// One toast at a time, above the tab bar. It lives in the layout, so it survives navigation
// (Finish workout goes to Today and still shows "Workout saved").
export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const [paused, setPaused] = useState(false);
  const undoButton = useRef<HTMLButtonElement>(null);

  const show = useCallback<ShowToast>((message, undo) => {
    setToast({ id: Date.now(), message, undo });
  }, []);

  // The toast waits while someone is pointing at it or has focus in it.
  useEffect(() => {
    if (!toast || paused) return;
    const timeout = setTimeout(() => setToast((current) => (current?.id === toast.id ? null : current)), toast.undo ? UNDO_TOAST_MS : TOAST_MS);
    return () => clearTimeout(timeout);
  }, [toast, paused]);

  // Deleting removes the button that was pressed, which drops keyboard focus to the page.
  // Catch it on Undo, so a keyboard user can undo straight away.
  useEffect(() => {
    if (toast?.undo && (document.activeElement === document.body || document.activeElement === null)) undoButton.current?.focus();
  }, [toast]);

  return (
    <ToastContext value={show}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-40 z-30 px-4">
        <div role="status" aria-live="polite" className="mx-auto max-w-[560px]">
          {toast && (
            <div
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              onFocus={() => setPaused(true)}
              onBlur={() => setPaused(false)}
              className="pointer-events-auto flex items-center justify-between gap-3 border-2 border-ink bg-ink p-3 font-bold text-(--swatch-panel) shadow-[2px_2px_0_var(--swatch-ink)]"
            >
              <p>{toast.message}</p>
              {toast.undo && (
                <Button
                  ref={undoButton}
                  variant="secondary"
                  className="shrink-0 px-3 py-1 text-base"
                  onClick={() => {
                    toast.undo?.();
                    setToast(null);
                    setPaused(false);
                  }}
                >
                  Undo
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </ToastContext>
  );
}
