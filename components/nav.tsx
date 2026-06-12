"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { onPreloaderDone } from "@/lib/preloader-state";
import { scrollToTarget } from "@/lib/scroll";
import { useStockholmTime } from "@/lib/use-stockholm-time";

interface NavProps {
  onOpenPalette: () => void;
  onToggleMenu: () => void;
  isMenuOpen: boolean;
}

export function Nav({ onOpenPalette, onToggleMenu, isMenuOpen }: NavProps) {
  const navRef = useRef<HTMLElement | null>(null);
  const [isHidden, setIsHidden] = useState(false);
  const [isMac, setIsMac] = useState(true);
  const time = useStockholmTime();

  useEffect(() => {
    const platform =
      (navigator as Navigator & { userAgentData?: { platform?: string } })
        .userAgentData?.platform ?? navigator.platform ?? "";
    const ua = navigator.userAgent;
    setIsMac(/mac|iphone|ipad|ipod/i.test(platform) || /mac/i.test(ua));
  }, []);

  useEffect(() => {
    let lastScroll = 0;
    function handleScroll() {
      const current = window.scrollY;
      setIsHidden(current > lastScroll && current > 120);
      lastScroll = current;
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav || prefersReducedMotion()) return;
    gsap.set(nav, { autoAlpha: 0, y: -14 });
    const unsubscribe = onPreloaderDone(() => {
      gsap.to(nav, {
        autoAlpha: 1,
        y: 0,
        duration: 0.9,
        ease: "power3.out",
        delay: 0.5,
      });
    });
    return unsubscribe;
  }, []);

  return (
    <nav
      ref={navRef}
      className={`fixed left-0 right-0 top-0 z-[260] flex items-center justify-between px-8 py-6 transition-transform duration-300 ease-out max-md:px-5 max-md:py-4 ${
        isHidden && !isMenuOpen ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <button
        type="button"
        onClick={() => scrollToTarget(0)}
        className="font-expanded text-[15px] font-bold uppercase tracking-[-0.01em] text-text-primary"
        aria-label="Back to top"
      >
        JP<span className="text-accent">©</span>
        {String(new Date().getFullYear()).slice(-2)}
      </button>

      <div className="flex items-center gap-7">
        <span
          className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted max-md:hidden"
          suppressHydrationWarning
        >
          STO {time ?? "--:--"}
        </span>

        <button
          type="button"
          onClick={onOpenPalette}
          className="flex items-center gap-1.5 border border-border px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-text-muted transition-colors duration-300 hover:border-text-muted hover:text-text-primary max-md:hidden"
          aria-label="Open command palette"
        >
          <kbd>{isMac ? "⌘" : "Ctrl"}</kbd>
          <kbd>K</kbd>
        </button>

        <button
          type="button"
          onClick={onToggleMenu}
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="group flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.16em] text-text-primary"
        >
          {isMenuOpen ? "Close" : "Menu"}
          <span className="relative block h-[10px] w-6">
            <span
              className={`absolute left-0 top-0 block h-px w-full bg-current transition-transform duration-300 ${
                isMenuOpen ? "translate-y-[4.5px] rotate-45" : "group-hover:-translate-y-[2px]"
              }`}
            />
            <span
              className={`absolute bottom-0 left-0 block h-px w-full bg-current transition-transform duration-300 ${
                isMenuOpen ? "-translate-y-[4.5px] -rotate-45" : "group-hover:translate-y-[2px]"
              }`}
            />
          </span>
        </button>
      </div>
    </nav>
  );
}
