"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { hasFinePointer, prefersReducedMotion } from "@/lib/motion";

type CursorVariant = "default" | "hover" | "view";

export function Cursor() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!dot || !ring || !label) return;
    if (!hasFinePointer() || prefersReducedMotion()) return;
    const labelEl: HTMLSpanElement = label;

    document.documentElement.classList.add("has-custom-cursor");

    gsap.set([dot, ring], { xPercent: -50, yPercent: -50, x: -100, y: -100 });

    const dotX = gsap.quickTo(dot, "x", { duration: 0.08, ease: "power3.out" });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.08, ease: "power3.out" });
    const ringX = gsap.quickTo(ring, "x", { duration: 0.4, ease: "power3.out" });
    const ringY = gsap.quickTo(ring, "y", { duration: 0.4, ease: "power3.out" });

    let visible = false;
    let variant: CursorVariant = "default";

    function applyVariant(next: CursorVariant, text?: string) {
      if (next === variant && next !== "view") return;
      variant = next;
      if (next === "view") {
        labelEl.textContent = text || "VIEW";
        gsap.to(ring, {
          scale: 2.1,
          backgroundColor: "var(--accent)",
          borderColor: "transparent",
          duration: 0.35,
          ease: "power3.out",
        });
        gsap.to(labelEl, { opacity: 1, duration: 0.25, delay: 0.08 });
        gsap.to(dot, { opacity: 0, duration: 0.2 });
      } else if (next === "hover") {
        gsap.to(ring, {
          scale: 1.6,
          backgroundColor: "rgba(255, 77, 0, 0.08)",
          borderColor: "rgba(236, 234, 229, 0.55)",
          duration: 0.35,
          ease: "power3.out",
        });
        gsap.to(labelEl, { opacity: 0, duration: 0.15 });
        gsap.to(dot, { opacity: visible ? 1 : 0, duration: 0.2 });
      } else {
        gsap.to(ring, {
          scale: 1,
          backgroundColor: "rgba(0, 0, 0, 0)",
          borderColor: "rgba(236, 234, 229, 0.4)",
          duration: 0.35,
          ease: "power3.out",
        });
        gsap.to(labelEl, { opacity: 0, duration: 0.15 });
        gsap.to(dot, { opacity: visible ? 1 : 0, duration: 0.2 });
      }
    }

    function resolveVariant(target: Element | null) {
      const viewEl = target?.closest<HTMLElement>("[data-cursor='view']");
      if (viewEl) {
        applyVariant("view", viewEl.dataset.cursorLabel);
        return;
      }
      if (target?.closest("a, button, [role='button'], input, textarea, select, [data-cursor='hover']")) {
        applyVariant("hover");
        return;
      }
      applyVariant("default");
    }

    function onMove(e: MouseEvent) {
      if (!visible) {
        visible = true;
        gsap.to([dot, ring], { opacity: 1, duration: 0.3 });
        if (variant === "view") gsap.to(dot, { opacity: 0, duration: 0.2 });
      }
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);
    }

    function onOver(e: MouseEvent) {
      resolveVariant(e.target as Element | null);
    }

    function onLeaveDoc() {
      visible = false;
      gsap.to([dot, ring], { opacity: 0, duration: 0.3 });
    }

    function onDown() {
      gsap.to(ring, { scale: variant === "view" ? 1.9 : 0.85, duration: 0.2 });
    }

    function onUp() {
      gsap.to(ring, { scale: variant === "view" ? 2.1 : variant === "hover" ? 1.6 : 1, duration: 0.25 });
    }

    document.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeaveDoc);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("mouseup", onUp);

    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.documentElement.removeEventListener("mouseleave", onLeaveDoc);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("mouseup", onUp);
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className="cursor-ring" aria-hidden="true">
        <span ref={labelRef} className="cursor-label">
          VIEW
        </span>
      </div>
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
    </>
  );
}
