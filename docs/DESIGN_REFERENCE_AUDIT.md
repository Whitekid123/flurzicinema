# Design reference audit

Captured 24 November 2026. Research precedes homepage implementation. Sources were retrieved through Firecrawl with branding, markdown and full-page screenshots; saved captures are in this directory. Screenshots were visually inspected. These establish composition, not live motion timing. No reference artwork is reused in the product.

## Flim — https://flim.ai/

Observed: oversized tightly tracked black display lettering, generous white space, asymmetric image mosaics, floating pill labels around the “Find your influences” composition, contrasting split black/colored panels, and offset workspace frames in “Save, Collaborate & Share.” The full-page capture has large blank regions where scroll-dependent content was not revealed. Extracted font names include Swizzy and PP Neue Montreal Mono.

Adaptation: independently moving poster layers, oversized type, staggered text lines and a pinned shared-viewing composition. Use dark Flurzi tokens instead of copying the white/green identity. Exact scroll scrub ratios and easing are not established by this capture; local browser research will supplement this if accessible.

## Van Morrison — https://vanmorrison.com/music

Observed: near-black gallery, enormous square album covers on a horizontal track, centered titles and years, persistent year indicator, and Timeline / Grid controls. Cover artwork is the primary visual surface. Extracted Oswald headings and Inria Serif body, with very little corner rounding.

Adaptation: chronological fictional movie archive, selectable posters, animated Timeline/Grid reflow, years, hover lift, and a rotating film-disc behind a selected cover. Portraits replace square records. Live mode-switch motion and hover rotation are not verified by the static capture.

## Trinity — https://trinity.fantik.studio/

Firecrawl timed out; a second web retrieval returned no readable lines. No environmental or transformation interaction is claimed as directly inspected. User-described behavior is the specification: the hero's large statement will contract toward a small destination label while the cinematic image reframes. Depth comes from image and type movement, avoiding a WebGL workload.

## Avalon — https://links.avalonplatforms.com/

Observed: atmospheric cloud landscape fills the entire background, tiny central identity, stacked translucent buttons with fine pale borders, inset highlight and soft shadow. The background video tag exists in retrieved content. Extracted styling indicates Switzer, transparent button fill, 15px radius and an inset highlight.

Adaptation: subtle ambient light in the feature demonstration, translucent secondary controls, animated border highlights and a quiet cinematic final CTA. Cloud/video motion speed and hover timing cannot be verified by a screenshot. Do not import Avalon's assets or make the page glass-heavy.

## Follow-up live browser inspection

Headless Chrome inspected desktop 1440×900 and mobile 390×844 layouts, three scroll positions and the archive Grid control. Evidence is retained in `browser-reference-observations.json` and the named reference screenshots.

- Flim: the scrolled “Find your influences” view directly shows rotated black pills overlapping oversized text, a green geometric motif, an image mosaic above and a persistent translucent header. The later split section displays a large circular visual beside typography. Cookie and promotion overlays obscured some content, and exact scrub mechanics remain unverified.
- Van Morrison: clicking Grid changes the archive into a four-column desktop artwork grid; the mobile capture uses two columns and hides cover captions in that view. The mode toggle remains near the viewport bottom. The timeline page itself has no vertical document travel. A cover hover was exercised, but exact hover enlargement and any record reveal were not isolated well enough to claim fidelity.
- Trinity again failed to produce a usable body in the browser. Its environment remains inaccessible.
- Avalon loaded and was checked at three scroll positions; the atmosphere and control composition are confirmed, but precise moving-background timing is not asserted.

## Original direction

Ink-black editorial cinema journal, ivory grotesk display type, amber punctuation and teal used only in supporting light. Original generated fictional artwork is stored locally. Hero leads into a curated asymmetric poster collection, an archive, narrative product demonstrations, a premiere concept, membership preview and practical FAQ.
