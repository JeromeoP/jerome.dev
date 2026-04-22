# Jerome Planken — Portfolio

A personal portfolio built with Next.js 15 (App Router), React 19, TypeScript,
Tailwind CSS, and Three.js.

## What's in here

- **Hero** — floating Three.js shapes that subtly react to cursor movement
- **About** — distorting wireframe icosahedron with an inner sphere
- **Skills marquee** — infinite horizontal scroll, pauses on hover
- **Projects grid** — each card has its own mini Three.js scene
- **Command palette** (`⌘K`) — keyboard-first navigation & actions
- **Cursor particle trail** — fine-pointer only, respects reduced motion
- **Konami code** — `↑ ↑ ↓ ↓ ← → ← → B A` toggles dark mode
- **Live Stockholm time widget** (bottom right)
- **Scroll reveals**, **progress bar**, **hide-on-scroll nav**
- **Footer easter egg** — keep clicking "Built on a Sunday"

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

### Scripts

| command            | what it does                           |
| ------------------ | -------------------------------------- |
| `npm run dev`      | start the dev server (Turbopack)       |
| `npm run build`    | production build                       |
| `npm run start`    | serve the production build             |
| `npm run lint`     | Next.js / ESLint checks                |
| `npm run typecheck`| strict TypeScript check, no emit       |

## Structure

```
app/            App Router entry (layout.tsx, page.tsx, globals.css)
components/     UI + Three.js scenes (each scene is its own client component)
lib/            Data (projects, skills), palette commands, hooks
```

All Three.js scenes are isolated client components, each with its own
`useEffect` cleanup that disposes geometries, materials, and the WebGL
renderer — important for hot-reload and avoiding GPU leaks.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the full plan. TL;DR: ship to
Vercel, point `jerome.dev` (or similar) at it, done.
