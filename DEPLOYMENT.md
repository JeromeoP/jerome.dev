# Deployment plan

## TL;DR — the recommended path

**Vercel + a custom domain.** Push to GitHub, import into Vercel, point DNS.
You'll be live in ~10 minutes with:

- Automatic HTTPS
- Global CDN
- Preview deployments on every PR
- Zero-config Next.js 15 App Router support
- Edge image optimization, caching, analytics
- Free tier is more than enough for a personal site

This is a Next.js app made by the company that makes Next.js, so everything
just works — server components, fonts, route handlers (if you add any later).

## Step-by-step (Vercel)

### 1. Put it on GitHub

```bash
cd /Users/jeromeplanken/Documents/Repon/portfolio
git init
git add .
git commit -m "initial portfolio"
gh repo create jerome-portfolio --public --source=. --push
```

(Or use the GitHub UI and a normal `git remote add` + `git push`.)

### 2. Import into Vercel

- Go to <https://vercel.com/new>
- Pick the repo
- Framework preset auto-detects **Next.js** — accept all defaults
- Click **Deploy**

You'll get a `*.vercel.app` URL in ~60 seconds.

### 3. Custom domain

Options, cheapest first:

| Registrar             | `.dev` / `.me` / `.io`       | Notes                          |
| --------------------- | ---------------------------- | ------------------------------ |
| Cloudflare Registrar  | at-cost (~$10/yr for `.com`) | No upsells, WHOIS privacy free |
| Porkbun               | cheap, friendly UI           | Good default                   |
| Namecheap             | fine                         | Frequent renewal upsells       |

Buy something like `jerome.dev` / `jeromeplanken.com` / `jerome.codes`.

In Vercel:
1. Project → Settings → Domains → **Add**
2. Type the domain, Vercel gives you either an `A` record or `CNAME`
3. Paste into your registrar's DNS
4. HTTPS cert provisioned automatically within a few minutes

### 4. Optional extras

- **Vercel Analytics** — free, privacy-friendly pageview metrics.
  Enable in project settings; it's a one-line `@vercel/analytics` add.
- **Open Graph image** — add `app/opengraph-image.tsx` to auto-generate a
  nice link preview.
- **Robots + sitemap** — add `app/robots.ts` and `app/sitemap.ts`.

## Alternative hosts

All of these work, just with small trade-offs:

| Host             | Pros                                   | Cons                                   |
| ---------------- | -------------------------------------- | -------------------------------------- |
| **Netlify**      | Nice UX, generous free tier            | Next.js support is slightly behind     |
| **Cloudflare Pages** | Very fast edge, generous limits    | SSR via Workers; a bit more fiddly     |
| **Fly.io**       | Full control, global edge              | You manage a Dockerfile and machines   |
| **Railway**      | Also easy                              | Fewer free resources                   |
| **Self-hosted**  | Maximum control, no vendor lock-in     | You maintain TLS, updates, monitoring  |

### Static export option (GitHub Pages / any static host)

The portfolio is entirely client-rendered with no server APIs, so if you want
to host on GitHub Pages or Cloudflare R2, add to `next.config.ts`:

```ts
const nextConfig: NextConfig = {
  output: "export",
};
```

Then `npm run build` emits an `out/` directory. Note: you'll lose Next.js
image optimization (not used here) and incremental static regeneration
(not used here) — both fine for this project.

## Performance checklist before going live

- Run `npm run build` locally and check bundle size. Three.js is ~600KB
  minified; if you want to squeeze further, lazy-load scenes with
  `dynamic(() => import(...), { ssr: false })`.
- Lighthouse the production URL. Expect ≥95 on Performance / Accessibility.
- Add `prefers-reduced-motion` checks if you add more animation (the cursor
  trail and hero already respect it).
- Test on a throttled connection; WebGL scenes should degrade gracefully
  (they're all `alpha: true` and draw on top of normal DOM).

## CI (optional, nice-to-have)

Add `.github/workflows/ci.yml`:

```yaml
name: ci
on: [push, pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run build
```

Vercel will also run a build for every PR automatically — the GitHub Action
is just an extra safety net.

## Recommended order

1. Push to GitHub
2. Deploy to Vercel (use the `*.vercel.app` URL for a day or two)
3. Buy a domain you actually like
4. Point it at Vercel
5. Share it
