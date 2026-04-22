export interface Project {
  title: string;
  description: string;
  tags: string[];
  color: number;
  geometry: "torus" | "octahedron" | "icosahedron" | "torus-knot";
  url?: string;
}

export const projects: Project[] = [
  {
    title: "Clipshelf",
    description:
      "My first App Store app. Clipboard manager. Scratched my own itch because the existing options didn't cut it.",
    tags: ["swift", "ios"],
    color: 0x6366f1,
    geometry: "torus",
    url: "https://apps.apple.com/se/app/clipshelf-clipboard-manager/id6755394430",
  },
  {
    title: "RehabBuddy",
    description:
      "Had surgery on my shoulder and needed a way to track my rehab progress. Turns out if you need the app, you build the app.",
    tags: ["swift", "ios"],
    color: 0x10b981,
    geometry: "torus-knot",
  },
  {
    title: "Football stats scraper",
    description: "Scraped football stats from a website and stored them in a database. Used to build a dashboard to analyze the data.",
    tags: ["next.js", "node.js", "python", "scraping"],
    color: 0x8b5cf6,
    geometry: "octahedron",
  },
  {
    title: "Whoop Killer",
    description:
      "Ambitious plan: build my own smart band and ditch Whoop. Have the app, have the Arduino code, have the soldering iron scars. Still paying Whoop $40/month.",
    tags: ["swift", "arduino", "soldering"],
    color: 0xec4899,
    geometry: "icosahedron",
  },
];

export const skills: string[] = [
  "TypeScript",
  "React",
  "Next.js",
  "Swift",
  "SwiftUI",
  "Python",
  "PostgreSQL",
  "Figma",
  "Docker",
  "C#",
  ".NET",
  "Microsoft Azure",
  "AWS",
  "Node.js",
  "Tailwind",
  "LangGraph",
  "Professional vibe coder"
];

export const SOCIAL_LINKS = {
  github: "https://github.com/JeromeoP",
  linkedin: "https://www.linkedin.com/in/jerome-planken-6486ab116/",
  email: "jeromeplanken@hotmail.com",
} as const;
