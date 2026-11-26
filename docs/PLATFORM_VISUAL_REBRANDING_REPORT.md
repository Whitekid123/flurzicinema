# Flurzi Cinema — platform visual rebranding

## Delivered direction

The rebrand applies across the existing platform rather than replacing the homepage or creating a new application. The supplied gold theatrical artwork informs an obsidian/charcoal environment, warm ivory reading text, champagne editorial accents and restrained gold actions/selection. Existing film artwork remains dominant. Manrope remains the working typeface; a system serif is limited to interface branding, the masthead and selected editorial emphasis.

The original official JPEG is preserved byte-for-byte in public/brand/flurzi-cinema-official.jpg. About presents the complete composition at a suitable size using the existing responsive Artwork component; general Open Graph/Twitter metadata uses the same supplied brand image. The original JPEG remains unchanged. A separate transparent raster extraction of its metallic film-strip F now supplies the shared interface logo; navigation never shrinks the full square artwork into an icon.

BrandWordmark combines the isolated supplied F with LURZI and a CINEMA subline, without duplicating the F. It is shared across desktop/mobile public navigation, entry/onboarding frames, streaming navigation, footer and the existing player. The icon uses the isolated F. This is a derived raster extraction; a clean original transparent/vector master remains useful for exact source-layer fidelity. Details are in [the brand system](./FLURZI_CINEMA_BRAND_SYSTEM.md).

The homepage now leads with **A world of movies. Endless entertainment.** Supporting copy: **Discover movies, explore unforgettable series and experience cinema together.** Its existing GSAP hook, editorial composition, film collage, search and actions remain. Responsive typography replaces the oversized brand-name headline.

## Implementation

styles/brand-tokens.css is the semantic source of truth. styles/brand-components.css applies shared brand treatments, action hierarchy, focus, selected/disabled/error states, typography and the dark entry/home environments. Existing area stylesheets retain their responsive geometry and animations. Fifteen existing stylesheets migrate neutral paint declarations to semantic roles; 55 historical aliases now reference the central tokens. The migration log records 684 paint changes for review. This is not an indiscriminate conversion of white text or every surface to gold.

Primary actions use dark text on gold; secondary actions and cards remain neutral. Settings and forms remain calm. The player stays black, with gold range/progress and selected controls. Rooms, StoryMatch, StoryLens and DataSense retain their individual compositions, service boundaries and personal/shared interaction semantics.

Shared brand integrations touch Header, Footer, EntryUI, StreamingShell, the MediaPlayer header and the existing homepage masthead. About gains the intact official artwork. Root layout imports the shared system and updates theme/social presentation. No dependency, framework configuration, test configuration, catalog identity, profile/avatar identity, backend interface or payment behavior was changed.

Original affected sources are backed up under docs/rebranding/before. The baseline includes all existing app/component/style/service/type/data/test/public files plus configuration and the root debug log. An audit separately confirms unchanged password/caret logic and player behavior outside the brand-only header.

## Route coverage

The existing [49-pattern inventory](./FRONTEND_ROUTE_INVENTORY.md) remains the functional source of truth. Every route receives the root tokens and relevant shared shell/component treatments.

| Area | Brand integration |
| --- | --- |
| Homepage | Dark editorial stock, gold serif masthead, shared navigation/footer, original film collage/grid, falling films, Vault, feature scenes and finale |
| All public catalog/editorial routes | Shared public palette, title/artwork presentation, buttons, filters, dividers, support/legal/pricing layouts, navigation/footer |
| Login/signup/recovery/reset/verification | Dark cinematic entry composition, consistent wordmark, gold actions, readable fields, feedback and focus; existing password selection restoration retained |
| Welcome/subscription/profiles/create/manage | Shared ViewerFrame/entry system, profile/plan states, forms, avatar identity and existing dialogs |
| Browse/movies/series/search/My List/history/title details | Shared streaming shell, profile menus, cards, filters, title/episode states and responsive navigation |
| All six account routes | Neutral elevated sections, gold navigation/action/focus state, preserved 64px avatars, unavailable states and native confirmations |
| Existing player and protected development lab | Black viewing surface, shared wordmark, gold progress/selection, existing controls, captions, fullscreen/PiP and auxiliary layout |
| Cinema Rooms | Creation/invitation forms, lobby/participants/readiness, controls, viewing/unavailable and confirmation surfaces |
| StoryMatch | Modes, mood/preference journey, session/results, shortlist/vote/decision and confirmation surfaces |
| StoryLens / DataSense | Existing title/player panels, category and spoiler controls, calculators/budgets/preferences/notifications |

This is a visual milestone. Pending premiere/Creator Lounge product scope, payment-provider workflow, public support delivery, approved legal/business content and production adapters remain unchanged requirements. Styling does not make unavailable services operational or create playback entitlement.

## Visual evidence and review

A source-backed before capture run produced 14 route-verified comparison images. Eight additional labelled captures were taken before client navigation completed and are explicitly excluded in [the evidence audit](./rebranding/before-evidence-audit.json); they are not represented as images of their intended destinations. The initial Chromium navigation suspension and failed player media-connection attempt are retained.

The first branded homepage, mobile login and desktop player were visually inspected. Review retained the existing layouts while correcting the homepage navigation action to a 44px minimum. The final review and optimized captures are recorded below after validation completes.

Representative valid comparisons:

- [Before desktop home](./rebranding/before-captures/1440-home.png)
- [Before mobile login](./rebranding/before-captures/390-login.png)
- [Before streaming browse](./rebranding/before-captures/1440-browse.png)
- [Before title context](./rebranding/before-captures/390-storylens.png)

## Validation

Preview typecheck, lint, optimized build and all 369 unit tests passed. The final focused browser run passed 432 responsive platform observations at nine widths; separate touch/keyboard authentication checks passed 42 observations and 30 raw-key input cases. Release validation is in progress.

## Remaining limits

The isolated symbol is a derived raster asset. An original transparent/vector source and approved typographic master remain useful for exact brand-master acceptance. The existing generic icon has been replaced with the isolated symbol. Physical devices, operating-system keyboards and independent Safari/Firefox acceptance remain required. Only available local browsers are tested. Real licensed production playback, adaptive transport and independently connected social viewers still require approved adapters and separate verification. No deployment, backend endpoint, entitlement or event/creator fixture was introduced.
