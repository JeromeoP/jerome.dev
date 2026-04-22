"use client";

import { useState } from "react";

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
  const message = messages[Math.min(clicks, messages.length - 1)];

  return (
    <footer className="border-t border-border px-12 py-10 text-center text-xs text-text-muted max-md:px-6">
      <p>
        © {new Date().getFullYear()} Jerome Planken ·{" "}
        <span
          role="button"
          tabIndex={0}
          title="Try the Konami code"
          onClick={() => setClicks((c) => c + 1)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setClicks((c) => c + 1);
            }
          }}
          className="cursor-pointer transition-colors duration-200 hover:text-accent"
        >
          {message}
        </span>
      </p>
    </footer>
  );
}
