import { SOCIAL_LINKS } from "@/lib/portfolio-data";

export interface PaletteCommand {
  id: string;
  label: string;
  icon: string;
  shortcut?: string;
  run: (ctx: PaletteContext) => void;
}

export interface PaletteContext {
  toggleDarkMode: () => void;
  showToast: (message: string) => void;
}

function scrollToSelector(selector: string) {
  document.querySelector(selector)?.scrollIntoView({ behavior: "smooth" });
}

export const commands: PaletteCommand[] = [
  {
    id: "go-about",
    label: "Go to About",
    icon: "☰",
    run: () => scrollToSelector("#about"),
  },
  {
    id: "go-projects",
    label: "Go to Projects",
    icon: "☰",
    run: () => scrollToSelector("#projects"),
  },
  {
    id: "go-contact",
    label: "Go to Contact",
    icon: "☰",
    run: () => scrollToSelector("#contact"),
  },
  {
    id: "go-playground",
    label: "Go to Playground",
    icon: "☰",
    run: () => scrollToSelector("#playground"),
  },
  {
    id: "email",
    label: "Send Email",
    icon: "✉",
    run: () => {
      window.location.href = `mailto:${SOCIAL_LINKS.email}`;
    },
  },
  {
    id: "github",
    label: "Open GitHub",
    icon: "➜",
    run: () => window.open(SOCIAL_LINKS.github, "_blank"),
  },
  {
    id: "linkedin",
    label: "Open LinkedIn",
    icon: "in",
    run: () => window.open(SOCIAL_LINKS.linkedin, "_blank"),
  },
  {
    id: "dark-mode",
    label: "Toggle Dark Mode",
    icon: "☾",
    run: (ctx) => ctx.toggleDarkMode(),
  },
  {
    id: "top",
    label: "Back to Top",
    icon: "↑",
    run: () => window.scrollTo({ top: 0, behavior: "smooth" }),
  },
  {
    id: "source",
    label: "View Source",
    icon: "</>",
    run: (ctx) =>
      ctx.showToast("You're already looking at it :)"),
  },
];
