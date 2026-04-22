"use client";

import { useCallback, useEffect, useState } from "react";
import { flushSync } from "react-dom";

interface Tile {
  id: string;
  label: string;
  emoji: string;
  from: string;
  to: string;
  description: string;
}

const TILES: Tile[] = [
  {
    id: "note",
    label: "Quick Note",
    emoji: "✍️",
    from: "#6366f1",
    to: "#818cf8",
    description:
      "A one-tap capture for the thought you'll forget in 30 seconds. Saves locally, no account.",
  },
  {
    id: "focus",
    label: "Focus Timer",
    emoji: "⏱",
    from: "#10b981",
    to: "#34d399",
    description:
      "A pomodoro that respects your real calendar. Auto-pauses if a meeting starts.",
  },
  {
    id: "weather",
    label: "Weather",
    emoji: "🌤",
    from: "#f59e0b",
    to: "#fbbf24",
    description:
      "Hourly, with a single honest recommendation: bring a jacket, or don't.",
  },
  {
    id: "space",
    label: "Night Sky",
    emoji: "🌌",
    from: "#8b5cf6",
    to: "#c4b5fd",
    description:
      "Point your phone at the sky. It tells you what you're looking at. No account, no ads.",
  },
];

export function ViewTransitions() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [supported, setSupported] = useState<boolean | null>(null);

  useEffect(() => {
    setSupported(typeof document.startViewTransition === "function");
  }, []);

  const runTransition = useCallback((update: () => void) => {
    if (typeof document.startViewTransition !== "function") {
      update();
      return;
    }
    document.startViewTransition(() => {
      flushSync(update);
    });
  }, []);

  const onOpen = useCallback(
    (id: string) => {
      runTransition(() => setActiveId(id));
    },
    [runTransition],
  );

  const onClose = useCallback(() => {
    runTransition(() => setActiveId(null));
  }, [runTransition]);

  const activeTile = TILES.find((t) => t.id === activeId) ?? null;

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="relative min-h-[220px] overflow-hidden rounded-lg border border-border bg-bg p-4">
        {activeTile ? (
          <div className="flex h-full flex-col gap-4">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex w-fit items-center gap-1 font-mono text-xs text-text-muted transition-colors hover:text-accent"
            >
              ← back
            </button>
            <div
              className="flex flex-col gap-3 rounded-xl p-5"
              style={{
                background: `linear-gradient(135deg, ${activeTile.from}, ${activeTile.to})`,
                viewTransitionName: `vt-${activeTile.id}`,
              }}
            >
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="text-2xl"
                  style={{ viewTransitionName: `vt-emoji-${activeTile.id}` }}
                >
                  {activeTile.emoji}
                </span>
                <h4
                  className="font-display text-lg font-semibold text-white"
                  style={{ viewTransitionName: `vt-label-${activeTile.id}` }}
                >
                  {activeTile.label}
                </h4>
              </div>
              <p className="text-sm leading-[1.5] text-white/90">
                {activeTile.description}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {TILES.map((tile) => (
              <button
                key={tile.id}
                type="button"
                onClick={() => onOpen(tile.id)}
                className="group relative flex aspect-square flex-col items-start justify-between overflow-hidden rounded-xl p-3 text-left transition-transform duration-200 hover:scale-[1.02]"
                style={{
                  background: `linear-gradient(135deg, ${tile.from}, ${tile.to})`,
                  viewTransitionName: `vt-${tile.id}`,
                }}
              >
                <span
                  aria-hidden="true"
                  className="text-2xl"
                  style={{ viewTransitionName: `vt-emoji-${tile.id}` }}
                >
                  {tile.emoji}
                </span>
                <span
                  className="font-display text-sm font-semibold text-white"
                  style={{ viewTransitionName: `vt-label-${tile.id}` }}
                >
                  {tile.label}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
      <p className="text-[11px] leading-[1.5] text-text-muted">
        Click a tile. The layout morphs using{" "}
        <code className="font-mono text-text-secondary">
          document.startViewTransition()
        </code>{" "}
        —{" "}
        {supported === null
          ? "checking support…"
          : supported
            ? "your browser supports it"
            : "your browser doesn't support it yet, falling back to a plain swap"}
        .
      </p>
    </div>
  );
}
