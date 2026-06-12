"use client";

import { Kicker } from "@/components/kicker";
import { RevealGroup } from "@/components/reveal-group";
import { useStockholmTime } from "@/lib/use-stockholm-time";

function CurrentlyRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-6 px-5 py-4">
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">
        {label}
      </span>
      <span className="text-right font-mono text-[12px] uppercase tracking-[0.08em] text-text-secondary">
        {children}
      </span>
    </div>
  );
}

export function About() {
  const time = useStockholmTime();

  return (
    <section id="about" className="px-8 py-[14vh] max-md:px-5 max-md:py-24">
      <RevealGroup>
        <Kicker index="05" label="About" note="(the human behind the cursor)" />

        <div className="grid grid-cols-[3fr_2fr] gap-16 max-lg:grid-cols-1 max-lg:gap-10">
          <div>
            <p
              data-reveal
              className="text-[clamp(22px,2.7vw,40px)] font-medium leading-[1.25] tracking-[-0.015em] text-text-primary"
            >
              Developer based in Stockholm. I build things for the web and
              mobile. I like{" "}
              <em className="wf-invert font-serif font-normal italic text-accent">
                clean code
              </em>{" "}
              and{" "}
              <em className="wf-invert font-serif font-normal italic text-accent">
                good coffee
              </em>
              .
            </p>
            <p
              data-reveal
              className="mt-8 max-w-[560px] text-[16px] leading-[1.75] text-text-secondary"
            >
              I care about writing code that&apos;s easy to delete. Most of my
              time goes into React, TypeScript and Next.js. Sometimes I make
              things with Swift and SwiftUI when I should be doing something
              more productive.
            </p>
          </div>

          <div data-reveal className="self-start">
            <div className="border border-border">
              <div className="flex items-center justify-between border-b border-border bg-bg-card px-5 py-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
                  Currently
                </span>
                <span className="animate-pulse-dot h-1.5 w-1.5 rounded-full bg-accent" />
              </div>
              <div className="divide-y divide-border">
                <CurrentlyRow label="Role">Fullstack developer</CurrentlyRow>
                <CurrentlyRow label="Company">Fimento</CurrentlyRow>
                <CurrentlyRow label="Focus">AI agents · lending</CurrentlyRow>
                <CurrentlyRow label="Base">Stockholm, SE</CurrentlyRow>
                <CurrentlyRow label="Local time">
                  <span suppressHydrationWarning>{time ?? "--:--"} CET</span>
                </CurrentlyRow>
                <CurrentlyRow label="Status">
                  <span className="text-accent">Open to interesting problems</span>
                </CurrentlyRow>
              </div>
            </div>
          </div>
        </div>
      </RevealGroup>
    </section>
  );
}
