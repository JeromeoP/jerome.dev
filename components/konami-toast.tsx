"use client";

import { useEffect, useState } from "react";

interface KonamiToastProps {
  message: string | null;
  onDismiss: () => void;
}

export function KonamiToast({ message, onDismiss }: KonamiToastProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!message) {
      setShow(false);
      return;
    }
    setShow(true);
    const id = setTimeout(() => {
      setShow(false);
      setTimeout(onDismiss, 400);
    }, 2500);
    return () => clearTimeout(id);
  }, [message, onDismiss]);

  return (
    <div
      className={`pointer-events-none fixed bottom-16 left-1/2 z-[320] flex -translate-x-1/2 items-center gap-3 whitespace-nowrap border border-border bg-bg-card px-5 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-text-primary transition-all duration-[400ms] ease-out ${
        show ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
      role="status"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
      {message ?? ""}
    </div>
  );
}
