import { Reveal } from "@/components/reveal";
import { HeroScene } from "@/components/hero-scene";
import {
  EmailIcon,
  GitHubIcon,
  LinkedInIcon,
} from "@/components/social-icons";
import { SOCIAL_LINKS } from "@/lib/portfolio-data";

export function Hero() {
  return (
    <section
      id="hero"
      className="relative flex min-h-screen items-center overflow-hidden px-12 pb-20 pt-[120px] max-md:px-6 max-md:pb-16 max-md:pt-24"
    >
      <HeroScene />
      <div className="relative z-[2] max-w-[640px]">
        <Reveal as="h1" className="mb-5 font-display font-bold leading-[1.08] -tracking-[2px]">
          <span className="text-[clamp(44px,5.5vw,72px)]">Jerome Planken</span>
        </Reveal>
        <Reveal
          delay={1}
          as="p"
          className="mb-9 max-w-[460px] text-[17px] leading-[1.7] text-text-secondary"
        >
          <span>
            Developer based in Stockholm. I build things for the web and mobile. I like clean code and good coffee.
          </span>
        </Reveal>
        <Reveal delay={2} className="flex items-center gap-6">
          <a
            href={SOCIAL_LINKS.github}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-sm font-medium text-text-secondary transition-colors duration-200 hover:text-accent"
          >
            <GitHubIcon />
            GitHub
          </a>
          <a
            href={SOCIAL_LINKS.linkedin}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-sm font-medium text-text-secondary transition-colors duration-200 hover:text-accent"
          >
            <LinkedInIcon />
            LinkedIn
          </a>
          <a
            href={`mailto:${SOCIAL_LINKS.email}`}
            className="flex items-center gap-1.5 text-sm font-medium text-text-secondary transition-colors duration-200 hover:text-accent"
          >
            <EmailIcon />
            Email
          </a>
        </Reveal>
      </div>
      <div className="animate-scroll-float absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-text-muted">
        <span>Scroll</span>
        <div className="h-9 w-px bg-gradient-to-b from-text-muted to-transparent" />
      </div>
    </section>
  );
}
