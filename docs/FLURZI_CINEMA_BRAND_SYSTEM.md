# Flurzi Cinema — brand system

## Direction and assets

A dark cinema environment with warm ivory typography, restrained champagne/gold accents and dominant film artwork. Keep the existing editorial compositions and advanced motion. Gold identifies the product and its actions; it is not the default body-text, card-border or page-background colour.

The supplied 1254 × 1254 JPEG is preserved byte-for-byte at public/brand/flurzi-cinema-official.jpg. SHA-256: 09280ebcef81f5aab66ea66fe3aa3df3ef7e469a173fc797a6d477f1f9f296d0. The complete theatrical composition is presented on About, using the existing Artwork component with contain sizing, and in general social-preview metadata. It is never cropped into a small navigation icon.

The supplied metallic film-strip F was isolated with the built-in imagegen background-extraction tool. public/brand/flurzi-f-extracted.png retains the transparent raster result; public/brand/flurzi-f-symbol.webp is the optimized 176 by 192 interface asset (16,558 bytes). BrandWordmark pairs this F with LURZI and a CINEMA subline; the symbol supplies the initial F. Its compact option uses the F alone. The component has an accessible Flurzi Cinema label and decorative image alt text. Public, entry, streaming and player shells reuse it, carrying the identity into account and signature-feature screens without extra logos in cards. app/icon.png replaces the previous generic vector F with the isolated supplied symbol.

The cutout is a derived raster extraction, not a supplied transparent/vector master or pixel-identical source layer. A clean original symbol/vector and an approved typographic lockup remain useful for future print, very large displays and exact identity acceptance. The complete original JPEG remains unchanged. Do not place the square promotional image in navigation, prepend another F, or replace the symbol with a typed F. The extraction prompt is retained at rebranding/logo-extraction-prompt.txt.

## Tokens

styles/brand-tokens.css owns the palette and semantic roles. Historical public/entry/cinema variable names now refer to these roles. styles/brand-components.css owns common brand treatments; existing area stylesheets retain their compositions, breakpoints and motion. Artwork, translucent video scrims and purposeful avatar art retain their distinct colours.

| Role | Value |
| --- | --- |
| Background | #08090B |
| Secondary background | #101217 |
| Surface | #161619 |
| Raised surface | #202126 |
| Surface hover | #292A2E |
| Primary text | #F6F0E6 |
| Secondary text | #B8B4AD |
| Muted text | #A5A19A |
| Accent / primary action | #D9A441 |
| Action hover / focus | #F3C86A |
| On-action text | #100D08 |
| Selected surface | #2B2419 |
| Selected text | #F3C86A |
| Border / strong border | #3B3A36 / #767168 |
| Disabled surface / text | #29292B / #A5A19A |
| Error / error surface | #F1AAA1 / #29181A |
| Warning / warning surface | #F3C86A / #2B2419 |
| Success / success surface | #B7CFB1 / #1B2821 |

Source palette also retains midnight #0D1420, bronze #94601D, silver #9C9A96 and theatre red #5B1015. These are supporting brand colours, not substitutes for readable semantic feedback.

Calculated token-pair contrast: gold action/dark label 8.62:1; secondary text/raised surface 7.78:1; muted text/surface 7.02:1; champagne selected text/selected surface 9.70:1; error text/error surface 8.88:1. Actual rendered controls require browser checks because inheritance, opacity and image backgrounds affect contrast.

## Typography and components

Manrope remains the locally served working typeface (Cinema Sans alias), with the existing OFL licence and no added font dependency or network request. Forms, settings, controls and ordinary navigation retain readable sans-serif type. Georgia/Times New Roman/system serif is used only for the LURZI suffix, homepage masthead and selected existing editorial emphasis. No additional font files are distributed.

Primary actions use gold with dark text. Secondary actions retain neutral surfaces/transparent backgrounds and warm text. Selected states use a dark bronze-tinted surface, champagne text and a restrained gold boundary. Focus uses a visible champagne outline; selection and error meaning also remain in labels, roles and existing ARIA state. Native inputs/selects use a dark colour scheme, existing 16px mobile text sizing and preserved target dimensions. Disabled actions are visibly unavailable.

Cards use neutral borders and existing artwork. Settings keep restrained layouts. Dialogs retain native centering, padding, close controls, focus trapping, Escape and focus restoration. Avatars retain their existing identities and shapes. Loading, empty, unavailable and confirmation states share the same neutral surfaces and focus/feedback roles.

The player remains predominantly black. Progress/range controls and selected states use gold sparingly; captions, audio, volume and auxiliary panels retain personal control semantics. StoryLens, DataSense, Rooms and StoryMatch keep their distinct compositions while sharing colour roles.

## Homepage messaging

The primary headline is “A world of movies. Endless entertainment.” Supporting copy: “Discover movies, explore unforgettable series and experience cinema together.” The hero retains its two-column editorial composition, image collage, search, discovery action and existing GSAP hero-logotype animation hook. Font sizes and mobile copy stacking accommodate the longer product message. No unlimited catalog, quality or price promise is added.

Messaging review used the official [Netflix](https://www.netflix.com/), [Prime Video](https://www.primevideo.com/) and [Disney+](https://www.disneyplus.com/) homepages on 26 November 2026. Their product/category-led discovery and clear actions informed this assessment; their pricing, offer and catalog claims were not transferred.

## Motion and responsive rules

Retain GSAP/Flip/scroll/pointer choreography and existing cleanup. No new animation library, particle field, glowing orb or competing timeline is introduced. A single restrained warm masthead tint echoes theatrical lighting; functional screens do not gain marketing animation.

Respect system and selected-profile reduced motion. Decorative layers must not intercept pointers. Keep existing safe-area spacing, viewport-contained dialogs and player fullscreen containment. Touch targets and input focus are regression gates, particularly the password visibility control and its preserved caret/selection restoration.

## Maintenance

Use semantic tokens in future components. Do not add new per-feature white/black palettes or indiscriminate gold text. Keep film/episode artwork relationships, service availability and authorization independent of branding. Original vector logo masters, physical devices and real licensed media require separate acceptance.

See [the implementation and validation report](./PLATFORM_VISUAL_REBRANDING_REPORT.md) and [the route inventory](./FRONTEND_ROUTE_INVENTORY.md).
