"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap } from "@/lib/gsap";
import { hasFinePointer, prefersReducedMotion } from "@/lib/motion";
import { projects, type Project } from "@/lib/portfolio-data";

const CANVAS_W = 300;
const CANVAS_H = 380;

const VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const FRAGMENT = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uHover;
  uniform int uVariant;
  uniform vec3 uColor;
  uniform float uPx; // one device pixel, in p-space units
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float sdBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }

  // crisp anti-aliased fill / stroke helpers
  // (edges must be ascending — descending smoothstep is undefined on Metal)
  float fillSd(float d) {
    return 1.0 - smoothstep(-uPx, uPx, d);
  }
  float strokeSd(float d, float w) {
    return 1.0 - smoothstep(w - uPx, w + uPx, abs(d));
  }

  void main() {
    vec2 uv = vUv;
    vec2 p = (uv - 0.5) * 2.0;
    p.y *= 1.2667; // 300x380 aspect
    float t = uTime;
    vec3 ink = vec3(0.925, 0.918, 0.898);
    vec3 col = vec3(0.030, 0.030, 0.028);

    if (uVariant == 0) {
      // CLIPSHELF — a stack of clipboard cards, one active at a time
      float rows = 6.0;
      float activeRow = mod(floor(t * 0.8), rows);
      for (int k = 0; k < 6; k++) {
        float fk = float(k);
        float yC = mix(0.92, -0.92, (fk + 0.5) / rows);
        float drift = (noise(vec2(fk * 7.3, t * 0.3)) - 0.5) * 0.14;
        vec2 q = vec2(p.x - drift, p.y - yC);
        float d = sdBox(q, vec2(0.60, 0.112), 0.05);
        // ("active" is a reserved word in GLSL — hence "lit")
        float lit = 1.0 - step(0.5, abs(activeRow - fk));
        col += uColor * fillSd(d) * (0.08 + 0.50 * lit);
        col += mix(ink * 0.40, uColor, lit) * strokeSd(d, uPx * 0.9);
        // pin dot on the left edge of each card
        float pin = length(q - vec2(-0.48, 0.0)) - 0.02;
        col += ink * fillSd(pin) * (0.25 + 0.55 * lit);
      }
    } else if (uVariant == 1) {
      // REHABBUDDY — radar rings with a sweeping beam and blips
      float d = length(p);
      float inField = 1.0 - smoothstep(1.02, 1.06, d);
      float ringDist = (abs(fract(d * 4.0 - t * 0.25) - 0.5)) / 4.0;
      col += uColor * strokeSd(ringDist, uPx * 0.7) * exp(-d * 0.7) * 0.75;
      // sweep beam
      float ang = atan(p.y, p.x);
      float sweep = fract(ang / 6.2831853 - t * 0.16);
      col += uColor * pow(1.0 - sweep, 7.0) * inField * exp(-d * 0.6) * 0.45;
      // crosshair hairlines
      col += ink * 0.10 * strokeSd(p.x, uPx * 0.5) * inField;
      col += ink * 0.10 * strokeSd(p.y, uPx * 0.5) * inField;
      // blips light up as the beam passes
      for (int k = 0; k < 5; k++) {
        float fk = float(k);
        vec2 bp = vec2(
          noise(vec2(fk * 3.1, 7.7)) * 1.3 - 0.65,
          noise(vec2(fk * 5.7, 2.3)) * 1.5 - 0.75
        );
        float bAng = fract(atan(bp.y, bp.x) / 6.2831853 - t * 0.16);
        float pulse = pow(1.0 - bAng, 9.0);
        float bd = length(p - bp) - (0.018 + 0.012 * pulse);
        col += mix(ink, uColor, 0.5) * fillSd(bd) * (0.18 + 0.82 * pulse);
      }
      // center dot
      col += uColor * fillSd(d - 0.026);
    } else if (uVariant == 2) {
      // STATS SCRAPER — data grid with a scanline harvesting points
      float scale = 3.2;
      vec2 gp = p * scale;
      vec2 cid = floor(gp);
      vec2 cuv = fract(gp) - 0.5;
      float cpx = uPx * scale;
      // hairline grid
      float borderDist = 0.5 - max(abs(cuv.x), abs(cuv.y));
      col += ink * 0.08 * (1.0 - smoothstep(0.0, cpx * 1.5, borderDist));
      // data points, intensity re-rolled over time
      float r = noise(cid * 1.7 + floor(t * 1.1) * 0.31);
      float dotR = 0.08 + 0.16 * r;
      float dd = (length(cuv) - dotR) / scale;
      float dotm = fillSd(dd);
      vec3 dotCol = mix(ink * 0.45, uColor, step(0.68, r));
      col += dotCol * dotm * (0.22 + 0.78 * r);
      // scanline sweeping down + wake brightening
      float sy = 1.27 - fract(t * 0.20) * 2.54;
      col += uColor * strokeSd(p.y - sy, uPx) * 0.85;
      float wake = exp(-(p.y - sy) * 3.5) * step(sy, p.y);
      col += uColor * dotm * wake * 0.5;
    } else {
      // WHOOP KILLER — crisp ECG trace on a faint grid
      float scale = 4.0;
      vec2 gguv = fract(p * scale) - 0.5;
      float gbd = 0.5 - max(abs(gguv.x), abs(gguv.y));
      col += ink * 0.06 * (1.0 - smoothstep(0.0, uPx * scale * 1.5, gbd));
      float xn = fract((p.x + 1.0) * 0.5 + t * 0.12) * 2.0;
      float y = 0.0;
      y += 0.09 * exp(-pow((xn - 0.55) * 14.0, 2.0));
      y += 0.62 * exp(-pow((xn - 1.00) * 38.0, 2.0));
      y -= 0.22 * exp(-pow((xn - 1.12) * 30.0, 2.0));
      y += 0.16 * exp(-pow((xn - 1.45) * 11.0, 2.0));
      float ld = p.y * 0.7 - y;
      col += uColor * strokeSd(ld, uPx * 0.9);
      col += uColor * 0.22 * exp(-abs(ld) * 9.0);
      // bpm tick marks along the bottom
      float tick = strokeSd(fract((p.x + 1.0) * 2.0) - 0.5, uPx * 1.2)
        * step(1.08, p.y) * (1.0 - step(1.14, p.y));
      col += ink * tick * 0.5;
    }

    // circular reveal on hover-in
    float d2 = length(p);
    float reveal = 1.0 - smoothstep(uHover * 2.4 - 0.35, uHover * 2.4, d2);
    col *= reveal;

    // vignette + dither
    vec2 vc = uv - 0.5;
    col *= 1.0 - dot(vc, vc) * 0.85;
    col += (hash(uv * 913.0 + fract(t) * 7.0) - 0.5) * 0.018;

    gl_FragColor = vec4(col, 1.0);
  }
