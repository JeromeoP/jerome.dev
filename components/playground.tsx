import type { ReactNode } from "react";
import { Kicker } from "@/components/kicker";
import { RevealGroup } from "@/components/reveal-group";
import { Cloth } from "@/components/playground/cloth";
import { ParticleType } from "@/components/playground/particle-type";
import { PretextDemo } from "@/components/playground/pretext-demo";

interface TileProps {
  index: string;
  tag: string;
  title: string;
  blurb: string;
  wide?: boolean;
  children: ReactNode;
}

function Tile({ index, tag, title, blurb, wide, children }: TileProps) {
  return (
    <div
      data-reveal
      className={`flex h-full flex-col gap-7 border-b border-r border-border p-8 transition-colors duration-300 hover:bg-bg-card max-md:p-5 ${
        wide ? "md:col-span-2" : ""
      }`}
    >
      <header className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.16em]">
          <span className="text-accent">{index}</span>
          <span className="text-text-muted">{tag}</span>
        </div>
        <h3 className="text-xl font-semibold tracking-[-0.01em] text-text-primary">
          {title}
        </h3>
        <p className="max-w-[560px] text-[13px] leading-[1.65] text-text-secondary">
          {blurb}
        </p>
      </header>
      <div className="flex-1">{children}</div>
    </div>
  );
}

export function Playground() {
  return (
    <section id="lab" className="px-8 py-[14vh] max-md:px-5 max-md:py-24">
      <RevealGroup>
        <Kicker index="04" label="Lab" note="(my own personal playground)" />
        <h2
          data-reveal
          className="mb-14 max-w-[800px] text-[clamp(28px,3.6vw,52px)] font-medium leading-[1.05] tracking-[-0.015em] max-md:mb-9"
        >
          Cool things the web{" "}
          <em className="wf-invert font-serif font-normal italic text-accent">can</em>{" "}
          do
        </h2>

        <div className="grid grid-cols-1 border-l border-t border-border md:grid-cols-2">
          <Tile
            index="Lab/01"
            tag="Text layout"
            title="Measure text without the DOM"
            blurb="Drag to resize. Line count, height, and max-line-width recompute each frame — pure arithmetic, no reflow. Handles CJK, Arabic and emoji inline."
            wide
          >
            <PretextDemo />
          </Tile>

          <Tile
            index="Lab/02"
            tag="Canvas 2D"
            title="Type with a few thousand particles"
            blurb="An offscreen canvas rasterizes whatever you type, then every particle races to claim a pixel. Your cursor scatters them. They always come home."
          >
            <ParticleType />
          </Tile>

          <Tile
            index="Lab/03"
            tag="Physics"
            title="Cloth you can tear"
            blurb="Verlet integration and a constraint solver written from scratch — no libraries. Drag it, yank it until it rips, hit reset when you feel bad."
          >
            <Cloth />
          </Tile>
        </div>
      </RevealGroup>
    </section>
  );
}
