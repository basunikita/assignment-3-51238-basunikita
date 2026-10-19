"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import Button from "../design-system/components/Button";

const TOAST_MS = 8000;

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

  const show = useCallback<ShowToast>((message, undo) => {
    setToast({ id: Date.now(), message, undo });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast((current) => (current?.id === toast.id ? null : current)), TOAST_MS);
    return () => clearTimeout(timeout);
  }, [toast]);

  return (
    <ToastContext value={show}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-30 px-4">
        <div role="status" aria-live="polite" className="mx-auto max-w-[560px]">
          {toast && (
            <div className="pointer-events-auto flex items-center justify-between gap-3 border-2 border-ink bg-ink p-3 font-bold text-(--swatch-panel) shadow-[2px_2px_0_var(--swatch-ink)]">
              <p>{toast.message}</p>
              {toast.undo && (
                <Button
                  variant="secondary"
                  className="shrink-0 px-3 py-1 text-base"
                  onClick={() => {
                    toast.undo?.();
                    setToast(null);
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
