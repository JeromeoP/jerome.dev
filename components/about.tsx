import { AboutScene } from "@/components/about-scene";
import { Reveal } from "@/components/reveal";

export function About() {
  return (
    <section id="about" className="px-12 py-[120px] max-md:px-6 max-md:py-20">
      <div className="mx-auto grid max-w-[1000px] grid-cols-2 items-center gap-16 max-md:grid-cols-1 max-md:gap-10">
        <Reveal className="relative h-[400px] overflow-hidden rounded-card max-md:h-[260px]">
          <AboutScene />
        </Reveal>
        <div>
          <Reveal
            as="div"
            className="mb-3 font-mono text-xs uppercase tracking-[0.1em] text-text-muted"
          >
            <span>{"// about"}</span>
          </Reveal>
          <Reveal
            delay={1}
            as="p"
            className="mb-4 text-base leading-[1.8] text-text-secondary"
          >
            <span>
              I work at Fimento, where we build a decisioning platform for
              lending &mdash; the system that decides who gets a loan and on
              what terms. AI agents, frontend, backend, full stack. Plus the
              architectural and design calls that come with it.
            </span>
          </Reveal>
          <Reveal
            delay={2}
            as="p"
            className="text-base leading-[1.8] text-text-secondary"
          >
            <span>
              I care about writing code that&apos;s easy to delete. Most of my
              time goes into React, TypeScript and Next.js. Sometimes I make
              things with Swift and SwiftUI when I should be doing something more
              productive.
            </span>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
