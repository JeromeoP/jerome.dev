"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion";

const CANVAS_HEIGHT = 320;
const SPACING = 13;
const ROWS = 15;
const TEAR_STRETCH = 3.4;
const GRAVITY = 0.24;
const SOLVER_ITERATIONS = 3;

interface ClothPoint {
  x: number;
  y: number;
  px: number;
  py: number;
  pinX: number | null;
}

interface ClothLink {
  a: number;
  b: number;
  rest: number;
  dead: boolean;
}

interface Engine {
  reset: () => void;
}

export function Cloth() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<Engine | null>(null);
  const [linkCount, setLinkCount] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const reduced = prefersReducedMotion();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    const height = CANVAS_HEIGHT;

    let points: ClothPoint[] = [];
    let links: ClothLink[] = [];
    let cols = 0;
    let dragIndex: number | null = null;
    let pointerX = 0;
    let pointerY = 0;
    let rafId = 0;
    let running = false;
    let inView = true;
    let time = 0;

    function resize() {
      width = container!.clientWidth;
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function init() {
      points = [];
      links = [];
      cols = Math.max(10, Math.min(46, Math.floor((width * 0.86) / SPACING)));
      const offsetX = (width - (cols - 1) * SPACING) / 2;
      const offsetY = 26;

      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < cols; col++) {
          const x = offsetX + col * SPACING;
          const y = offsetY + row * SPACING;
          points.push({
            x,
            y,
            px: x,
            py: y,
            pinX: row === 0 ? x : null,
          });
        }
      }
      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < cols; col++) {
          const i = row * cols + col;
          if (col < cols - 1) {
            links.push({ a: i, b: i + 1, rest: SPACING, dead: false });
          }
          if (row < ROWS - 1) {
            links.push({ a: i, b: i + cols, rest: SPACING, dead: false });
          }
        }
      }
      setLinkCount(links.length);
    }

    function step() {
      time += 1 / 60;
      const wind = Math.sin(time * 0.9) * 0.015;

      for (const point of points) {
        if (point.pinX !== null) continue;
        const vx = (point.x - point.px) * 0.985;
        const vy = (point.y - point.py) * 0.985;
        point.px = point.x;
        point.py = point.y;
        point.x += vx + wind;
        point.y += vy + GRAVITY;
      }

      if (dragIndex !== null) {
        const point = points[dragIndex];
        point.x = pointerX;
        point.y = pointerY;
        point.px = pointerX;
        point.py = pointerY;
      }

      for (let iter = 0; iter < SOLVER_ITERATIONS; iter++) {
        for (const link of links) {
          if (link.dead) continue;
          const pa = points[link.a];
          const pb = points[link.b];
          const dx = pb.x - pa.x;
          const dy = pb.y - pa.y;
          const dist = Math.hypot(dx, dy) || 0.0001;
          if (dist > link.rest * TEAR_STRETCH) {
            link.dead = true;
            continue;
          }
          const diff = ((link.rest - dist) / dist) * 0.5;
          const ox = dx * diff;
          const oy = dy * diff;
          if (pa.pinX === null) {
            pa.x -= ox;
            pa.y -= oy;
          }
          if (pb.pinX === null) {
            pb.x += ox;
            pb.y += oy;
          }
        }
        for (const point of points) {
          if (point.pinX !== null) {
            point.x = point.pinX;
            point.y = 26;
          }
        }
      }
    }

    function draw() {
      ctx!.fillStyle = "#080807";
      ctx!.fillRect(0, 0, width, height);

      // bucket links by stress so we only pay for three stroke styles
      const calm: ClothLink[] = [];
      const strained: ClothLink[] = [];
      const critical: ClothLink[] = [];
      for (const link of links) {
        if (link.dead) continue;
        const pa = points[link.a];
        const pb = points[link.b];
        const stress =
          Math.hypot(pb.x - pa.x, pb.y - pa.y) / link.rest;
        if (stress > 2.3) critical.push(link);
        else if (stress > 1.55) strained.push(link);
        else calm.push(link);
      }

      const buckets: Array<[ClothLink[], string]> = [
        [calm, "rgba(217, 214, 205, 0.30)"],
        [strained, "rgba(217, 214, 205, 0.62)"],
        [critical, "#FF4D00"],
      ];
      for (const [bucket, style] of buckets) {
        if (bucket.length === 0) continue;
        ctx!.strokeStyle = style;
        ctx!.lineWidth = 1;
        ctx!.beginPath();
        for (const link of bucket) {
          const pa = points[link.a];
          const pb = points[link.b];
          ctx!.moveTo(pa.x, pa.y);
          ctx!.lineTo(pb.x, pb.y);
        }
        ctx!.stroke();
      }

      // pins
      ctx!.fillStyle = "rgba(217, 214, 205, 0.7)";
      for (let col = 0; col < cols; col++) {
        const pin = points[col];
        ctx!.fillRect(pin.x - 1, pin.y - 1, 2, 2);
      }
    }

    function frame() {
      rafId = 0;
      step();
      draw();
      if (running && inView && !document.hidden) {
        rafId = requestAnimationFrame(frame);
      }
    }

    function play() {
      if (!rafId && running && inView && !document.hidden) {
        rafId = requestAnimationFrame(frame);
      }
    }

    function pointerPos(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      pointerX = e.clientX - rect.left;
      pointerY = e.clientY - rect.top;
    }

    function onPointerDown(e: PointerEvent) {
      pointerPos(e);
      let nearest = -1;
      let nearestDist = 36;
      for (let i = 0; i < points.length; i++) {
        const dist = Math.hypot(points[i].x - pointerX, points[i].y - pointerY);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearest = i;
        }
      }
      if (nearest >= 0 && points[nearest].pinX === null) {
        dragIndex = nearest;
        try {
          canvas!.setPointerCapture(e.pointerId);
        } catch {
          // pointer may already be gone (e.g. cancelled touch)
        }
      }
    }

    function onPointerMove(e: PointerEvent) {
      const prevX = pointerX;
      const prevY = pointerY;
      pointerPos(e);
      if (dragIndex !== null) return;
      // brushing through the cloth nudges nearby points
      const moveX = pointerX - prevX;
      const moveY = pointerY - prevY;
      for (const point of points) {
        if (point.pinX !== null) continue;
        const dist = Math.hypot(point.x - pointerX, point.y - pointerY);
        if (dist < 34) {
          point.x += moveX * 0.4;
          point.y += moveY * 0.4;
        }
      }
    }

    function onPointerUp() {
      dragIndex = null;
    }

    function onVisibility() {
      play();
    }

    resize();
    init();
    draw();
    engineRef.current = {
      reset: () => {
        init();
        if (reduced) draw();
      },
    };

    const resizeObserver = new ResizeObserver(() => {
      resize();
      init();
      draw();
    });
    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        play();
      },
      { threshold: 0 },
    );

    if (!reduced) {
      running = true;
      intersectionObserver.observe(canvas);
      canvas.addEventListener("pointerdown", onPointerDown);
      canvas.addEventListener("pointermove", onPointerMove);
      canvas.addEventListener("pointerup", onPointerUp);
      canvas.addEventListener("pointercancel", onPointerUp);
      document.addEventListener("visibilitychange", onVisibility);
      play();
    }

    return () => {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      document.removeEventListener("visibilitychange", onVisibility);
      engineRef.current = null;
    };
  }, []);

  return (
    <div ref={containerRef} className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-card border border-border">
        <canvas
          ref={canvasRef}
          className="block w-full cursor-grab touch-none active:cursor-grabbing"
          aria-label="Interactive cloth physics simulation"
        />
      </div>

      <div className="flex items-center justify-between gap-4">
        <p className="font-mono text-[11px] text-text-muted">
          {linkCount.toLocaleString("en")} constraints · verlet integration ·
          drag to pull, yank to tear
        </p>
        <button
          type="button"
          onClick={() => engineRef.current?.reset()}
          data-cursor="hover"
          className="border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-text-secondary transition-colors duration-300 hover:border-accent hover:text-accent"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
