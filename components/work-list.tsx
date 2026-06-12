"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { flushSync } from "react-dom";
import { Kicker } from "@/components/kicker";
import { RevealGroup } from "@/components/reveal-group";
import { projects, type Project } from "@/lib/portfolio-data";

const WorkPreview = dynamic(
  () => import("@/components/work-preview").then((m) => m.WorkPreview),
  { ssr: false },
);

export function WorkList() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [hoverProject, setHoverProject] = useState<Project | null>(null);

  const toggle = useCallback((idx: number) => {
    // hide the floating preview while the detail panel is open
    setHoverProject(null);
    const update = () =>
      setOpenIdx((prev) => (prev === idx ? null : idx));
    if (typeof document.startViewTransition === "function") {
      document.startViewTransition(() => {
        flushSync(update);
      });
    } else {
      update();
    }
  }, []);

  return (
    <section id="work" className="px-8 py-[14vh] max-md:px-5 max-md:py-24">
      <RevealGroup>
        <Kicker index="02" label="Selected work" note="(some things I've built)" />

        <ul className="list-none" onMouseLeave={() => setHoverProject(null)}>
          {projects.map((project, i) => {
            const isOpen = openIdx === i;
            return (
              <li
                key={project.title}
                data-reveal
                className="border-t border-border last:border-b"
              >
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  onMouseEnter={() => setHoverProject(isOpen ? null : project)}
                  aria-expanded={isOpen}
                  data-cursor="view"
                  data-cursor-label={isOpen ? "CLOSE" : "OPEN"}
                  className="group grid w-full grid-cols-[3.5rem_1fr_auto] items-baseline gap-x-6 py-7 text-left max-md:grid-cols-[2rem_1fr] max-md:py-5"
                >
                  <span className="font-mono text-[11px] tracking-[0.16em] text-text-muted">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    style={{ viewTransitionName: `work-title-${i}` }}
                    className={`wf-text font-expanded block w-fit uppercase leading-[0.92] tracking-[-0.02em] transition-[color,transform] duration-300 ease-out group-hover:translate-x-2 ${
                      isOpen ? "text-accent" : "text-text-primary group-hover:text-accent"
                    } text-[clamp(34px,6.5vw,104px)] font-bold`}
                  >
                    {project.title}
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-text-muted max-md:hidden">
                    {project.tags.join(" / ")}
                  </span>
                </button>

                {isOpen ? (
                  <div
                    style={{ viewTransitionName: `work-detail-${i}` }}
                    className="grid grid-cols-[3.5rem_1fr_auto] gap-x-6 pb-10 max-md:grid-cols-[2rem_1fr] max-md:pb-8"
                  >
                    <span aria-hidden="true" />
                    <div className="max-w-[680px]">
                      <p className="text-[17px] leading-[1.7] text-text-secondary">
                        {project.description}
                      </p>
                      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
                        {project.url ? (
                          <a
                            href={project.url}
                            target="_blank"
                            rel="noreferrer"
                            data-cursor="hover"
                            className="inline-flex items-center gap-2 border border-border px-5 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-text-primary transition-colors duration-300 hover:border-accent hover:bg-accent hover:text-bg"
                            aria-label={`Visit ${project.title} — opens in a new tab`}
                          >
                            Visit
                            <span aria-hidden="true">↗</span>
                          </a>
                        ) : null}
                        <span className="hidden font-mono text-[11px] uppercase tracking-[0.16em] text-text-muted max-md:inline">
                          {project.tags.join(" / ")}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </RevealGroup>

      <WorkPreview project={hoverProject} />
    </section>
  );
}
