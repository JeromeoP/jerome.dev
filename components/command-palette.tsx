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
      className="fixed inset-0 z-[300] flex items-start justify-center bg-black/70 pt-[18vh] backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div
        className="animate-cmd-slide w-[560px] max-w-[calc(100vw-32px)] overflow-hidden border border-border bg-bg-card shadow-[0_32px_120px_rgba(0,0,0,0.7)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-border px-5 py-4">
          <span aria-hidden="true" className="font-mono text-sm text-accent">
            ❯
          </span>
          <input
            ref={inputRef}
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="TYPE A COMMAND…"
            autoComplete="off"
            className="flex-1 border-0 bg-transparent font-mono text-[13px] uppercase tracking-[0.08em] text-text-primary placeholder:text-text-muted focus:outline-none"
          />
          <kbd className="border border-border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-text-muted">
            Esc
          </kbd>
        </div>
        <div className="cmd-results max-h-[320px] overflow-y-auto py-1.5">
          {filtered.length === 0 && (
            <div className="px-5 py-5 text-center font-mono text-[11px] uppercase tracking-[0.16em] text-text-muted">
              No commands found
            </div>
          )}
          {filtered.map((cmd, i) => (
            <button
              key={cmd.id}
              type="button"
              onMouseEnter={() => setActiveIdx(i)}
              onClick={() => runCommand(i)}
              className={`flex w-full items-baseline justify-between gap-3 px-5 py-3 text-left font-mono text-[12px] uppercase tracking-[0.1em] transition-colors duration-100 ${
                i === activeIdx
                  ? "bg-accent text-bg"
                  : "text-text-secondary"
              }`}
            >
              <span>{cmd.label}</span>
              <span
                className={
                  i === activeIdx ? "text-bg/70" : "text-text-muted"
                }
              >
                {cmd.hint}
              </span>
            </button>
          ))}
        </div>
        <div className="flex gap-5 border-t border-border px-5 py-2.5 font-mono text-[9px] uppercase tracking-[0.14em] text-text-muted">
          <span>↑↓ Navigate</span>
          <span>↵ Run</span>
          <span>Esc Close</span>
        </div>
      </div>
    </div>
  );
}
