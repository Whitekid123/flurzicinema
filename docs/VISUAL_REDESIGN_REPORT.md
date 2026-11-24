# Flurzi Cinema — visual re-engineering

This report records the previous design iteration. The current implementation and final verification are documented in [FLIM_INTEGRATION_REPORT.md](FLIM_INTEGRATION_REPORT.md).

## Original shortcomings

The prior homepage used real GSAP and Flip, but their visual effect was too modest: a flat-photo hero with a scale tween, slightly offset posters, repeated split sections and a row/grid archive. There was no sustained spatial environment or meaningful persistent film selection. The pre-change code and browser audit is `VISUAL_DESIGN_RESCUE_AUDIT.md`; baseline evidence is in `rescue-before/`.

## New visual direction and scope

The homepage is now an original digital cinema exhibition. Giant solid and outline typography crosses projected film screens; a five-film composition moves through depth and resolves into a collection; the archive behaves like a fan of collectible sleeves around a reel. Supporting sections use an editorial manifesto, a screening desk, a perforated film frame and a membership ticket. The approved ink/charcoal/ivory/amber/teal system is retained.

The original artwork, typed catalog, metadata, public anchors, mobile navigation, accessible dialogs, saved stories, four local feature demonstrations, FAQ and honest future-service notices are preserved. No backend, logged-in app or other route has been added.

## Exact animation systems

### A — Opening sequence

`CinemaHero` and `useExhibitionMotion` implement a 150vh desktop pin with a scrubbed timeline. The screen first expands and advances along Z, while the camera rotates on X/Y and travels in depth. Side screens separate at different Z positions. Four nested screen frames advance in a stagger. The outline title travels out of the scene, while the solid BEYOND word follows a separate path, scales to the measured destination slot, and becomes the small exhibition identifier. The screen then recedes into a tilted collectible frame and the destination caption appears. Forward and reverse states are explicitly tested.

### B — Poster composition

`FeaturedExhibition` uses five persistent movie controls. During a 175vh desktop sequence, each has a different translation, rotation, scale and Z trajectory, including a second intermediate arrangement. Large type travels independently and contracts. Three labels cross on separate paths. The final phase aligns the covers, reveals metadata and resolves into practical browsing. A spotlight filter dims and makes nonmatching covers inert, without disturbing scroll geometry.

### C — Physical Cinema Vault

`VaultExperience` adds persistent film selection, active-year markers, previous/next controls and an explicit spread/gather interaction usable by touch. Covers have a physical fan arrangement and perspective hover feedback. A reel with grooves and a visible registration mark rotates behind the sleeves while the section is visible. GSAP Flip measures the real cover nodes before selection, fan and layout updates, then animates position, rotation and scale into the next state. Grid remains a direct browsing alternative. The selected film has its own synopsis, metadata and detail-dialog action.

### D — Immersive environment

The hero uses actual CSS perspective and preserve-3d planes: main screen, side screens, depth frames and a floor reflection. Scroll controls the camera and scene geometry. Fine-pointer input adds a small independently interpolated camera response. `ProjectionAtmosphere` supplies depth-weighted moving dust at a capped resolution and approximately 30fps. Projector light cones and the slow landscape layer produce continuous environmental motion. This is a CSS 3D/canvas implementation, not a Three.js scene; no WebGL library was installed without a visual need.

### E — Ambience and controls

Moving amber/teal projector light, film reflections, illuminated thin borders and restrained translucent controls complete the environment. The existing button sweep is retained and refined with inset highlights. Hover tilts the actual film surfaces; the primary choreography is driven by scroll rather than reveal-on-scroll fades.

## Responsive and accessibility behavior

Desktop spatial pinning is limited to widths of at least 1024px and disabled under reduced motion. Tablet/mobile use normal-flow image compositions and a touch-friendly sleeve fan, with two-column grids on phones. Oversized typography is bounded by viewport height on wide, short screens. Existing keyboard tabs, focus-contained native dialogs, Escape and saved-story persistence remain. The Vault supports arrow keys, explicit year controls and a separate action to open the selected film.

Reduced motion removes pin spacers, restores untransformed layouts, disables atmospheric rendering and stops the reel. The canvas pauses when offscreen or the document is hidden; its resize, observer, preference and visibility listeners are cleaned up. Scoped GSAP contexts, media-query reversion and an explicit Flip animation cleanup handle component teardown and breakpoint changes.

## Research and captured evidence

Fresh browser reinspection includes gradual forward/reverse wheel input on Flim, both archive modes and perspective hover on Van Morrison, and advancing video time on Avalon. Trinity again failed to return a usable body; its requested behavior is implemented as an original interpretation, with no claim to reproduce an unseen scene.

`rescue-reference/` retains reference frames, geometry observations and recordings. `rescue-after/` retains the first 28 redesign frames and measurements. Recording finalization stalled in the local browser environment; subsequent verification uses frame sequences rather than relying on a recording alone. `rescue-final/` contains the final frame sequences and responsive evidence. Tests inspect actual changing transforms, geometry, canvas frames, reverse state, selection and layout results; screenshots are supporting evidence rather than proof by themselves.

## Validation

Final code checks and browser results are recorded after verification below.

## Remaining limits

The catalog and feature previews remain fictional/local. Streaming, authentication, licensing, billing, synchronized rooms and recommendation/context services remain future integrations. Trinity could not be inspected directly. Chrome automation cannot establish behavior on real Safari/iOS hardware or provide a hardware-independent performance guarantee. The design has a complete static/reduced-motion alternative and intentionally uses no heavyweight WebGL stack.
