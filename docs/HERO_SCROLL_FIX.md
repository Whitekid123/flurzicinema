# Hero scroll correction

## Cause

The desktop opening timeline pinned the hero for `+=150%` of the viewport height. At 1440 × 1000, this added 1,500px of scrolling before the hero could leave the screen. Numeric `scrub: 0.65` added 0.65 seconds of animation catch-up, increasing the feeling of resistance. Native scrolling itself was not intercepted: there is no Lenis dependency, custom wheel listener or touchmove cancellation in the homepage. Other `preventDefault` calls handle keyboard controls, modal focus and WebGL context loss.

The baseline browser capture confirms that six 120px wheel inputs advanced the document 720px while the hero remained fixed; the next section was still 1,780px below the viewport top.

## Change

Only the opening ScrollTrigger's distance and smoothing changed in `components/motion/useExhibitionMotion.ts`:

- Pin distance: 65% of viewport height, capped at 650px; recalculated on refresh/resize.
- Scrub catch-up: 0.25 seconds.

At a 1000px viewport height, the extra pinned distance falls from 1,500px to 650px (57% less). The entire original timeline still plays in order and reverses. All camera, screen, title, caption and atmosphere transformations retain their original relative timing and endpoints. Colors, type, composition, assets, background rendering and all other sections are unchanged. Below 1024px and with reduced motion, the existing unpinned behavior remains.

## Verification

Type checking, ESLint and the optimized Next.js build pass. All **31 production browser tests pass** (4.6 minutes), including all 24 existing homepage regressions and seven new scroll regressions.

Production command: `rtk proxy node scripts/production-qa.mjs --skip-capture --max-failures=1 --timeout=120000`. The helper starts an isolated production server on port 3002 and stops it afterward. The longer timeout accommodates local browser delays; the original development server on port 3000 remains available. The QA helper's startup allowance is now 60 seconds instead of 15 seconds.

Seven dedicated scroll regressions pass against the production build: six mouse-wheel steps; thirty small touchpad-style wheel steps; a large gesture into the next section; desktop resize and breakpoint cleanup; native browser touch swipes forward/back at 390px and 768px; and native scrolling with reduced motion. Normal-motion tests explicitly set `reducedMotion: "no-preference"` so the host operating system's accessibility preference cannot silently skip the desktop animation. Reduced-motion tests separately override this to `reduce`.

The after-capture measures 720px of document travel after six 120px wheel inputs: the hero has moved up 70px and the next section starts at viewport y=930, already visible. At 1,200px of travel, the next section starts at y=450. Before this fix, those same positions left the hero fixed and the next section at y=1,780 and y=1,300 respectively. The capture records no page errors.

Opening, docked, reverse-midpoint and reverse-opening title widths and camera matrices match the baseline exactly at equivalent animation progress. A source comparison also confirms that only the hero configuration changed in the motion hook.

Evidence: [before measurements](hero-scroll/before/measurements.json), [after measurements](hero-scroll/after/measurements.json), [before: six wheel inputs](hero-scroll/before/wheel-6.png), [after: six wheel inputs](hero-scroll/after/wheel-6.png). The original motion hook is saved alongside the baseline for a precise comparison. The live film selector and ambient background vary with time; geometry comparisons use equivalent timeline progress.

The input checks use Chromium automation with wheel deltas and browser-level touch events. They do not substitute for physical mouse, trackpad or phone testing, or Safari/Firefox testing.
