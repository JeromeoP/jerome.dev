import { About } from "@/components/about";
import { Contact } from "@/components/contact";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/hero";
import { Marquee } from "@/components/marquee";
import { Playground } from "@/components/playground";
import { PortfolioShell } from "@/components/portfolio-shell";
import { Projects } from "@/components/projects";

export default function Page() {
  return (
    <main>
      <PortfolioShell />
      <Hero />
      <About />
      <Marquee />
      <Projects />
      <Contact />
      <Playground />
      <Footer />
    </main>
  );
}
