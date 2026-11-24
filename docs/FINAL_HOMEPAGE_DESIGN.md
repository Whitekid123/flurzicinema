# Flurzi Cinema — final homepage design

## Reference evidence and limits

Reference: https://flim.ai/
Creators: https://tympanus.net/codrops/2026/01/14/a-site-for-sore-eyes-combining-gsap-and-webflow-to-showcase-flim/

The live homepage text was retrieved with Firecrawl. Its cached capture timestamp is 2026-11-23T23:24:22.812Z. The connector exposed markdown and metadata, but no requested screenshot or branding formats. Three new Chromium navigation attempts failed with network access denied, a changed connection, and a 45-second navigation timeout. A fresh simultaneous live-site browser comparison could therefore not be completed.

Actual previously captured browser pixels were inspected at 1440×1000, including `flim-reference/interaction-hero-first.png`, `1440-1001.png`, `1440-2003.png`, `1440-3004.png` and `1440-5007.png`. These show:
- A white masthead with a huge left-aligned wordmark and compact right-hand statement/CTA.
- A pale gridded field with independently sized stills surrounding a wide rounded search control.
- Scattered film imagery gathering into a framed browsing interface.
- Huge left-aligned display text with rotated pill labels and spatially distributed elements.
- Large contrasting split sections and floating interface fragments.

Those reference captures contain cookie/promotion overlays. They are evidence, not product assets. No Flim logo, font file, media, source code or branded graphics were copied into the website.

The creators' article confirms interruptible hero image groups, GSAP Flip for moving images into an interface, SplitText line masks and character hover feedback, desktop-only scroll scenes, and a perspective hinge in the footer. The implementation independently translates these mechanisms into React/GSAP.

## Homepage tokens

User-specified colors: near black #08090B; soft white #F5F5F3; graphite #1B1B1F; muted silver #8C8D93. Intermediate neutral grays supply borders and grid lines. Movie artwork supplies chromatic color. Old amber/teal UI accents are overridden only inside `.editorial-home`; public pages retain their existing approved presentation.

The existing locally served Manrope remains the display/UI font. System monospace labels provide the reference's compact technical counterpoint. Proprietary reference fonts were not downloaded. Display type uses approximately -0.07em tracking, tight 0.9–1.0 line height and viewport-relative sizes. Spacing and dimensions are original responsive choices, not claimed exact extractions.

## Composition and motion

1. Oversized Flurzi masthead and right-aligned discovery statement/CTA. Responsive masked-line entrance and staggered, masked imagery.
2. Nine asymmetric image windows around a real catalog search. Images use matching title records; repeated art is a crop of that title's own concept artwork. Interruptible groups advance every 6.5 seconds, stop while searched/hovered/focused, and have an explicit pause control. Reduced motion disables automatic advancement.
3. Huge “Find your next story” composition, actual genre links and five film frames. GSAP Flip measures the scattered-to-interface transforms; a reversible ScrollTrigger timeline assembles them into a mixed-size browsing interface. No React-owned nodes are reparented.
4. The successful Vault interaction survives: physical sleeve fan, spread/gather, years, paging, filters and Flip Grid/Timeline reflow. Its UI now uses the neutral light surface.
5. The four working feature concepts remain, with compact keyboard-operable tabs and an offset floating demo panel on a near-black field. The former 2.4-width horizontal pin is removed.
6. Contrasting split story spotlight, light FAQ, large membership/discovery invitation and an original hinged-letter image reveal.

The hero is unpinned and uses native scrolling. The only homepage pin is the mosaic: 0.75 viewport heights capped at 720px, scrub 0.25 seconds. No Lenis, wheel interception, touch cancellation or scrolling backend was added. On mobile/tablet below 1024px and with reduced motion, the mosaic resolves into readable normal-flow content with no pins.

All movie-detail dialogs, saved stories, full-detail routes, catalog navigation, local feature controls, FAQ, membership destinations, mobile navigation and footer links remain functional. The homepage still receives server-sourced catalog records and selects up to five for its cinematic composition.

## Content source

The user confirmed that an API key was not obtained and asked to add it later. The redesign therefore uses the five existing fictional records with their own original concept art. It makes no real-film, trailer, playback, cast or release claims. Future approved records flow through the existing server-only provider and rights-aware adapter, documented in CATALOG_INTEGRATION.md.

## Fidelity boundaries

This is a close translation of the observed composition and documented motion approach, not an exact copy. The narrower demo catalog provides fewer distinct frames; the original locally available artwork and licensed font differ; no Lottie eye characters, Rapier physics, Flim branding or colorful geometric identity are imported. The large dark/light split spotlight translates its contrast using movie imagery instead. Fresh live-reference timing and current live mobile behavior remain unverified because browser navigation failed.

## Subsequent motion follow-up

The user requested more active motion after approving this design. See [MOTION_FOLLOWUP_REPORT.md](MOTION_FOLLOWUP_REPORT.md) for the current full brand, new pointer imagery, falling cards, restored scroll-driven features, larger reversible door and updated validation. Statements above about a single pin and manual-only feature tabs describe the prior milestone.
