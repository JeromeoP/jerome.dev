import { About } from "@/components/about";
import { Capabilities } from "@/components/capabilities";
import { ContactCta } from "@/components/contact-cta";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/hero";
import { Manifesto } from "@/components/manifesto";
import { Playground } from "@/components/playground";
import { PortfolioShell } from "@/components/portfolio-shell";
import { WorkList } from "@/components/work-list";

export default function Page() {
  return (
    <main>
      <PortfolioShell />
      <Hero />
      <Manifesto />
      <WorkList />
      <Capabilities />
      <Playground />
      <About />
      <ContactCta />
      <Footer />
    </main>
  );
}
