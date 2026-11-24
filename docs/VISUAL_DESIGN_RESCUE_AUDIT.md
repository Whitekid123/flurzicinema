# Visual design rescue audit

## Existing code and rendered baseline

The Next.js / React / TypeScript foundation, fictional catalog, original artwork, dialogs, local saved stories, navigation, FAQ and four feature demonstrations are reusable. No route or backend work is needed.

Fresh browser captures at hero offsets 0, 450 and 850px verify actual ScrollTrigger execution: the headline matrix changes from scale 1 to .624 and then .29. This is real motion, but principally a zoom-out. The featured gallery only travels 30–75px; the narrative pin brings two posters a little closer. Generic `[data-reveal]` fades cover many remaining sections. There is no layered spatial environment.

The Vault executes GSAP Flip between a row and grid. Clicking a film immediately opens a dialog; there is no persistent selected-film presentation. Its mostly concealed line-art disc rotates only on hover. Baseline images and measurements are retained in `rescue-before/`.

## Fresh reference behavior

`rescue-reference/observations.json` records geometry, transforms and video timing. Browser videos and progressive forward/reverse screenshots are retained beside it.

- [Flim](https://flim.ai/): gradual wheel input visibly shifts the composition horizontally while the oversized text, image frames and rotated pills take independent trajectories. Pill transforms include substantial translation and rotation, rather than small reveal offsets. The collaboration sequence changes from a single saved image into distributed image clusters and a sharing panel. Reverse scrolling was exercised. Cookie/promotion overlays remained visible and obscured part of the view; exact physics timing is not claimed.
- [Van Morrison](https://vanmorrison.com/music): Timeline/Grid was changed both ways. A 420px cover becomes a roughly 244px grid item. Hover directly produces a perspective matrix on the image wrapper and raises its Z position by about 20px; the film equivalent should have real spatial feedback. Grid captions appear for the hovered cover. The homepage was also visited. A disc/reel reveal was not established, so the new reel is an original interpretation of the requested behavior.
- [Trinity](https://trinity.fantik.studio/): the fresh browser attempt again produced no usable body. Implement the user's stated spatial-environment and shrinking-label specification; do not claim visual fidelity to an inaccessible scene.
- [Avalon](https://links.avalonplatforms.com/): the atmospheric background video became ready and its currentTime advanced from .376 to 1.849 seconds. The background visibly changes behind steady translucent controls. This confirms continuous environment motion, not just a static gradient.

## Reference-to-implementation gaps

| Requirement | Baseline | Replacement |
| --- | --- | --- |
| Flim component choreography | Modest offsets and fades | Pinned five-poster sequence: separate paths, changing depth, traveling type/labels, final selectable shelf |
| Van Morrison physical archive | Working row/grid with faint disc | Sleeve fan, rotating reel, meaningful film selection, year controls, animated spread and grid transitions |
| Trinity environment | Flat still and small zoom | Perspective screen planes, scroll camera travel, moving projector light, depth-weighted dust and large type docking into a small label |
| Avalon ambience | Faint button sweep | Moving light cones, cinematic reflections, thin highlighted surfaces and tactile controls |
| Distinct compositions | Repeated split sections | Typographic opening, full-stage poster choreography, editorial manifesto, physical archive, retained feature lab and filmstrip premiere |

## Implementation boundaries

Preserve the approved palette and successful public functionality. CSS 3D, scoped GSAP timelines and a small canvas atmosphere can supply actual depth without installing a WebGL library for its own sake. Verify intermediate states, reverse travel, layout changes, resizing and reduced motion before declaring the new motion complete.
