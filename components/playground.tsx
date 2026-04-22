import type { ReactNode } from "react";
import { Reveal } from "@/components/reveal";
import { DeviceInfo } from "@/components/playground/device-info";
import { PretextDemo } from "@/components/playground/pretext-demo";
import { ViewTransitions } from "@/components/playground/view-transitions";

interface TileProps {
  tag: string;
  title: string;
  blurb: string;
  delay?: 1 | 2 | 3 | 4;
  wide?: boolean;
  children: ReactNode;
}

function Tile({ tag, title, blurb, delay = 1, wide, children }: TileProps) {
  return (
    <Reveal
      delay={delay}
      className={`group flex h-full flex-col gap-6 rounded-card border border-border bg-bg-card p-8 max-md:p-6 ${
        wide ? "md:col-span-2" : ""
      }`}
    >
      <header className="flex flex-col gap-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-muted">
          {tag}
        </span>
        <h3 className="font-display text-xl font-semibold -tracking-[0.5px]">
          {title}
        </h3>
        <p className="text-sm leading-[1.6] text-text-secondary">{blurb}</p>
      </header>
      <div className="flex-1">{children}</div>
    </Reveal>
  );
}

export function Playground() {
  return (
    <section
      id="playground"
      className="px-12 py-[120px] max-md:px-6 max-md:py-20"
    >
      <div className="mx-auto max-w-[1000px]">
        <Reveal
          as="div"
          className="mb-3 text-center font-mono text-xs uppercase tracking-[0.1em] text-text-muted"
        >
          <span>{"// playground"}</span>
        </Reveal>
        <Reveal
          delay={1}
          as="h2"
          className="mb-4 text-center font-display text-4xl font-bold -tracking-[1px]"
        >
          <span>Cool things the web can do</span>
        </Reveal>
        <Reveal
          delay={2}
          as="p"
          className="mx-auto mb-14 max-w-[560px] text-center text-base leading-[1.6] text-text-secondary"
        >
          <span>
            My own personal playground.
          </span>
        </Reveal>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Tile
            tag="// text layout"
            title="Measure text without the DOM"
            blurb="Drag to resize. Line count, height, and max-line-width recompute each frame — pure arithmetic, no reflow. Handles CJK, Arabic and emoji inline."
            delay={1}
            wide
          >
            <PretextDemo />
          </Tile>

          <Tile
            tag="// device info"
            title="What the browser knows"
            blurb="Battery, network, gamepad, wake lock, vibration — live from navigator. Plug in a controller, unplug your charger, watch it update."
            delay={2}
          >
            <DeviceInfo />
          </Tile>

          <Tile
            tag="// view transitions"
            title="One-line page morphs"
            blurb="startViewTransition() interpolates between any two DOM states. Click a tile — the browser figures out the animation."
            delay={3}
          >
            <ViewTransitions />
          </Tile>
        </div>
      </div>
    </section>
  );
}
