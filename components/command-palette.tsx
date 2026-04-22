"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { commands, type PaletteContext } from "@/lib/commands";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  context: PaletteContext;
}

export function CommandPalette({
  isOpen,
  onClose,
  context,
}: CommandPaletteProps) {
  const [filter, setFilter] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const filtered = useMemo(() => {
    const query = filter.trim().toLowerCase();
    if (!query) return commands;
    return commands.filter((c) => c.label.toLowerCase().includes(query));
  }, [filter]);

  useEffect(() => {
    if (!isOpen) return;
    setFilter("");
    setActiveIdx(0);
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [isOpen]);

  useEffect(() => {
    setActiveIdx(0);
  }, [filter]);

  const runCommand = useCallback(
    (index: number) => {
      const cmd = filtered[index];
      if (!cmd) return;
      cmd.run(context);
      onClose();
    },
    [filtered, context, onClose],
  );

  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((i) => Math.min(i + 1, filtered.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        runCommand(activeIdx);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, filtered.length, activeIdx, runCommand, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center bg-black/30 pt-[20vh] backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="animate-cmd-slide w-[520px] max-w-[calc(100vw-32px)] overflow-hidden rounded-2xl border border-border bg-bg-card shadow-[0_24px_80px_rgba(0,0,0,0.12)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-border px-5 py-4">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="flex-shrink-0 text-text-muted"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Type a command or search..."
            autoComplete="off"
            className="flex-1 border-0 bg-transparent font-sans text-[15px] text-text-primary placeholder:text-text-muted focus:outline-none"
          />
        </div>
        <div className="cmd-results max-h-[300px] overflow-y-auto p-2">
          {filtered.length === 0 && (
            <div className="px-3 py-4 text-center text-sm text-text-muted">
              No commands found
            </div>
          )}
          {filtered.map((cmd, i) => (
            <button
              key={cmd.id}
              type="button"
              onMouseEnter={() => setActiveIdx(i)}
              onClick={() => runCommand(i)}
              className={`flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left text-sm transition-colors ${
                i === activeIdx
                  ? "bg-[color:var(--accent-glow)] text-text-primary"
                  : "text-text-secondary hover:bg-[color:var(--accent-glow)] hover:text-text-primary"
              }`}
            >
              <span className="inline-flex w-5 justify-center text-base">
                {cmd.icon}
              </span>
              <span>{cmd.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
