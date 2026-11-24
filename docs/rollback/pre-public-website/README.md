# Flurzi Cinema

A cinematic public homepage and reusable frontend foundation. This is a frontend concept with fictional films and local interactive demos. No streaming, authentication, payments or backend services are implemented.

The current enhancement preserves the exhibition design and adds an interruptible film-image sequence, a real Three.js projection chamber, masked typography, character hover feedback and a pinned horizontal journey through the existing four feature demos. The five-poster composition and selectable sleeve-and-reel Vault remain intact. See `docs/FLIM_INTEGRATION_REPORT.md` for current motion evidence and verification, and `docs/FLIM_INTEGRATION_PLAN.md` for the reference inventory.

## Run locally

Requires Node.js 20.9+ and npm.

```sh
npm install
npm run dev
```

Open http://127.0.0.1:3000. On Windows PowerShell with script execution disabled, use `npm.cmd` in place of `npm`.

```sh
npm run typecheck
npm run lint
npm run build
npm start
npm run test:e2e
```

Browser tests require an already running server at port 3000. This Windows checkout defaults to its installed Playwright Chromium headless shell. Set `CHROME_PATH` to an available Chromium/Chrome executable on other systems. Avoid forcing SwiftShader for the whole browser; it substantially slowed CSS 3D captures on this machine.

After `npm run build`, run `node scripts/production-qa.mjs` for production browser verification and the current motion/responsive frame captures. It temporarily serves port 3002 and stops that owned server on completion. Set `PLAYWRIGHT_BASE_URL` to use a different existing server for tests, or `PREVIEW_URL` for `scripts/integration-inspect.mjs --after` and `scripts/integration-motion.mjs`.

## Structure

- `app/`: Next.js App Router composition, metadata and icon.
- `components/layout/`: responsive navigation and footer.
- `components/home/`: homepage, interactive Vault and four feature previews.
- `components/motion/`: scoped GSAP / ScrollTrigger choreography.
- `lib/cinemaScene.ts`: lazy-loaded Three.js projection chamber and GPU resource lifecycle.
- `components/ui/`: accessible dialog, poster and original vector film-reel.
- `data/`, `types/`: typed fictional catalog, membership and service contracts.
- `styles/`: CSS theme, responsive compositions and reduced-motion rules. Tailwind v4 is available through PostCSS.
- `public/`: local original artwork, optimized WebP and open-licensed Manrope font.
- `docs/`: reference audit, design system, validation evidence and implementation report.

Saved stories use browser local storage (`flurzi-saved-demo`). All feature demos run locally. Replace catalog, authentication, membership and media through the interfaces in `types/cinema.ts`; no service is called by this milestone. The site is deliberately marked `noindex` until production content and launch details exist.

Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SITE_URL` to the real origin before deployment so social image URLs resolve correctly. Keep the preview unindexed until approved production content and policies are ready.

The project was requested as a repository deliverable and has not been deployed to public hosting.

The immersive environment is in the opening hero and responds to the same scroll progress that docks BEYOND. It pauses offscreen/when the tab is hidden. Below 768px, under reduced motion, with save-data/low memory, or without WebGL2, a static perspective illustration preserves the scene without a render loop. At widths below 1024px or under reduced motion, features retain their original tabbed layout. No Rapier, Lenis or Lottie dependency was added. The source and assets from before this integration are preserved with hashes in `docs/rollback/pre-flim-integration` because this checkout has no Git repository.
