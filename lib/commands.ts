import { SOCIAL_LINKS } from "@/lib/portfolio-data";
import { scrollToTarget } from "@/lib/scroll";

export interface PaletteCommand {
  id: string;
  label: string;
  hint: string;
  run: (ctx: PaletteContext) => void;
}

export interface PaletteContext {
  toggleWireframe: () => boolean;
  showToast: (message: string) => void;
}

export const commands: PaletteCommand[] = [
  {
    id: "go-work",
    label: "Go to Work",
    hint: "Nav",
    run: () => scrollToTarget("#work"),
  },
  {
    id: "go-stack",
    label: "Go to Stack",
    hint: "Nav",
    run: () => scrollToTarget("#stack"),
  },
  {
    id: "go-lab",
    label: "Go to Lab",
    hint: "Nav",
    run: () => scrollToTarget("#lab"),
  },
  {
    id: "go-about",
    label: "Go to About",
    hint: "Nav",
    run: () => scrollToTarget("#about"),
  },
  {
    id: "go-contact",
    label: "Go to Contact",
    hint: "Nav",
    run: () => scrollToTarget("#contact"),
  },
  {
    id: "copy-email",
    label: "Copy Email",
    hint: "Social",
    run: (ctx) => {
      navigator.clipboard
        .writeText(SOCIAL_LINKS.email)
        .then(() => ctx.showToast("Email copied to clipboard"))
        .catch(() => {
          window.location.href = `mailto:${SOCIAL_LINKS.email}`;
        });
    },
  },
  {
    id: "github",
    label: "Open GitHub",
    hint: "Social",
    run: () => window.open(SOCIAL_LINKS.github, "_blank"),
  },
  {
    id: "linkedin",
    label: "Open LinkedIn",
    hint: "Social",
    run: () => window.open(SOCIAL_LINKS.linkedin, "_blank"),
  },
  {
    id: "wireframe",
    label: "Toggle Wireframe Mode",
    hint: "FX",
    run: (ctx) => {
      const enabled = ctx.toggleWireframe();
      ctx.showToast(
        enabled ? "Wireframe mode — a tribute to v1" : "Back to the smoke",
      );
    },
  },
  {
    id: "top",
    label: "Back to Top",
    hint: "Nav",
    run: () => scrollToTarget(0),
  },
  {
    id: "source",
    label: "View Source",
    hint: "Misc",
    run: (ctx) => ctx.showToast("You're already looking at it :)"),
  },
];
