# Flurzi Cinema — Flim integration and immersive projection chamber

The existing homepage has been progressively enhanced. Its sections, fictional films, branding, colors, navigation, dialogs, local saved stories, feature demos and disclosures remain present. This is still a frontend concept; streaming, authentication, payments and backend services remain outside this milestone.

## Preserved foundation

- BEYOND / WATCHING hero composition, framed main screen, side images, scroll expansion and the actual oversized-to-small BEYOND title docking.
- Five independent poster paths, moving editorial typography and the final collection shelf in FeaturedExhibition.
- Manifesto with its inline film image; premiere filmstrip; membership ticket; FAQ; final invitation and footer.
- The existing Cinema Vault, rotating reel, selection details, year controls, movie/series filters, physical fan and Timeline/Grid Flip transitions.
- All four original feature demonstrations: join/leave a Cinema Room, choose a StoryMatch mood, explore StoryLens notes and change DataSense picture quality.
- Responsive navigation, native hash links, modal focus trap/restoration, Escape close and browser-local saved films.

There is no `.git` repository in this checkout. A source/configuration/asset rollback snapshot was saved before the enhancements at `rollback/pre-flim-integration/`, including a SHA-256 manifest. No destructive Git commands were used. Restore individual files selectively if needed; do not overwrite subsequent unrelated changes.

## Enhanced and new components

| Component | Result |
| --- | --- |
| CinemaHero | Same composition, now with five ordered film-image groups across its main and side screens, manual film controls and a pause/play control. The selected screen opens the correct existing film dialog. |
| useHeroSequence — new hook | A new disposable GSAP timeline per image cycle, grouped/staggered masked wipes, explicit interruption and stable settling. Focus, hover, scrolling away, hidden tabs and reduced motion stop autoplay. Manual selection remains available. |
| useExhibitionMotion | Existing opening/poster/manifesto/premiere choreography preserved. Adds shared scene progress, responsive line masks, a separate character entrance for Velvet Hours, and reversible character waves on selected existing CTAs. Pin refresh priorities follow document order. |
| ImmersiveCinemaBackground — new component | Owns visibility, device/preferences, lazy loading, WebGL availability and context-loss fallback, resize, pointer input and frame lifecycle. |
| lib/cinemaScene.ts — new scene module | Original Three.js projection chamber, custom shaders, receding luminous apertures with physical ribs, moving perforated film ribbons, fog, colored lighting and a shaded floor with moving light reflections. |
| FeatureLab | The same four panels become a scroll-pinned horizontal desktop journey. Existing tabs select exact destinations through ScrollTrigger's scroll setter, and keyboard controls still work. At <1024px or reduced motion, the original compact tabbed presentation is retained. |
| VaultExperience | Existing Flip retained; final track height is held while Flip temporarily removes cards from flow, and downstream pin positions refresh after layout changes. This prevents following scenes from covering collection controls. |
| styles/integration.css | Scoped additions using the existing Ink/Amber/Teal/Ivory system. Tablet and phone film controls occupy the gap below the screen and avoid the copy/entry links. |

No new homepage architecture, second Vault, duplicate feature section, fabricated film catalog or external reference media was introduced. The old 2D ProjectionAtmosphere component is no longer mounted; it is not presented as the immersive implementation.

## Specific Flim mechanics and evidence

