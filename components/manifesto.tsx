"use client";

import { useEffect, useRef } from "react";
import { Kicker } from "@/components/kicker";
import { RevealGroup } from "@/components/reveal-group";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

interface Token {
  text: string;
  em?: boolean;
}

const TOKENS: Token[] = [
  { text: "At" },
  { text: "Fimento" },
  { text: "I" },
  { text: "build" },
  { text: "the" },
  { text: "system" },
  { text: "that" },
  { text: "decides", em: true },
  { text: "who" },
  { text: "gets" },
  { text: "a" },
  { text: "loan" },
  { text: "—" },
  { text: "and" },
  { text: "on" },
  { text: "what" },
  { text: "terms.", em: true },
  { text: "AI" },
  { text: "agents," },
  { text: "frontend," },
  { text: "backend," },
  { text: "and" },
  { text: "the" },
  { text: "architecture" },
  { text: "calls" },
  { text: "in" },
  { text: "between." },
];

export function Manifesto() {
  const textRef = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    const words = el.querySelectorAll<HTMLElement>(".mw");

    if (prefersReducedMotion()) {
      gsap.set(words, { opacity: 1 });
      return;
    }

    const tween = gsap.to(words, {
      opacity: 1,
      ease: "none",
      stagger: 0.06,
      scrollTrigger: {
        trigger: el,
        start: "top 80%",
        end: "bottom 45%",
        scrub: 0.4,
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  return (
    <section id="manifesto" className="px-8 py-[16vh] max-md:px-5 max-md:py-24">
      <RevealGroup>
        <Kicker index="01" label="Manifesto" note="(what I actually do)" />
      </RevealGroup>
      <p
        ref={textRef}
        className="max-w-[1320px] text-[clamp(26px,4.2vw,62px)] font-medium leading-[1.14] tracking-[-0.015em] text-text-primary"
      >
        {TOKENS.map((token, i) => (
          <span key={i}>
            <span
              className={`mw inline-block ${
                token.em
                  ? "wf-invert font-serif font-normal italic tracking-normal text-accent"
                  : ""
              }`}
            >
              {token.text}
            </span>{" "}
          </span>
        ))}
      </p>
    </section>
  );
}
