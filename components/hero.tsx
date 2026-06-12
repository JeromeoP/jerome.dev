"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { onPreloaderDone } from "@/lib/preloader-state";
import { useStockholmTime } from "@/lib/use-stockholm-time";

const HeroShader = dynamic(
  () => import("@/components/hero-shader").then((m) => m.HeroShader),
  { ssr: false },
);

export function Hero() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const time = useStockholmTime(true);

  useEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;
    if (!section || !content) return;

    if (prefersReducedMotion()) return;

    const lines = section.querySelectorAll<HTMLElement>(".hero-line");
    const fades = section.querySelectorAll<HTMLElement>(".hero-fade");

    // The CSS initial transform (translateY(112%)) parses into GSAP's cache
    // as a px `y` — normalize to yPercent only so the tween fully resets it.
    gsap.set(lines, { y: 0, yPercent: 112 });

    const unsubscribe = onPreloaderDone(() => {
      const tl = gsap.timeline({ delay: 0.05 });
      tl.to(lines, {
        yPercent: 0,
        duration: 1.25,
        ease: "power4.out",
        stagger: 0.09,
      });
      tl.to(
        fades,
        { opacity: 1, duration: 0.9, ease: "power2.out", stagger: 0.07 },
        "-=0.7",
      );
    });

    // scroll exit: content drifts up and dims as you leave the hero
    const exit = gsap.to(content, {
      yPercent: -14,
      opacity: 0.2,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });

    return () => {
      unsubscribe();
      exit.scrollTrigger?.kill();
      exit.kill();
      ScrollTrigger.refresh();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden"
    >
      <HeroShader />

      <div
        ref={contentRef}
        className="relative z-[2] w-full px-8 max-md:px-5"
      >
        <p className="hero-fade mb-6 font-mono text-[11px] uppercase tracking-[0.2em] text-text-secondary">
          Fullstack developer
          <span className="mx-3 text-text-muted">—</span>
          <span className="text-text-muted">AI agents · web · mobile</span>
        </p>

        <h1 className="select-none font-display font-bold uppercase leading-[0.82] tracking-[-0.02em]">
          <span className="block overflow-hidden pb-[0.06em]">
            <span className="hero-line wf-text font-expanded text-[clamp(50px,15vw,250px)]">
              Jerome
            </span>
          </span>
          <span className="flex items-baseline justify-between gap-6 overflow-hidden pb-[0.06em]">
            <span
              aria-hidden="true"
              className="hero-line mb-[0.1em] self-end font-serif text-[clamp(18px,2.4vw,38px)] font-normal normal-case italic tracking-normal text-text-secondary max-md:hidden"
            >
              (developer)
            </span>
            <span className="hero-line wf-text font-expanded text-[clamp(50px,15vw,250px)]">
              Planken
            </span>
          </span>
        </h1>
      </div>

      {/* HUD */}
      <div className="hero-fade absolute left-8 top-24 z-[2] font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted max-md:left-5">
        Portfolio ©{new Date().getFullYear()}
        <br />
        V.2 — Cinematic build
      </div>

      <div className="hero-fade absolute right-8 top-24 z-[2] flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted max-md:hidden">
        <span className="animate-pulse-dot h-1.5 w-1.5 rounded-full bg-accent" />
        Open to interesting problems
      </div>

      <div className="hero-fade absolute bottom-8 left-8 z-[2] font-mono text-[10px] uppercase leading-[1.8] tracking-[0.16em] text-text-muted max-md:left-5">
        Stockholm, SE
        <br />
        59.3293°N, 18.0686°E
        <br />
        <span className="text-text-secondary" suppressHydrationWarning>
          {time ?? "--:--:--"} CET
        </span>
      </div>

      <div className="hero-fade absolute bottom-8 right-8 z-[2] flex flex-col items-end gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted max-md:right-5">
        <span>Scroll</span>
        <span className="animate-pulse-dot block h-10 w-px bg-gradient-to-b from-text-muted to-transparent" />
      </div>
    </section>
  );
}
