# Flurzi Cinema design system

Original implementation choices; reference observations are in DESIGN_REFERENCE_AUDIT.md.

- Background #0B1018; surface #171E28; text #F6F2E9; secondary #ABB4C0; divider #343A42.
- Primary #F1AE64; highlight #FFCA8B; limited atmospheric teal #7FC9C2.
- Typography: locally served Manrope variable for UI and tightly tracked oversized display, with Georgia italic used sparingly as editorial contrast. Body 16px; secondary metadata 12–14px. Tiny lettering on poster compositions is ornamental; film names and detail controls have readable equivalents outside the artwork.
- Page width 1600px; horizontal inset 5vw desktop and 20px mobile. Space scale 8/12/16/24/32/48/64/96/144px.
- Posters have 2:3 proportions, almost square corners and retained artwork colors. Buttons use small radii; pill shapes identify filter and segmented controls.
- Motion: power3.inOut / power3.out, 180–300ms feedback, 650–900ms layout changes, scroll-linked scale and perspective only on larger devices. Native scrolling remains intact.
- Reduced motion: all pinning, parallax, ambient motion and Flip transitions disabled; static readable layouts remain.
- Mobile: normal-flow hero, horizontal snap collections, stacked story layout and touch-first selection.
