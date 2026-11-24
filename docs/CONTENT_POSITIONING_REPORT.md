# Flurzi Cinema — content and product positioning correction

The existing homepage now describes Flurzi Cinema as a movie and television streaming platform in development. This was a copy refinement, with one small static-layout readability fix.

## Major copy changes

| Area | Previous direction | Updated copy |
| --- | --- | --- |
| Hero | A new way into cinema / story lovers | Movies. Series. Entertainment. All in one place. |
| Hero context | Cinema from a different angle | Movie & TV streaming · Platform preview |
| Featured cards | Let yourself fall into a story | Discover movies. Explore series. |
| Discovery | Find your next story | Find your next watch |
| Collection | Collect moments. Follow stories. | Explore the movie & TV collection; browse movies and series |
| Feature introduction | More than a screen. An experience. | Choose how you watch |
| Spotlight | Stories that stay with you | Series worth watching, with a Movies fallback when the featured title is a film |
| FAQ | Before the opening scene | Your questions. Answered. |
| Final CTA | Your next great story | Your next movie night; Explore the catalog |
| Saved titles | Save to my stories | Add to watchlist / Remove from watchlist |
| SEO | Beyond watching / extraordinary stories | Flurzi Cinema — Movies & TV Streaming |

Cinema Rooms explains the planned shared movie-night experience. StoryMatch explains mood and preference matching, and identifies its current results as samples. StoryLens explains additional movie information. DataSense explains streaming quality and estimated data consumption. Feature names and all demo controls remain in place.

FAQ, footer, accessibility copy, search prompts and metadata identify the product category and preview status. No immediate streaming, production recommendations, shared playback, licensing, prices, supported-device commitments or catalog-size claims were introduced. No API configuration was added.

## Preservation and small text-fit correction

Existing page order, layout components, type system, colors, imagery, poster arrangements, navigation destinations, save-storage key and interactions remain. GSAP, ScrollTrigger, SplitText, pin distances, scrub values, pointer reveals, feature transitions and the footer door code were not changed.

Film records before the FAQ export in data/movies.ts are byte-for-byte identical to the pre-change backup, preserving all titles, synopses, metadata and artwork references.

Visual review exposed an existing static-layout issue: the discovery genre-label container remained absolutely positioned across its entire section on narrow screens and with reduced motion, stretching its labels over the heading. One scoped CSS rule now places that container in normal flow in those two modes. Animated desktop positioning is unchanged. Existing responsive and reduced-motion tests now check that these labels stay below the heading, above the mosaic and under 100px tall.

## Validation

- Final production build passed, including TypeScript; build ID: fSVrJy4wzZ3CTasekEw_V.
- ESLint passed.
- All 42 existing regression tests passed against the production server in 4.8 minutes. Assertions were updated for the watchlist, title-details and All titles labels; static-label readability assertions were added to the existing responsive/reduced-motion checks.
- Coverage includes native wheel and small wheel-delta progression, emulated touch swipes, forward/reverse mosaic assembly, falling-card reversal, pointer image variety and pause controls, all four feature transitions, footer-door reversal, keyboard controls, watchlist persistence, search and public-route navigation.
- Responsive tests covered 1920, 1440, 1024, 768, 390 and 320px. Dedicated content captures covered 1440, 768, 390 and 320px with all four feature panels, plus hero/discovery/spotlight/finale captures. No clipped measured text, horizontal overflow or browser console/page errors were recorded.
- Final animated production captures and video recorded zero browser errors and zero overflow; desktop retained exactly three intended pins, while tablet/phone reduced-motion views had zero.
- Desktop hero, feature and finale captures and narrow-screen content captures were visually inspected.
- Input checks used Chromium automation and emulation; physical trackpad, mouse and phone hardware were not available.
- The QA server was stopped after capture. The previous development preview was no longer listening at the final check; a new development preview was started on port 3000.

Content screenshots and measurements: [positioning-copy](./positioning-copy/observations.json).
Animated production captures: [motion-followup](./motion-followup/observations.json).
Pre-change sources: [rollback snapshot](./rollback/pre-positioning-copy/SNAPSHOT.json).

No additional public pages or catalog integration were introduced.
