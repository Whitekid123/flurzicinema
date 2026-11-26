import fs from 'node:fs/promises';import assert from 'node:assert/strict';
const read=async p=>JSON.parse(await fs.readFile('docs/rebranding/'+p,'utf8'));
const pv=await read('preview-validation.json'),rv=await read('release-validation.json'),pb=await read('preview-brand-browser.json'),rb=await read('release-brand-browser.json'),pa=JSON.parse(await fs.readFile('docs/rebranding/auth/preview-browser.json','utf8')),ra=JSON.parse(await fs.readFile('docs/rebranding/auth/release-browser.json','utf8'));
assert(pb.complete&&rb.complete);for(const r of [...pv,...rv])assert(r.code===0);
const audit=await read('release-audit.json');const id=async m=>(await fs.readFile('docs/rebranding/'+m+'-build-id.txt','utf8')).trim();
const report=`# Flurzi Cinema - visual rebranding and hero/logo corrections

## Delivered interface

The platform retains its existing layouts, gold/black/champagne identity, cinematic choreography and functionality. The homepage now leads with **A world of movies. Endless entertainment.** Its single supporting description is **Discover movies, explore unforgettable series and experience cinema together.** The existing hero-logotype GSAP animation hook animates the new headline; film collage, search, discovery action, navigation actions, hover, pause and reduced-motion behavior remain intact. Responsive typography and stacked mobile supporting copy accommodate the longer message.

The shared BrandWordmark now combines the supplied metallic film-strip **F** with **LURZI**, with CINEMA beneath the text. It does not duplicate the initial F. Public navigation/mobile shell/footer, authentication and onboarding/profile frames, streaming navigation and the existing player reuse this component. Account, Rooms, StoryMatch, StoryLens and DataSense receive branding through their existing shells. No extra logos were added to individual feature cards. A compact component option and the application icon use the F alone.

The built-in imagegen background-extraction tool isolated the F without the surrounding theatre, carpet, halo or lower wordmark. The optimized transparent WebP is 176 by 192 pixels and 16,558 bytes, with explicit intrinsic dimensions and a single shared URL. The application icon is a transparent 192px PNG (66,473 bytes), replacing the former generic vector F. The original 1254px JPEG remains byte-for-byte unchanged and appears intact on About and in general social-preview metadata.

The extracted raster is a derived asset, not a pixel-identical original source layer or a supplied vector master. A clean original transparent/vector F and approved typographic master remain useful for exact brand-master acceptance and large-format work. [Extraction prompt](./rebranding/logo-extraction-prompt.txt) and [alpha/size checks](./rebranding/logo-asset-check.json) are retained.

## Shared visual system and preserved boundaries

styles/brand-tokens.css owns semantic colour roles; styles/brand-components.css owns shared identity, action, focus, selected/disabled/error and surface treatments. Fifteen historical stylesheets migrated 684 neutral paint declarations and 55 aliases. Their existing non-paint geometry and motion declarations match their backups. New brand-layer hero typography and logo spacing implement the requested corrections. Manrope remains the locally served working font; existing system serif styling handles the LURZI suffix and editorial headline. No dependency or font file was added.

Every route in the existing 49-pattern inventory inherits the root system and relevant shared shell. Public catalog/editorial/support/legal/pricing pages, entry/profile flows, browse/library/detail screens, six account routes, player and signature features retain their distinct compositions. Buttons use dark labels on gold; secondary controls/cards remain neutral; film artwork stays dominant; the player stays predominantly black.

A fresh pre-rebrand baseline covers 232 sources, data, tests, assets, configuration and the root debug log. The final audit records ${audit.changed.length} planned original source/icon changes and ${audit.protectedCount} unchanged protected files. Password/caret logic and player behavior outside its brand-only header match their backups. Authentication, session guards, service contracts, catalog, playback authorization, progress, account operations, fixture boundaries, dependencies and shared test configuration were preserved. Original affected files are backed up under rebranding/before.

## Validation

- TypeScript, lint, default Turbopack production build and all **369 existing unit tests across 11 files** passed sequentially in both explicit preview and release configurations.
- Preview build: ${await id('preview')}. Release build with mocks disabled: ${await id('release')}.
- Focused Chromium checks passed: ${pb.observations.length} preview and ${rb.observations.length} release responsive observations, across 1920, 1440, 1024, 768, 430, 390, 375, 360 and 320px. No horizontal page overflow or browser page errors were recorded in the completed runs.
- Actual navigation, mobile menu taps, dialog keyboard focus/Escape/restoration, hero hover and pause/resume, feature tabs, normal preview sign-in/onboarding/profile selection, profile creation entry, account preference save/cancel, recovery confirmation, room creation/lobby and StoryMatch explicit response/results/shortlist/vote/decision were exercised.
- Separate authentication checks use actual keyboard events and touch taps for login/signup/recovery, password visibility, caret and backward-range editing. Release unavailable feedback/guards and protected developer URLs remain enforced.
- The protected original-media exercise passed before the logo-only correction, covering player controls/captions, DataSense panels/calculation/preferences, reduced motion, landscape/fullscreen and personal UI isolation from Room intents. The final source audit confirms preserved player behavior.
- Rendered primary action contrast passed 4.5:1; minimum recorded ratio ${Math.min(...pb.contrast.map(c=>c.ratio),...rb.contrast.map(c=>c.ratio)).toFixed(2)}:1.
- Release scan inspected ${audit.assetCount} server/static artifacts and found none of the audited developer fixture annotations, credentials or test codes.
- Owned test servers were closed; no user development server was stopped.

## Evidence and limits

Final desktop/mobile homepage, logo/navigation, authentication and streaming captures were visually reviewed alongside representative account, Rooms, StoryMatch, StoryLens and DataSense screens. The original square artwork was checked separately. The nine-width matrix uses Chromium with emulated touch; physical devices, operating-system keyboards, Safari and Firefox remain separate acceptance work.

The initial before capture run has 14 route-verified images. Eight captures made before navigation completed are explicitly excluded in the evidence audit. Retained attempts include an initial Chromium navigation suspension, player connection failure, a harness selector matching the Next route announcer as well as room feedback, and an unresponsive navigation to the existing development server. Harness issues were corrected without changing application assertions, shared timeouts or product behavior. Final browser checks use owned optimized servers.

Production services, licensed media, payment workflows, real remote viewers and backend enforcement remain their prior dependencies. No entitlement, footage, event/creator fixture, backend endpoint, new authentication system, deployment or commit was introduced.

[Brand system](./FLURZI_CINEMA_BRAND_SYSTEM.md) - [Preview checks](./rebranding/preview-validation.json) - [Release checks](./rebranding/release-validation.json) - [Preview browser](./rebranding/preview-brand-browser.json) - [Release browser](./rebranding/release-brand-browser.json) - [Release/source audit](./rebranding/release-audit.json) - [Before evidence audit](./rebranding/before-evidence-audit.json)

[Desktop home](./rebranding/preview-captures/1440-home.png) - [Mobile home](./rebranding/preview-captures/390-home.png) - [Mobile sign-in](./rebranding/preview-captures/390-sign-in.png) - [Desktop dashboard](./rebranding/preview-captures/1440-browse.png) - [Mobile dashboard](./rebranding/preview-captures/390-browse.png)
`;
await fs.writeFile('docs/PLATFORM_VISUAL_REBRANDING_REPORT.md',report);console.log('Final report saved',pa.screens?.length,ra.screens?.length);
