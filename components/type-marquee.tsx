"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { getLenis } from "@/lib/scroll";

interface TypeMarqueeProps {
  items: string[];
  direction?: 1 | -1;
  strong?: boolean;
}

/** Infinite outlined-type band whose speed reacts to scroll velocity. */
export function TypeMarquee({
  items,
  direction = 1,
  strong = false,
}: TypeMarqueeProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    if (prefersReducedMotion()) return;

    const from = direction === 1 ? 0 : -50;
    const to = direction === 1 ? -50 : 0;
    const tween = gsap.fromTo(
      track,
      { xPercent: from },
      { xPercent: to, duration: 38, ease: "none", repeat: -1 },
    );

    let timeScale = 1;
    const tick = () => {
      const velocity = getLenis()?.velocity ?? 0;
      const target = gsap.utils.clamp(0.35, 4.5, 1 + Math.abs(velocity) * 0.035);
      timeScale += (target - timeScale) * 0.06;
      tween.timeScale(timeScale);
    };
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      tween.kill();
    };
  }, [direction]);

  const doubled = [...items, ...items];

  return (
    <div className="overflow-hidden" aria-hidden="true">
      <div
        ref={trackRef}
        className="flex w-max items-center gap-10 whitespace-nowrap px-5 py-1 max-md:gap-6"
      >
        {doubled.map((item, i) => (
          <span key={`${item}-${i}`} className="flex items-center gap-10 max-md:gap-6">
            <span
              className={`font-expanded select-none text-[clamp(44px,7.5vw,118px)] font-bold uppercase leading-[1.05] tracking-[-0.01em] ${
                strong ? "text-outline-ink" : "text-outline"
              }`}
            >
              {item}
            </span>
            <span className="select-none text-[clamp(14px,1.6vw,24px)] text-accent">
              ✱
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
