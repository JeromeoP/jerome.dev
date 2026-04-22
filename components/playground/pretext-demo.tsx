"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  layoutWithLines,
  measureLineStats,
  prepareWithSegments,
  type PreparedTextWithSegments,
} from "@chenglou/pretext";

const DEFAULT_TEXT =
  "Text layout, but without touching the DOM. Drag the right edge and watch the numbers update per frame — no reflow, no getBoundingClientRect. Also handles 中文, العربية, and 🚀 without blinking.";

const FONT_SIZE_PX = 18;
const LINE_HEIGHT_PX = 28;
const MIN_WIDTH = 180;
const DEFAULT_WIDTH = 420;
const HANDLE_RESERVED_PX = 28;

interface Readout {
  width: number;
  height: number;
  lineCount: number;
  maxLineWidth: number;
}

export function PretextDemo() {
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [containerMaxWidth, setContainerMaxWidth] = useState(DEFAULT_WIDTH);
  const [isDragging, setIsDragging] = useState(false);
  const [fontReady, setFontReady] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragStartRef = useRef<{ startX: number; startWidth: number } | null>(
    null,
  );

  useEffect(() => {
    if (typeof document === "undefined") return;
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    if (!fonts) {
      setFontReady(true);
      return;
    }
    fonts.ready.then(() => setFontReady(true));
  }, []);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    let first = true;
    function measureMax() {
      if (!node) return;
      const max = Math.max(MIN_WIDTH, node.clientWidth - HANDLE_RESERVED_PX);
      setContainerMaxWidth(max);
      setWidth((prev) => {
        if (prev > max) return max;
        if (first) {
          first = false;
          const initialMax = Math.max(MIN_WIDTH, max - 60);
          return Math.min(prev, initialMax);
        }
        return prev;
      });
    }
    measureMax();
    const observer = new ResizeObserver(measureMax);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const fontShorthand = `${FONT_SIZE_PX}px Inter, system-ui, sans-serif`;

  const prepared = useMemo<PreparedTextWithSegments | null>(() => {
    if (!fontReady) return null;
    try {
      return prepareWithSegments(DEFAULT_TEXT, fontShorthand);
    } catch {
      return null;
    }
  }, [fontShorthand, fontReady]);

  const [readout, setReadout] = useState<Readout>({
    width: DEFAULT_WIDTH,
    height: 0,
    lineCount: 0,
    maxLineWidth: 0,
  });
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    if (!prepared) return;
    const clamped = Math.max(MIN_WIDTH, Math.round(width));
    const { lines: measuredLines, height, lineCount } = layoutWithLines(
      prepared,
      clamped,
      LINE_HEIGHT_PX,
    );
    const stats = measureLineStats(prepared, clamped);
    setReadout({
      width: clamped,
      height,
      lineCount,
      maxLineWidth: Math.round(stats.maxLineWidth * 10) / 10,
    });
    setLines(measuredLines.map((line) => line.text));
  }, [prepared, width]);

  const handleRef = useRef<HTMLButtonElement | null>(null);
  const containerMaxWidthRef = useRef(containerMaxWidth);
  const readoutWidthRef = useRef(readout.width);

  useLayoutEffect(() => {
    containerMaxWidthRef.current = containerMaxWidth;
  }, [containerMaxWidth]);

  useLayoutEffect(() => {
    readoutWidthRef.current = readout.width;
  }, [readout.width]);

  useEffect(() => {
    const node = handleRef.current;
    if (!node) return;

    let activePointerId: number | null = null;

    function clamp(value: number) {
      return Math.min(
        Math.max(MIN_WIDTH, value),
        containerMaxWidthRef.current,
      );
    }

    function onWindowPointerMove(e: PointerEvent) {
      if (activePointerId === null || e.pointerId !== activePointerId) return;
      e.preventDefault();
      const start = dragStartRef.current;
      if (!start) return;
      setWidth(clamp(start.startWidth + (e.clientX - start.startX)));
    }

    function endDrag(e: PointerEvent) {
      if (activePointerId === null || e.pointerId !== activePointerId) return;
      activePointerId = null;
      dragStartRef.current = null;
      setIsDragging(false);
      window.removeEventListener("pointermove", onWindowPointerMove);
      window.removeEventListener("pointerup", endDrag);
      window.removeEventListener("pointercancel", endDrag);
    }

    function onPointerDown(e: PointerEvent) {
      if (activePointerId !== null) return;
      e.preventDefault();
      activePointerId = e.pointerId;
      dragStartRef.current = {
        startX: e.clientX,
        startWidth: readoutWidthRef.current,
      };
      setIsDragging(true);
      window.addEventListener("pointermove", onWindowPointerMove, {
        passive: false,
      });
      window.addEventListener("pointerup", endDrag);
      window.addEventListener("pointercancel", endDrag);
    }

    node.addEventListener("pointerdown", onPointerDown, { passive: false });
    return () => {
      node.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onWindowPointerMove);
      window.removeEventListener("pointerup", endDrag);
      window.removeEventListener("pointercancel", endDrag);
    };
  }, []);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      const step = e.shiftKey ? 20 : 4;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setWidth((w) => Math.max(MIN_WIDTH, w - step));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setWidth((w) => Math.min(containerMaxWidth, w + step));
      }
    },
    [containerMaxWidth],
  );

  return (
    <div ref={containerRef} className="flex flex-col gap-6">
      <div
        className="relative"
        style={{ width: `${readout.width}px`, maxWidth: "100%" }}
      >
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute -inset-3 -z-0 rounded-lg border border-dashed transition-colors duration-200 ${
            isDragging ? "border-accent" : "border-border"
          }`}
        />
        <div
          className="relative"
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: `${FONT_SIZE_PX}px`,
            lineHeight: `${LINE_HEIGHT_PX}px`,
            color: "var(--text-primary)",
          }}
        >
          {lines.length > 0
            ? lines.map((line, i) => (
                <div
                  key={i}
                  style={{
                    height: `${LINE_HEIGHT_PX}px`,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                  }}
                >
                  {line}
                </div>
              ))
            : null}
        </div>
        <button
          ref={handleRef}
          type="button"
          aria-label="Resize handle. Drag, or use left/right arrow keys."
          onKeyDown={onKeyDown}
          style={{ touchAction: "none" }}
          className={`absolute -right-5 top-1/2 flex h-24 w-10 -translate-y-1/2 cursor-ew-resize touch-none select-none items-center justify-center rounded-full border bg-bg-card shadow-sm transition-all duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
            isDragging
              ? "border-accent scale-105"
              : "border-accent-light/50 hover:border-accent-light"
          }`}
        >
          <span
            aria-hidden="true"
            className={`flex flex-col gap-0.5 transition-colors ${
              isDragging ? "text-accent" : "text-text-muted"
            }`}
          >
            <span className="block h-0.5 w-2 rounded-full bg-current" />
            <span className="block h-0.5 w-2 rounded-full bg-current" />
            <span className="block h-0.5 w-2 rounded-full bg-current" />
          </span>
        </button>
      </div>

      <div className="grid grid-cols-4 gap-px overflow-hidden rounded-lg border border-border bg-border max-md:grid-cols-2">
        <Stat
          label="width"
          value={readout.width}
          unit="px"
          highlight={isDragging}
        />
        <Stat
          label="height"
          value={readout.height}
          unit="px"
          highlight={isDragging}
        />
        <Stat label="lines" value={readout.lineCount} highlight={isDragging} />
        <Stat
          label="maxLineWidth"
          value={readout.maxLineWidth}
          unit="px"
          highlight={isDragging}
        />
      </div>

      <p className="font-mono text-[11px] text-text-muted">
        measured by{" "}
        <a
          href="https://github.com/chenglou/pretext"
          target="_blank"
          rel="noreferrer"
          className="text-text-secondary transition-colors hover:text-accent"
        >
          @chenglou/pretext
        </a>{" "}
        · {fontReady ? "ready" : "loading fonts…"}
      </p>
    </div>
  );
}

interface StatProps {
  label: string;
  value: number;
  unit?: string;
  highlight?: boolean;
}

function Stat({ label, value, unit, highlight }: StatProps) {
  return (
    <div
      className={`flex flex-col gap-1 bg-bg-card px-4 py-3 transition-colors duration-150 ${
        highlight ? "bg-[color:var(--accent-glow)]" : ""
      }`}
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-muted">
        {label}
      </span>
      <span
        className={`font-mono text-sm tabular-nums transition-colors ${
          highlight ? "text-accent" : "text-text-primary"
        }`}
      >
        {value}
        {unit ? <span className="ml-0.5 text-text-muted">{unit}</span> : null}
      </span>
    </div>
  );
}
