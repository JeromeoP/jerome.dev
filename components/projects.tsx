import { Reveal } from "@/components/reveal";
import { ProjectThumb } from "@/components/project-thumb";
import { projects, type Project } from "@/lib/portfolio-data";

function ProjectCardInner({ project }: { project: Project }) {
  return (
    <>
      <ProjectThumb color={project.color} geometry={project.geometry} />
      <div className="p-6">
        <div className="mb-2.5 flex flex-wrap gap-1.5">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-[100px] bg-bg px-2.5 py-[3px] font-mono text-[11px] font-medium text-text-muted"
            >
              {tag}
            </span>
          ))}
        </div>
        <h3 className="mb-1.5 flex items-center gap-2 text-lg font-semibold -tracking-[0.3px]">
          <span>{project.title}</span>
          {project.url && (
            <span
              aria-hidden="true"
              className="inline-block text-sm text-text-muted transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
            >
              ↗
            </span>
          )}
        </h3>
        <p className="text-sm leading-[1.6] text-text-secondary">
          {project.description}
        </p>
      </div>
    </>
  );
}

function ProjectCard({
  project,
  delay,
}: {
  project: Project;
  delay: 1 | 2 | 3 | 4;
}) {
  const baseClass =
    "group relative block overflow-hidden rounded-card border border-border bg-bg-card transition-all duration-[400ms] hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.06)]";

  if (project.url) {
    return (
      <Reveal delay={delay} className="rounded-card">
        <a
          href={project.url}
          target="_blank"
          rel="noreferrer"
          className={`${baseClass} cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2`}
          aria-label={`${project.title} — opens in a new tab`}
        >
          <ProjectCardInner project={project} />
        </a>
      </Reveal>
    );
  }

  return (
    <Reveal delay={delay} className={baseClass}>
      <ProjectCardInner project={project} />
    </Reveal>
  );
}

export function Projects() {
  return (
    <section id="projects" className="px-12 py-[120px] max-md:px-6 max-md:py-20">
      <div className="mx-auto max-w-[1000px]">
        <Reveal
          as="div"
          className="mb-3 font-mono text-xs uppercase tracking-[0.1em] text-text-muted"
        >
          <span>{"// projects"}</span>
        </Reveal>
        <Reveal
          delay={1}
          as="h2"
          className="mb-14 font-display text-4xl font-bold -tracking-[1px]"
        >
          <span>Some things I&apos;ve built</span>
        </Reveal>
        <div className="grid grid-cols-2 gap-7 max-md:grid-cols-1">
          {projects.map((project, i) => (
            <ProjectCard
              key={project.title}
              project={project}
              delay={(i + 1) as 1 | 2 | 3 | 4}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
