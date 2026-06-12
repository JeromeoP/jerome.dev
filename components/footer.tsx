"use client";

import { useState } from "react";
import { scrollToTarget } from "@/lib/scroll";
import { useStockholmTime } from "@/lib/use-stockholm-time";

const messages = [
  "Built on a Sunday",
  "Actually it was a Saturday",
  "Okay fine, it was a Wednesday",
  "Stop clicking",
  "Seriously",
  "...you're still here?",
  "Fine. The Konami code does something.",
];

export function Footer() {
  const [clicks, setClicks] = useState(0);
  const time = useStockholmTime();
  const message = messages[Math.min(clicks, messages.length - 1)];

  return (
    <footer className="border-t border-border px-8 py-6 max-md:px-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-10 gap-y-3 font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">
        <span>© {new Date().getFullYear()} Jerome Planken</span>

        <button
          type="button"
          title="Try the Konami code"
          onClick={() => setClicks((c) => c + 1)}
          className="transition-colors duration-300 hover:text-accent"
        >
          {message}
        </button>

        <span className="max-md:hidden" suppressHydrationWarning>
          Stockholm, SE — {time ?? "--:--"} CET
        </span>

        <button
          type="button"
          onClick={() => scrollToTarget(0)}
          className="transition-colors duration-300 hover:text-accent"
          aria-label="Back to top"
        >
          Back to top ↑
        </button>
      </div>
    </footer>
  );
}
