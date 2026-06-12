"use client";

import { useEffect, useRef, useState } from "react";
import { Kicker } from "@/components/kicker";
import { RevealGroup } from "@/components/reveal-group";
import { gsap } from "@/lib/gsap";
import { hasFinePointer, prefersReducedMotion } from "@/lib/motion";
import { SOCIAL_LINKS } from "@/lib/portfolio-data";

export function ContactCta() {
  const magneticRef = useRef<HTMLAnchorElement | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const el = magneticRef.current;
    if (!el) return;
    if (!hasFinePointer() || prefersReducedMotion()) return;

    const toX = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
    const toY = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });

    function onMove(e: MouseEvent) {
      const rect = el!.getBoundingClientRect();
      const relX = e.clientX - (rect.left + rect.width / 2);
      const relY = e.clientY - (rect.top + rect.height / 2);
      toX(relX * 0.12);
      toY(relY * 0.22);
    }

    function onLeave() {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.9,
        ease: "elastic.out(1, 0.4)",
        overwrite: true,
      });
    }

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(SOCIAL_LINKS.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${SOCIAL_LINKS.email}`;
    }
  }

  return (
    <section
      id="contact"
      className="flex min-h-[92svh] flex-col justify-center px-8 py-[10vh] max-md:px-5"
    >
      <RevealGroup>
        <Kicker index="06" label="Contact" note="(no forms, I promise)" />

        <p
          data-reveal
          className="mb-6 max-w-[460px] text-[15px] leading-[1.7] text-text-secondary"
        >
          I&apos;m always up for talking about interesting projects, new tech,
          or bad sci-fi movies.
        </p>

        <div data-reveal className="flex justify-center py-8 max-md:py-4">
          <a
            ref={magneticRef}
            href={`mailto:${SOCIAL_LINKS.email}`}
            data-cursor="view"
            data-cursor-label="EMAIL"
            className="cta-giant wf-text font-expanded inline-block select-none text-center text-[clamp(88px,19vw,330px)] font-bold uppercase leading-[0.82] tracking-[-0.02em]"
            aria-label={`Email ${SOCIAL_LINKS.email}`}
          >
            Say hi
          </a>
        </div>

        <div
          data-reveal
          className="mt-10 flex flex-wrap items-center gap-x-10 gap-y-4 font-mono text-[11px] uppercase tracking-[0.16em]"
        >
          <span className="text-text-muted">Prefer a cold DM?</span>
          <button
            type="button"
            onClick={copyEmail}
            data-cursor="hover"
            className="text-text-secondary transition-colors duration-300 hover:text-accent"
            aria-live="polite"
          >
            {copied ? "Copied ✓" : SOCIAL_LINKS.email}
          </button>
          <a
            href={SOCIAL_LINKS.github}
            target="_blank"
            rel="noreferrer"
            className="text-text-secondary transition-colors duration-300 hover:text-accent"
          >
            GitHub ↗
          </a>
          <a
            href={SOCIAL_LINKS.linkedin}
            target="_blank"
            rel="noreferrer"
            className="text-text-secondary transition-colors duration-300 hover:text-accent"
          >
            LinkedIn ↗
          </a>
        </div>
      </RevealGroup>
    </section>
  );
}
