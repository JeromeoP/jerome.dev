import { Kicker } from "@/components/kicker";
import { RevealGroup } from "@/components/reveal-group";
import { TypeMarquee } from "@/components/type-marquee";
import { skills } from "@/lib/portfolio-data";

export function Capabilities() {
  const half = Math.ceil(skills.length / 2);
  const bandA = skills.slice(0, half);
  const bandB = skills.slice(half);

  return (
    <section id="stack" className="overflow-hidden py-[14vh] max-md:py-24">
      <div className="px-8 max-md:px-5">
        <RevealGroup>
          <Kicker index="03" label="Stack" note="(tools I reach for)" />
        </RevealGroup>
      </div>

      <div className="flex flex-col gap-3 py-6" aria-label="Skills">
        <TypeMarquee items={bandA} direction={1} />
        <TypeMarquee items={bandB} direction={-1} strong />
      </div>

      <div className="mt-20 px-8 max-md:mt-12 max-md:px-5">
        <RevealGroup className="grid grid-cols-4 border-l border-t border-border max-lg:grid-cols-3 max-md:grid-cols-2">
          {skills.map((skill, i) => {
            const isGag = i === skills.length - 1;
            return (
              <div
                key={skill}
                data-reveal
                className="group border-b border-r border-border p-5 transition-colors duration-300 hover:bg-bg-card"
              >
                <span className="font-mono text-[10px] tracking-[0.16em] text-text-muted transition-colors duration-300 group-hover:text-accent">
                  {String(i + 1).padStart(3, "0")}
                </span>
                <span
                  className={`mt-8 block text-[15px] leading-snug max-md:mt-5 ${
                    isGag
                      ? "font-serif italic text-accent"
                      : "font-medium text-text-secondary transition-colors duration-300 group-hover:text-text-primary"
                  }`}
                >
                  {skill}
                </span>
              </div>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}