The [ToyFight technical case study](https://tympanus.net/codrops/2026/01/14/a-site-for-sore-eyes-combining-gsap-and-webflow-to-showcase-flim/) was read in full before implementation. Fresh browser traversal of [Flim](https://flim.ai/) covered its complete desktop/mobile homepage, reverse scroll, button hover/reversal, hero focus/blur interruption and its collaboration composition. Evidence: `flim-reference/observations.json`, `interaction-observations.json` and corresponding PNGs. The first traversal included consent/promotion overlays; the later interaction pass dismissed consent and exercised the controls directly.

Implemented adaptations:

1. **Interruptible image groups:** per-cycle timelines are killed before replacing the image arrangement. Image layers animate independently of the existing screen/camera transforms, avoiding competing tweens. The order is deliberate and uses only Flurzi's own fictional artwork.
2. **Responsive masked lines:** SplitText `autoSplit`, `mask: "lines"` and `onSplit` returning the animation handle text reflow at feature/membership headings. Re-entry/reverse scrolling resets the sequence.
3. **Distinct typography:** premiere characters enter through a staggered spatial rotation; selected CTA characters run a short opacity/position wave on hover or focus and reverse on exit. Existing poster-heading choreography remains a third, separate text behavior.
4. **Pinned horizontal storytelling:** desktop scroll drives one continuous track through Rooms → StoryMatch → StoryLens → DataSense, with meaningful working demos. It has a definite first/last panel, reverses, releases after the last panel and uses matchMedia for the compact fallback. Native anchor URLs/history remain intact. Anchor jumps are immediate: CSS smooth anchor travel was removed because an unfinished anchor scroll could override a direct tab destination. GSAP scrub still smooths the cinematic motion; scroll anchoring is disabled within the animated homepage to avoid competing layout compensation.
5. **Flip layouts:** the original Vault's real DOM layout transitions remain the collection implementation. Pin refresh and flow preservation improve integration without making a second gallery.
6. **Masks and lifecycle:** image/line masks provide section-level transitions. Timelines, listeners, SplitText instances, observers, render loops and GPU resources are cleaned up. There is no blocking page-transition overlay on this single-page site.

The case study's Rapier architecture was evaluated: separate physics bodies and DOM rendering, matching colliders, resize rebuilding and offscreen suspension. A falling-object simulation did not improve this already controlled film collection, so Rapier was not added. Lenis and Lottie were also unnecessary. GSAP remains the motion engine; Three.js 0.187.0 is the only new runtime dependency.

## Trinity-inspired environment: where and how it works

The WebGL environment fills **the existing opening hero, `#home`**. It is especially exposed during the final title-docking state: the framed film recedes to the right while the chamber, receding apertures, flowing film edges and floor remain visible around it. It is an actual perspective camera/mesh/shader scene, not a gradient or dust overlay.

Continuous motion changes ribbon deformation/perforation travel, aperture orientation, camera drift, colored light and floor reflection. Pointer input makes a small camera adjustment. The same GSAP progress that transforms BEYOND also moves the camera forward and laterally, rotates the room and shifts the lighting state. The original title itself scales and moves into its destination slot; it is not replaced by a second heading.

[Trinity](https://trinity.fantik.studio/) was retried directly. It did not provide a usable, capturable scene: the browser timed out while waiting for its page/fonts. Earlier direct attempts also failed. No claim is made that its exact original camera sequence was successfully inspected or copied. This is an original cinema environment implementing the user's stated spatial, lighting, continuity and camera requirements.

Performance and fallbacks:

- Three.js loads dynamically only for eligible viewports/devices. No 3D library is needed for the phone/reduced-motion fallback.
- Render cadence is capped around 30 updates/sec; DPR is capped at 1.25, with a 1440 × 1000 CSS-resolution ceiling. Persistently slow sampled frames lower the render resolution further.
- Rendering pauses when the hero is offscreen or the document is hidden. It does not run behind the rest of the page.
- Below 768px, under reduced motion, with save-data or reported memory below 4 GB, without WebGL2, or following context loss, a static perspective chamber illustration remains. Manual film selection and the rest of the homepage remain functional.
- Resize observers, media-query listeners and visibility/pointer handlers are removed on cleanup. Mesh geometries, materials and renderer resources are disposed; the WebGL context is released.

## Before/after and motion evidence

`flim-before/` and `flim-after/` use the **same reduced-motion setting**, widths (1440, 1024, 768, 390), viewport heights and scroll coordinates/section anchors. These comparisons preserve the same content and compositions. This setting deliberately does not show the full new motion system.

| View | Before | After |
| --- | --- | --- |
| Desktop opening | [Before](flim-before/1440-0.png) | [After](flim-after/1440-0.png) |
| Phone opening | [Before](flim-before/390-0.png) | [After](flim-after/390-0.png) |
| Existing Vault | [Before](flim-before/1440-vault.png) | [After](flim-after/1440-vault.png) |
| Feature presentation | [Before](flim-before/1440-features.png) | [After](flim-after/1440-features.png) |
| Tablet features | [Before](flim-before/768-features.png) | [After](flim-after/768-features.png) |

The normal-motion sequence is in **`flim-motion/`**, with measured transforms, positions, renderer state and errors in `verified-motion.json`:

- `hero-opening`, `environment-later`, `hero-next-image-group`: continuous environment and image sequencing.
- `hero-quarter`, `hero-camera`, `hero-near-dock`, `hero-docked`, `hero-camera-reverse`, `hero-opening-reverse`: major spatial transformation and the actual title docking/reversal.
- `posters-scattered`, `posters-travel`, `posters-resolved`, `posters-reverse`: independent poster paths and shelf resolution.
- `vault-fan`, `vault-spread`, `vault-selected`, `vault-grid`: preserved collection mechanics.
- `feature-rooms`, `feature-transition`, `feature-match`, `feature-lens`, `feature-data`, `feature-match-reverse`: pinned horizontal travel and reversal.
- Supporting manifesto, premiere, membership, FAQ and final-invitation captures show preserved sections.

Quick visual checks: [immersive chamber and docked title](flim-motion/hero-docked.png), [camera moving through the opening](flim-motion/hero-camera.png), [posters in coordinated travel](flim-motion/posters-travel.png), [horizontal feature transition](flim-motion/feature-transition.png), [text entering its masks](flim-motion/feature-text-enter.png), [normal-motion phone opening](flim-motion/normal-390-opening.png). Normal-motion responsive frames use `normal-{width}-{section}` names at 1024, 768 and 390px. Additional typography frames compare entering and resolved states.

## Actual validation

The final production suite passes **all 24 tests in 2.3 minutes**. TypeScript (`tsc --noEmit`), lint (`eslint .`) and the production build (`next build`) also pass. The isolated 1024px navigation/tab case additionally passed three consecutive production runs after its fix. `flim-validation-runs.json` records the scoped investigation runs and final successful suite, including earlier failures rather than hiding them.

| Check | Actual result |
| --- | --- |
| TypeScript | Pass |
| ESLint | Pass, no warnings/errors |
| Next.js production build | Pass; homepage and not-found routes statically generated |
| Production browser suite | 24/24 pass |
| 1024px regression repetition | 3/3 consecutive runs pass |
| Responsive widths | 1920, 1440, 1024, 768, 390 and 320px; extra normal-motion interaction coverage at 1024, 768 and 390px |
| Final visual evidence | 45 normal-motion frames at 1440, 1024, 768 and 390px; zero browser/console errors and zero page overflows in the measured samples |

The final frame sequence was inspected visually, including the actual chamber/title dock, horizontal intermediate/resolved states, masked/character text entrances, phone opening/features and tablet opening/Vault. Matching reduced-motion before/after comparisons are also saved at all four requested widths. The measured frame record is `flim-motion/verified-motion.json`. The QA server stopped normally after capture; the existing local development server was left running.

The initial normal-motion captures stalled under system Chrome/forced software-rendering configurations. The bundled browser without that override is the verified configuration. Browser QA also found and fixed the Vault/feature pin overlap, direct-tab/native-smooth-scroll race, mobile selector spacing and controls remaining visible after title docking. These are resolved findings, not untested assumptions.

The production tests cover real WebGL pixel changes (nonuniform framebuffer values, changed values at a later time and after scroll), offscreen pause/resume, context-loss fallback, absent-canvas fallback, save-data, hero autoplay/focus interruption/manual selection and correct dialog, title docking/reversal, independent poster choreography/reversal, Vault fan/rotation/selection/filters/Flip, horizontal feature travel/reversal and all four demos, reduced-motion/breakpoint cleanup, native navigation, focus trapping/restoration, local persistence, FAQ, images and overflow. Responsive normal-motion checks additionally exercise 1024, 768 and 390 pixels.

## Limits and reproduction

Verification uses installed Playwright Chromium headless shell 153.0.8010.12 on this Windows environment. Forcing SwiftShader for the entire browser made CSS 3D screenshots very slow; using the bundled browser without that override restored reliable captures. The original system-Chrome timing failures are not represented as product-test passes. There is no claim of a measured production FPS on physical phones, Safari or Firefox. The compact/reduced fallback intentionally has no continuously moving WebGL scene.

Run `npm run dev` and open `http://127.0.0.1:3000`. After `npm run build`, `node scripts/production-qa.mjs` starts an owned production server at port 3002, runs the browser suite and captures the comparison/motion frames, then stops that server. `CHROME_PATH` can select a different available browser. No public hosting was requested or performed.
