"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { markPreloaderDone } from "@/lib/preloader-state";

const STORAGE_KEY = "jp-preloader";

const STATUSES = ["LOADING ASSETS", "WARMING SHADERS", "BREWING COFFEE"];

export function Preloader() {
  const [hidden, setHidden] = useState(false);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const counterRef = useRef<HTMLSpanElement | null>(null);
  const statusRef = useRef<HTMLSpanElement | null>(null);
  const exitGroupRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const overlay = overlayRef.current;
    const counter = counterRef.current;
    const status = statusRef.current;
    const exitGroup = exitGroupRef.current;

    const skip =
      sessionStorage.getItem(STORAGE_KEY) === "done" || prefersReducedMotion();

    if (skip || !overlay || !counter || !status || !exitGroup) {
      document.documentElement.classList.remove("is-loading");
      setHidden(true);
      markPreloaderDone();
      return;
    }

    document.documentElement.classList.add("is-loading");

    function finish() {
      sessionStorage.setItem(STORAGE_KEY, "done");
      document.documentElement.classList.remove("is-loading");
      markPreloaderDone();
      setHidden(true);
    }

    const progress = { value: 0 };
    const tl = gsap.timeline();

    tl.to(progress, {
      value: 100,
      duration: 1.7,
      ease: "power2.inOut",
      onUpdate: () => {
        const v = Math.round(progress.value);
        counter.textContent = String(v).padStart(3, "0");
        const statusIdx = Math.min(
          STATUSES.length - 1,
          Math.floor((v / 100) * STATUSES.length),
        );
        status.textContent = STATUSES[statusIdx];
      },
    });
    tl.to(exitGroup, {
      yPercent: -18,
      opacity: 0,
      duration: 0.4,
      ease: "power3.in",
    });
    tl.to(
      overlay,
      {
        clipPath: "inset(0% 0% 100% 0%)",
        duration: 0.85,
        ease: "power4.inOut",
      },
      ">-0.08",
    );
    tl.call(finish);

    return () => {
      tl.kill();
      document.documentElement.classList.remove("is-loading");
    };
  }, []);

  if (hidden) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[700] flex flex-col justify-between bg-bg px-8 py-7 max-md:px-5"
      style={{ clipPath: "inset(0% 0% 0% 0%)" }}
      aria-hidden="true"
    >
      <div className="flex items-start justify-between font-mono text-[11px] uppercase tracking-[0.16em] text-text-muted">
        <span>
          Jerome Planken
          <span className="mx-3 text-border">/</span>
          Portfolio ©{new Date().getFullYear()}
        </span>
        <span className="max-md:hidden">Stockholm, SE</span>
      </div>

      <div ref={exitGroupRef} className="flex items-end justify-between">
        <span
          ref={statusRef}
          className="mb-4 font-mono text-[11px] uppercase tracking-[0.16em] text-text-muted"
        >
          {STATUSES[0]}
        </span>
        <span
          ref={counterRef}
          className="font-expanded text-[clamp(90px,17vw,260px)] font-bold leading-[0.8] tracking-tight text-text-primary"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          000
        </span>
      </div>
    </div>
  );
}
