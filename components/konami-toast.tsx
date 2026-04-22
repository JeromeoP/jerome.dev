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
      className={`pointer-events-none fixed bottom-20 left-1/2 z-[300] -translate-x-1/2 whitespace-nowrap rounded-xl bg-[#1a1a2e] px-6 py-3 text-sm font-medium text-white shadow-lg ring-1 ring-white/10 transition-all duration-[400ms] ease-out ${
        show ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
      }`}
    >
      {message ?? ""}
    </div>
  );
}