`;

function variantFor(geometry: Project["geometry"]): number {
  switch (geometry) {
    case "torus":
      return 0;
    case "torus-knot":
      return 1;
    case "octahedron":
      return 2;
    case "icosahedron":
      return 3;
    default: {
      const exhaustive: never = geometry;
      return exhaustive;
    }
  }
}

interface SceneState {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;
  uniforms: {
    uTime: { value: number };
    uHover: { value: number };
    uVariant: { value: number };
    uColor: { value: THREE.Color };
    uPx: { value: number };
  };
  geometry: THREE.PlaneGeometry;
  material: THREE.ShaderMaterial;
}

interface WorkPreviewProps {
  project: Project | null;
}

/** Cursor-following generative preview tile shown while hovering work rows. */
export function WorkPreview({ project }: WorkPreviewProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const captionRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<SceneState | null>(null);
  const rafRef = useRef(0);
  const runningRef = useRef(false);
  const enabledRef = useRef(false);
  const lastProjectRef = useRef<Project | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    if (!hasFinePointer() || prefersReducedMotion()) return;
    enabledRef.current = true;

    const pixelRatio = Math.min(window.devicePixelRatio, 2);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: false });
    renderer.setSize(CANVAS_W, CANVAS_H, false);
    renderer.setPixelRatio(pixelRatio);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const uniforms = {
      uTime: { value: 0 },
      uHover: { value: 0 },
      uVariant: { value: 0 },
      uColor: { value: new THREE.Color(0xffffff) },
      // p-space spans 2 * 1.2667 vertically over the buffer height
      uPx: { value: 2.5334 / (CANVAS_H * pixelRatio) },
    };
    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      uniforms,
    });
    const geometry = new THREE.PlaneGeometry(2, 2);
    scene.add(new THREE.Mesh(geometry, material));
    sceneRef.current = {
      renderer,
      scene,
      camera,
      uniforms,
      geometry,
      material,
    };

    gsap.set(wrap, { xPercent: -50, yPercent: -50, autoAlpha: 0, scale: 0.9 });
    const moveX = gsap.quickTo(wrap, "x", { duration: 0.55, ease: "power3.out" });
    const moveY = gsap.quickTo(wrap, "y", { duration: 0.55, ease: "power3.out" });

    // tilt follows horizontal cursor velocity, decays back to upright
    let tiltVelocity = 0;
    let lastX: number | null = null;
    function onMove(e: MouseEvent) {
      if (lastX !== null) {
        tiltVelocity += (e.clientX - lastX) * 0.18;
        tiltVelocity = gsap.utils.clamp(-30, 30, tiltVelocity);
      }
      lastX = e.clientX;
      moveX(e.clientX);
      moveY(e.clientY);
    }
    const tiltTick = () => {
      tiltVelocity *= 0.88;
      gsap.set(wrap, { rotation: gsap.utils.clamp(-6, 6, tiltVelocity * 0.25) });
    };
    gsap.ticker.add(tiltTick);
    document.addEventListener("mousemove", onMove, { passive: true });

    return () => {
      enabledRef.current = false;
      document.removeEventListener("mousemove", onMove);
      gsap.ticker.remove(tiltTick);
      cancelAnimationFrame(rafRef.current);
      runningRef.current = false;
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    const state = sceneRef.current;
    if (!wrap || !state || !enabledRef.current) return;

    const start = performance.now();
    function frame() {
      const s = sceneRef.current;
      if (!s || !runningRef.current) return;
      s.uniforms.uTime.value = (performance.now() - start) / 1000;
      s.renderer.render(s.scene, s.camera);
      rafRef.current = requestAnimationFrame(frame);
    }

    if (project) {
      lastProjectRef.current = project;
      if (captionRef.current) {
        const idx = projects.indexOf(project);
        captionRef.current.textContent = `${String(idx + 1).padStart(2, "0")} — ${project.title}`;
      }
      state.uniforms.uVariant.value = variantFor(project.geometry);
      state.uniforms.uColor.value.set(project.color);
      if (!runningRef.current) {
        runningRef.current = true;
        rafRef.current = requestAnimationFrame(frame);
      }
      gsap.to(wrap, {
        autoAlpha: 1,
        scale: 1,
        duration: 0.45,
        ease: "power3.out",
        overwrite: "auto",
      });
      gsap.to(state.uniforms.uHover, {
        value: 1,
        duration: 0.6,
        ease: "power2.out",
        overwrite: "auto",
      });
    } else {
      gsap.to(wrap, {
        autoAlpha: 0,
        scale: 0.92,
        duration: 0.35,
        ease: "power2.in",
        overwrite: "auto",
        onComplete: () => {
          runningRef.current = false;
          cancelAnimationFrame(rafRef.current);
        },
      });
      gsap.to(state.uniforms.uHover, {
        value: 0,
        duration: 0.3,
        overwrite: "auto",
      });
    }
  }, [project]);

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[150] hidden md:block"
      style={{ opacity: 0 }}
    >
      <div className="overflow-hidden rounded-card border border-border bg-[#0a0a09]">
        <canvas
          ref={canvasRef}
          className="block"
          style={{ width: CANVAS_W, height: CANVAS_H }}
        />
        <div
          ref={captionRef}
          className="border-t border-border px-3 py-2 font-mono text-[9px] uppercase tracking-[0.18em] text-text-muted"
        />
      </div>
    </div>
  );
}
