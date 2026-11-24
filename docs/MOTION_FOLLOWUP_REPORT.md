# Homepage motion follow-up

The user-approved neutral homepage remains the foundation. This follow-up strengthens four specific interactions and restores the complete visible brand name.

## Causes and changes

- The hero displayed only “flurzi” as visible display text. It now visibly reads **Flurzi Cinema**, with the existing accessible full name retained.
- Hovering anywhere over the hero image field previously paused its ambient sequence. The field now stays active while desktop pointer movement reveals a pool of six animated image windows, aligned to its grid. Reveals alternate scenes, scale into view and clear after a short hold. Search focus, keyboard focus, explicit Pause, reduced motion and touch viewports are respected.
- Three original additional scenes replace repeated crops: a cave scene for The Quiet Beyond, a carriage scene for The Last Train North, and an apartment scene for Velvet Hours. The hero has eight distinct source artworks across five fictional titles. Group changes now arrive every 4.2 seconds and keep imagery visible during the transition instead of wiping the entire field blank.
- A new five-card boxed-film composition sits immediately after the hero. As the user scrolls, the cards fall with acceleration, rotate, bounce and settle along a floor. Reverse scrolling lifts them back through the same measured path. Film browsing follows this composition. Card buttons open their matching title dialogs.
- The feature section had become manual-only tabs. Desktop scrolling now moves from Cinema Rooms through StoryMatch, StoryLens and DataSense. Short readable holds separate the smooth transitions without snapping browser scroll. Direct tabs and keyboard navigation still select each experience.
- The image in the final “i” was too small, with its opening spread over most of the final section. Its door is now larger and opens over the window's own visible scroll range. It closes when scrolling back; the image scales gently behind the hinged panel.

## Scroll and accessibility boundaries

The hero remains unpinned. Three desktop scenes use concise maximum distances:
- Falling cards: 62vh, capped at 620px; scrub 0.2.
- Existing mosaic assembly: 75vh, capped at 720px; scrub 0.25.
- Four-feature progression: 95vh, capped at 950px; scrub 0.3.

There are no wheel or touch cancellation handlers, Lenis changes or scroll locking. Pointer reveals listen passively to pointer movement, use a fixed DOM pool and do not intercept clicks. Pointer motion is gated to fine desktop pointers, cleared on leave/visibility changes, and disabled by Pause or reduced motion. Tablet/phone layouts have no pinned scenes; direct feature tabs remain animated on normal motion. Reduced motion keeps resolved layouts and exposes the footer image without requiring door animation.

Public routes, data contracts, local watchlist and feature demo state remain intact. No API credentials, real-film promotional artwork, authentication or payment changes were introduced.

## New artwork

Generated with the built-in image_gen tool, inspected, copied into this repository and optimized to 1280×720 WebP:
- public/images/hero/quiet-cave.webp
- public/images/hero/train-carriage.webp
- public/images/hero/velvet-translator.webp

PNG masters are saved beside those files. Exact prompts and tool provenance: [MOTION_ARTWORK_PROMPTS.json](MOTION_ARTWORK_PROMPTS.json). The mapping in lib/heroArtwork.ts restricts these extra scenes to the corresponding fictional records; future real catalog titles do not receive fictional imagery.

## Verification and evidence

The five focused browser checks passed during development: pointer scene variety and pause/reduced motion, card falling and reverse coordinates, all four scroll-selected features and their reverse path, opening/closing door geometry, and phone/reduced-motion usability.

Final production build **passed**, including TypeScript and all 25 generated route entries. Build ID: p66tvd76fh8_h8J0oucEI. ESLint passed with no warnings.

The complete production run passed **42 tests in 6.7 minutes** using one Chromium worker: `rtk proxy node scripts/production-qa.mjs --max-failures=3 --timeout=120000`. This includes the five new motion checks, exact forward/reverse comparisons, small wheel deltas, mouse-wheel travel, CDP touch gestures, pin cleanup on resize and motion preference changes, homepage widths from 320 to 1920px, all 21 public URLs at 1440/768/390px, and all existing catalog/form/navigation/detail/feature interactions.

Visual evidence and the recorded walkthrough are under motion-followup/. The recording demonstrates pointer reveals, falling cards, collection browsing, all four feature transitions, reverse travel and the opening/closing door. observations.json records browser errors, overflow, pin counts and transforms.

Physical hardware and Safari/Firefox were not tested. No new claim of exact live Flim timing is made; earlier live-reference access limitations still apply. The new behavior follows the user's motion feedback and the already inspected creators' description. Existing public routes retain their visual design.

The final production recording/capture pass completed with zero browser errors and zero horizontal overflow in every recorded sample. Desktop pin count was three; phone/tablet reduced-motion pin count was zero. The final video is motion-followup/motion-walkthrough.webm.
