"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { isWireframe, onWireframeChange } from "@/lib/wireframe";

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
  uniform vec2 uRes;
  uniform vec2 uPointer;
  uniform float uStrength;
  uniform float uWire;
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

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p = rot * p * 2.03 + vec2(13.7);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    float aspect = uRes.x / uRes.y;
    vec2 p = (vUv - 0.5) * vec2(aspect, 1.0) * 1.7;
    float t = uTime * 0.05;

    // pointer swirl
    vec2 toP = p - uPointer;
    float pd = dot(toP, toP);
    float infl = exp(-pd * 2.4) * (0.22 + uStrength * 1.5);
    vec2 swirl = vec2(-toP.y, toP.x) * infl * 0.5;

    // domain-warped fbm smoke
    vec2 q = vec2(
      fbm(p + t * vec2(1.0, 0.62)),
      fbm(p - t * 0.7 + vec2(5.2, 1.3))
    );
    vec2 r = vec2(
      fbm(p + 1.8 * q + swirl + vec2(1.7, 9.2) + t * 0.45),
      fbm(p + 1.8 * q - swirl + vec2(8.3, 2.8) - t * 0.35)
    );
    float f = fbm(p + 2.2 * r);

    vec3 base = vec3(0.016, 0.016, 0.017);
    vec3 smoke = vec3(0.082, 0.080, 0.076);
    vec3 hi = vec3(0.165, 0.155, 0.145);

    vec3 col = base;
    col = mix(col, smoke, smoothstep(0.28, 0.78, f));
    col = mix(col, hi, smoothstep(0.55, 0.95, f * q.x + r.y * 0.35));

    vec3 accent = vec3(1.0, 0.30, 0.0);
    float crest = smoothstep(0.52, 0.92, r.x * f);
    col = mix(col, accent * 0.55, crest * 0.10 + infl * 0.12);

    // wireframe mode: topographic contour lines
    float bands = abs(fract(f * 16.0) - 0.5);
    float line = 1.0 - smoothstep(0.02, 0.07, bands);
    vec3 wire = vec3(0.018)
      + vec3(0.55, 0.54, 0.52) * line * 0.8
      + accent * line * infl * 2.2;
    col = mix(col, wire, uWire);

    // vignette + dither
    vec2 vc = vUv - 0.5;
    col *= 1.0 - dot(vc, vc) * 0.9;
    col += (hash(vUv * uRes + fract(uTime) * 100.0) - 0.5) * 0.02;

    gl_FragColor = vec4(col, 1.0);
  }
`;

export function HeroShader() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduced = prefersReducedMotion();
    const parent = canvas.parentElement;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: false,
      antialias: false,
      powerPreference: "high-performance",
    });
    // Smoke is soft — render below native res for free performance.
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5) * 0.8);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const uniforms = {
      uTime: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uStrength: { value: 0 },
      uWire: { value: isWireframe() ? 1 : 0 },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      uniforms,
    });
    const geometry = new THREE.PlaneGeometry(2, 2);
    scene.add(new THREE.Mesh(geometry, material));

    let width = 1;
    let height = 1;
    function resize() {
      width = parent?.clientWidth ?? window.innerWidth;
      height = parent?.clientHeight ?? window.innerHeight;
      renderer.setSize(width, height, false);
      uniforms.uRes.value.set(width, height);
    }
    resize();

    // pointer smoothing + velocity → swirl strength
    const target = new THREE.Vector2(0, 0);
    let lastX = 0;
    let lastY = 0;
    let strengthTarget = 0;

    function toShaderSpace(clientX: number, clientY: number, out: THREE.Vector2) {
      const aspect = width / height;
      out.set(
        (clientX / width - 0.5) * aspect * 1.7,
        (0.5 - clientY / height) * 1.7,
      );
    }

    function onPointerMove(e: MouseEvent) {
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      strengthTarget = Math.min(1, strengthTarget + Math.hypot(dx, dy) * 0.006);
      toShaderSpace(e.clientX, e.clientY, target);
    }

    const start = performance.now();
    let rafId = 0;
    let inView = true;

    function frame() {
      rafId = 0;
      uniforms.uTime.value = (performance.now() - start) / 1000;
      uniforms.uPointer.value.lerp(target, 0.06);
      strengthTarget *= 0.94;
      uniforms.uStrength.value +=
        (strengthTarget - uniforms.uStrength.value) * 0.08;
      renderer.render(scene, camera);
      if (inView && !document.hidden) {
        rafId = requestAnimationFrame(frame);
      }
    }

    function play() {
      if (!rafId && inView && !document.hidden) {
        rafId = requestAnimationFrame(frame);
      }
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView) play();
      },
      { threshold: 0 },
    );

    function onVisibility() {
      if (!document.hidden) play();
    }

    const unsubscribeWire = onWireframeChange((enabled) => {
      gsap.to(uniforms.uWire, {
        value: enabled ? 1 : 0,
        duration: 0.9,
        ease: "power2.inOut",
      });
      if (reduced) renderer.render(scene, camera);
    });

    if (reduced) {
      // static frame — no loop, no pointer
      uniforms.uTime.value = 12;
      renderer.render(scene, camera);
      window.addEventListener("resize", resize);
    } else {
      observer.observe(canvas);
      document.addEventListener("mousemove", onPointerMove, { passive: true });
      document.addEventListener("visibilitychange", onVisibility);
      window.addEventListener("resize", resize);
      play();
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      observer.disconnect();
      unsubscribeWire();
      document.removeEventListener("mousemove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", resize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute left-0 top-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
