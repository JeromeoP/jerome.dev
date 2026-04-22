"use client";

import { useEffect, useState } from "react";

export function TimeWidget() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    function update() {
      const now = new Date();
      const opts: Intl.DateTimeFormatOptions = {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Stockholm",
        hour12: false,
      };
      setTime(`${now.toLocaleTimeString("en-SE", opts)} CET`);
    }
    update();
    const id = setInterval(update, 10_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl border border-border px-4 py-2.5 font-mono text-xs text-text-secondary backdrop-blur-md max-md:hidden"
      style={{
        background: "color-mix(in srgb, var(--bg-card) 80%, transparent)",
      }}
      aria-label="Local time in Stockholm"
    >
      <div className="animate-pulse-dot h-1.5 w-1.5 rounded-full bg-emerald-500" />
      <span>{time ?? "--:-- CET"}</span>
    </div>
  );
}
