"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { getLenis, scrollToTarget } from "@/lib/scroll";
import { SOCIAL_LINKS } from "@/lib/portfolio-data";
import { useStockholmTime } from "@/lib/use-stockholm-time";

const LINKS = [
  { href: "#work", label: "Work" },
  { href: "#stack", label: "Stack" },
  { href: "#lab", label: "Lab" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

interface MenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MenuOverlay({ isOpen, onClose }: MenuOverlayProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const time = useStockholmTime();

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = prefersReducedMotion();

    const tl = gsap.timeline({
      paused: true,
      onReverseComplete: () => gsap.set(root, { visibility: "hidden" }),
    });
    tl.set(root, { visibility: "visible" });
    tl.fromTo(
      root,
      { clipPath: "inset(0% 0% 100% 0%)" },
      {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: reduced ? 0 : 0.65,
        ease: "power4.inOut",
      },
    );
    tl.fromTo(
      root.querySelectorAll(".menu-line"),
      { yPercent: 112 },
      {
        yPercent: 0,
        duration: reduced ? 0 : 0.75,
        stagger: reduced ? 0 : 0.06,
        ease: "power4.out",
      },
      reduced ? 0 : "-=0.2",
    );
    tl.fromTo(
      root.querySelectorAll(".menu-fade"),
      { opacity: 0 },
      {
        opacity: 1,
        duration: reduced ? 0 : 0.45,
        stagger: reduced ? 0 : 0.04,
      },
      reduced ? 0 : "-=0.4",
    );
    tlRef.current = tl;

    return () => {
      tl.kill();
      tlRef.current = null;
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const tl = tlRef.current;
    if (!root || !tl) return;

    if (isOpen) {
      document.documentElement.classList.add("menu-open");
      getLenis()?.stop();
      tl.timeScale(1).play();
      const firstLink = root.querySelector<HTMLElement>("a, button");
      firstLink?.focus({ preventScroll: true });
    } else {
      document.documentElement.classList.remove("menu-open");
      getLenis()?.start();
      tl.timeScale(1.35).reverse();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "Tab") {
        const root = rootRef.current;
        if (!root) return;
        const focusables = Array.from(
          root.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"),
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  function navigate(href: string) {
    onClose();
    // let the curtain start closing before the scroll kicks in
    setTimeout(() => scrollToTarget(href), 150);
  }

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      className="invisible fixed inset-0 z-[250] flex flex-col justify-between bg-[#0a0a09] px-8 pb-8 pt-28 max-md:px-5"
      style={{ clipPath: "inset(0% 0% 100% 0%)" }}
    >
      <nav>
        <ul className="list-none">
          {LINKS.map((link, i) => (
            <li
              key={link.href}
              className="overflow-hidden border-b border-border last:border-b-0"
            >
              <button
                type="button"
                onClick={() => navigate(link.href)}
                className="menu-line group flex w-full items-baseline gap-6 py-3 text-left"
              >
                <span className="font-mono text-[11px] tracking-[0.16em] text-text-muted transition-colors duration-300 group-hover:text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-expanded text-[clamp(40px,7.5vh,92px)] font-bold uppercase leading-[1.02] tracking-[-0.02em] text-text-primary transition-[transform,color] duration-300 ease-out group-hover:translate-x-3 group-hover:text-accent">
                  {link.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex flex-wrap items-end justify-between gap-6 font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">
        <div className="menu-fade flex flex-col gap-2">
          <a
            href={`mailto:${SOCIAL_LINKS.email}`}
            className="text-text-secondary transition-colors duration-300 hover:text-accent"
          >
            {SOCIAL_LINKS.email}
          </a>
          <div className="flex gap-6">
            <a
              href={SOCIAL_LINKS.github}
              target="_blank"
              rel="noreferrer"
              className="transition-colors duration-300 hover:text-accent"
            >
              GitHub ↗
            </a>
            <a
              href={SOCIAL_LINKS.linkedin}
              target="_blank"
              rel="noreferrer"
              className="transition-colors duration-300 hover:text-accent"
            >
              LinkedIn ↗
            </a>
          </div>
        </div>
        <span className="menu-fade" suppressHydrationWarning>
          Stockholm, SE — {time ?? "--:--"} CET
        </span>
      </div>
    </div>
  );
}
