import { skills } from "@/lib/portfolio-data";

export function Marquee() {
  const items = [...skills, ...skills];

  return (
    <div className="overflow-hidden py-[60px]" aria-label="Skills">
      <div className="marquee-track">
        {items.map((skill, i) => (
          <span
            key={`${skill}-${i}`}
            className="cursor-default whitespace-nowrap rounded-[100px] border border-border px-6 py-2.5 font-display text-[15px] font-medium text-text-muted transition-all duration-300 hover:border-accent-light hover:bg-[color:var(--accent-glow)] hover:text-accent"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}
