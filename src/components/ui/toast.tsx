"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { Bell, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastInput = {
  title?: string;
  message: string;
  href?: string;
  duration?: number;
};
type Toast = ToastInput & { id: number };

const ToastContext = createContext<(t: ToastInput) => void>(() => {});

/** Déclenche un toast : `toast({ title, message, href })`. */
export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const remove = useCallback(
    (id: number) => setToasts((l) => l.filter((t) => t.id !== id)),
    [],
  );
  const push = useCallback(
    (t: ToastInput) => {
      const id = ++idRef.current;
      setToasts((l) => [...l, { id, ...t }].slice(-4));
      window.setTimeout(() => remove(id), t.duration ?? 6000);
    },
    [remove],
  );

  return (
    <ToastContext.Provider value={push}>
      {children}
      <Toaster toasts={toasts} onClose={remove} />
    </ToastContext.Provider>
  );
}

function Toaster({
  toasts,
  onClose,
}: {
  toasts: Toast[];
  onClose: (id: number) => void;
}) {
  const router = useRouter();

  return (
    <div className="pointer-events-none fixed inset-x-4 top-4 z-[100] flex flex-col gap-2 sm:left-auto sm:right-4 sm:w-96">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          onClick={() => {
            if (t.href) router.push(t.href);
            onClose(t.id);
          }}
          className={cn(
            "pointer-events-auto flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-card p-3 shadow-lg ring-1 ring-foreground/5 transition-transform hover:-translate-y-0.5",
            "animate-in fade-in slide-in-from-top-2",
          )}
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Bell className="size-4.5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            {t.title && (
              <p className="text-sm font-semibold text-foreground">{t.title}</p>
            )}
            <p className="text-sm text-muted-foreground">{t.message}</p>
            {t.href && (
              <p className="mt-0.5 text-xs font-medium text-primary">Voir →</p>
            )}
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose(t.id);
            }}
            aria-label="Fermer"
            className="-mr-1 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );
}
