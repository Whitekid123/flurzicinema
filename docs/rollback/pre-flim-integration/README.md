# Flurzi Cinema

A cinematic public homepage and reusable frontend foundation. This is a frontend concept with fictional films and local interactive demos. No streaming, authentication, payments or backend services are implemented.

The visual redesign adds a CSS 3D cinema environment, scroll-controlled screen/camera sequence, five-poster composition and a selectable sleeve-and-reel Vault. See `docs/VISUAL_REDESIGN_REPORT.md` for the current design and motion verification; the earlier implementation report describes the first milestone.

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

Browser tests require an already running server at port 3000. By default they use the installed Windows Chrome; set `CHROME_PATH` to your Chrome executable on other systems. The screenshots/research helpers also use Windows Chrome.

After `npm run build`, run `node scripts/production-qa.mjs` for production browser verification and the final motion/responsive frame captures. It temporarily serves port 3002 and stops that owned server on completion. Set `PLAYWRIGHT_BASE_URL` to use a different existing server for tests, or `PREVIEW_URL` for `scripts/rescue-final-capture.mjs`.

## Structure

- `app/`: Next.js App Router composition, metadata and icon.
- `components/layout/`: responsive navigation and footer.
- `components/home/`: homepage, interactive Vault and four feature previews.
- `components/motion/`: scoped GSAP / ScrollTrigger choreography.
- `components/ui/`: accessible dialog, poster and original vector film-reel.
- `data/`, `types/`: typed fictional catalog, membership and service contracts.
- `styles/`: CSS theme, responsive compositions and reduced-motion rules. Tailwind v4 is available through PostCSS.
- `public/`: local original artwork, optimized WebP and open-licensed Manrope font.
- `docs/`: reference audit, design system, validation evidence and implementation report.

Saved stories use browser local storage (`flurzi-saved-demo`). All feature demos run locally. Replace catalog, authentication, membership and media through the interfaces in `types/cinema.ts`; no service is called by this milestone. The site is deliberately marked `noindex` until production content and launch details exist.

Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SITE_URL` to the real origin before deployment so social image URLs resolve correctly. Keep the preview unindexed until approved production content and policies are ready.

The project was requested as a repository deliverable and has not been deployed to public hosting.
