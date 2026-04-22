import { Reveal } from "@/components/reveal";
import {
  EmailIcon,
  GitHubIcon,
  LinkedInIcon,
} from "@/components/social-icons";
import { SOCIAL_LINKS } from "@/lib/portfolio-data";

export function Contact() {
  return (
    <section
      id="contact"
      className="px-12 py-[120px] text-center max-md:px-6 max-md:py-20"
    >
      <div className="mx-auto max-w-[480px]">
        <Reveal
          as="div"
          className="mb-3 font-mono text-xs uppercase tracking-[0.1em] text-text-muted"
        >
          <span>{"// contact"}</span>
        </Reveal>
        <Reveal
          delay={1}
          as="h2"
          className="mb-14 font-display text-4xl font-bold -tracking-[1px]"
        >
          <span>Say hi</span>
        </Reveal>
        <Reveal
          delay={2}
          as="p"
          className="mb-8 leading-[1.6] text-text-secondary"
        >
          <span>
            I&apos;m always up for talking about interesting projects, new
            tech, or bad sci-fi movies.
          </span>
        </Reveal>
        <Reveal
          delay={3}
          className="flex flex-wrap justify-center gap-3"
        >
          <a
            href={`mailto:${SOCIAL_LINKS.email}`}
            className="inline-flex items-center gap-2 rounded-[10px] border border-border bg-bg-card px-5 py-3 text-[13px] font-medium text-text-secondary transition-all duration-300 hover:-translate-y-0.5 hover:border-accent-light hover:text-accent"
          >
            <EmailIcon />
            Email
          </a>
          <a
            href={SOCIAL_LINKS.github}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-[10px] border border-border bg-bg-card px-5 py-3 text-[13px] font-medium text-text-secondary transition-all duration-300 hover:-translate-y-0.5 hover:border-accent-light hover:text-accent"
          >
            <GitHubIcon />
            GitHub
          </a>
          <a
            href={SOCIAL_LINKS.linkedin}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-[10px] border border-border bg-bg-card px-5 py-3 text-[13px] font-medium text-text-secondary transition-all duration-300 hover:-translate-y-0.5 hover:border-accent-light hover:text-accent"
          >
            <LinkedInIcon />
            LinkedIn
          </a>
        </Reveal>
      </div>
    </section>
  );
}
