"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion";

const MAX_PARTICLES = 6000;
const CANVAS_HEIGHT = 320;
const DEFAULT_WORD = "JEROME";
const REPULSE_RADIUS = 90;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  tx: number;
  ty: number;
  accent: boolean;
}

interface Engine {
  rebuild: (word: string) => void;
}

export function ParticleType() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<Engine | null>(null);
  const [word, setWord] = useState(DEFAULT_WORD);
  const [count, setCount] = useState(0);

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
    const bodyFont = getComputedStyle(document.body).fontFamily;

    let particles: Particle[] = [];
    let currentWord = DEFAULT_WORD;
    let mouseX: number | null = null;
    let mouseY: number | null = null;
    let rafId = 0;
    let running = false;
    let inView = true;

    function resize() {
      width = container!.clientWidth;
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      paintBackground(1);
    }

    function paintBackground(alpha: number) {
      ctx!.fillStyle = `rgba(8, 8, 7, ${alpha})`;
      ctx!.fillRect(0, 0, width, height);
    }

    function sampleTargets(text: string): Array<{ x: number; y: number }> {
      const off = document.createElement("canvas");
      off.width = Math.max(1, Math.round(width));
      off.height = height;
      const octx = off.getContext("2d");
      if (!octx) return [];

      let fontSize = height * 0.62;
      octx.font = `900 ${fontSize}px ${bodyFont}`;
      const measured = octx.measureText(text).width;
      const maxWidth = width * 0.88;
      if (measured > maxWidth) fontSize *= maxWidth / measured;
      octx.font = `900 ${fontSize}px ${bodyFont}`;
      octx.textAlign = "center";
      octx.textBaseline = "middle";
      octx.fillStyle = "#fff";
      octx.fillText(text, width / 2, height / 2);

      const data = octx.getImageData(0, 0, off.width, off.height).data;
      // first pass at a fine step to know the density, then thin to the cap
      const fine: Array<{ x: number; y: number }> = [];
      const step = 2;
      for (let y = 0; y < off.height; y += step) {
        for (let x = 0; x < off.width; x += step) {
          if (data[(y * off.width + x) * 4 + 3] > 128) {
            fine.push({ x, y });
          }
        }
      }
      if (fine.length <= MAX_PARTICLES) return fine;
      const keep = MAX_PARTICLES / fine.length;
      return fine.filter(() => Math.random() < keep);
    }

    function rebuild(text: string) {
      currentWord = text.trim() === "" ? DEFAULT_WORD : text.toUpperCase();
      const targets = sampleTargets(currentWord);
      const next: Particle[] = [];
      for (let i = 0; i < targets.length; i++) {
        const prev = particles[i];
        next.push({
          x: prev ? prev.x : Math.random() * width,
          y: prev ? prev.y : Math.random() * height,
          vx: prev ? prev.vx : 0,
          vy: prev ? prev.vy : 0,
          tx: targets[i].x,
          ty: targets[i].y,
          accent: Math.random() < 0.09,
        });
      }
      particles = next;
      setCount(particles.length);
      if (reduced) renderStatic();
    }

    function renderStatic() {
      paintBackground(1);
      for (const particle of particles) {
        ctx!.fillStyle = particle.accent ? "#FF4D00" : "#D9D6CD";
        ctx!.fillRect(particle.tx, particle.ty, 1.8, 1.8);
      }
    }

    function frame() {
      rafId = 0;
      paintBackground(0.3);
      for (const particle of particles) {
        let ax = (particle.tx - particle.x) * 0.055;
        let ay = (particle.ty - particle.y) * 0.055;
        if (mouseX !== null && mouseY !== null) {
          const dx = particle.x - mouseX;
          const dy = particle.y - mouseY;
          const dist = Math.hypot(dx, dy);
          if (dist < REPULSE_RADIUS && dist > 0.01) {
            const force = ((1 - dist / REPULSE_RADIUS) ** 2 * 7) / dist;
            ax += dx * force;
            ay += dy * force;
          }
        }
        particle.vx = (particle.vx + ax) * 0.86;
        particle.vy = (particle.vy + ay) * 0.86;
        particle.x += particle.vx;
        particle.y += particle.vy;
        ctx!.fillStyle = particle.accent ? "#FF4D00" : "#D9D6CD";
        ctx!.fillRect(particle.x, particle.y, 1.8, 1.8);
      }
      if (running && inView && !document.hidden) {
        rafId = requestAnimationFrame(frame);
      }
    }

    function play() {
      if (!rafId && running && inView && !document.hidden) {
        rafId = requestAnimationFrame(frame);
      }
    }

    function onPointerMove(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    }
    function onPointerLeave() {
      mouseX = null;
      mouseY = null;
    }
    function onPointerDown(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      for (const particle of particles) {
        const dx = particle.x - cx;
        const dy = particle.y - cy;
        const dist = Math.max(Math.hypot(dx, dy), 4);
        const blast = Math.min(140 / dist, 18);
        particle.vx += (dx / dist) * blast;
        particle.vy += (dy / dist) * blast;
      }
    }
    function onVisibility() {
      play();
    }

    resize();
    rebuild(DEFAULT_WORD);
    engineRef.current = { rebuild };

    const resizeObserver = new ResizeObserver(() => {
      resize();
      rebuild(currentWord);
    });
    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        play();
      },
      { threshold: 0 },
    );

    if (reduced) {
      renderStatic();
    } else {
      running = true;
      intersectionObserver.observe(canvas);
      canvas.addEventListener("pointermove", onPointerMove);
      canvas.addEventListener("pointerleave", onPointerLeave);
      canvas.addEventListener("pointerdown", onPointerDown);
      document.addEventListener("visibilitychange", onVisibility);
      play();
    }

    return () => {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      canvas.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("visibilitychange", onVisibility);
      engineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={containerRef} className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-card border border-border">
        <canvas
          ref={canvasRef}
          className="block w-full touch-none"
          aria-label={`Particle simulation spelling ${word || DEFAULT_WORD}`}
        />
      </div>

      <label className="flex items-center gap-3 border border-border px-3 py-2.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">
          Type
        </span>
        <input
          type="text"
          value={word}
          maxLength={12}
          onChange={(e) => {
            setWord(e.target.value);
            engineRef.current?.rebuild(e.target.value);
          }}
          placeholder={DEFAULT_WORD}
          className="flex-1 border-0 bg-transparent font-mono text-sm uppercase tracking-[0.1em] text-text-primary placeholder:text-text-muted focus:outline-none"
        />
      </label>

      <p className="font-mono text-[11px] text-text-muted">
        {count.toLocaleString("en")} particles · spring physics · cursor repels
        · click detonates
      </p>
    </div>
  );
}
