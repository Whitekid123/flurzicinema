# Flurzi Cinema — Phase 2F.5

## Result and scope

A reproducible password editing regression was corrected in the shared PasswordField. The confirmed public premiere showcase is preserved and verified. Scheduled premieres and Creator Lounges are pending authoritative scope confirmation; no new event, creator, registration, live-streaming or social module was invented.

The supplied brief explicitly conditions those experiences on original requirements and says unestablished capabilities must be identified as pending. The repository establishes three imagined premiere showcases, existing title links and local-only markers. The architecture reserves future Premieres for a later approved scope. Public creator marketing describes an unannounced concept. No detailed event/Creator Lounge specification or approved event/creator dataset was found. See the [scope evidence](./phase2f5/scope-evidence.md).

## Authentication investigation and correction

The prior Phase 2F.4 failure was reviewed rather than attributed to the browser driver. Its retained trace has keydown/keyup without text insertion, an enabled, writable, focused password field, and no prevented keydown. The native comparison then accepted text. Those observations alone do not establish a root cause.

The new development investigation compared application email/password fields, an uncontrolled native password input inserted beside the app, and isolated native text/password inputs, in desktop and touch-emulated Chromium. Raw key typing inserted all six characters everywhere. Separate KeyA presses also inserted text. Capture/bubble traces include focus, keydown/keypress/keyup, beforeinput/input, input type, trusted state, value length, defaultPrevented and active element; a post-dispatch microtask checks final keydown cancellation. Test traces use fictional input and store lengths rather than password contents. See [initial investigation](./phase2f5/initial-auth-investigation.json).

Source inspection covered AuthScreens, EntryUI, root/session layout, public shells and application key/preventDefault listeners. Authentication fields use controlled React inputs and ordinary onChange. Player, panel, modal and homepage shortcut handlers are scoped to their components; no global authentication character blocker was found. The visibility button prevents pointer focus transfer, not keyboard input. Validation failure focuses a field; successful/failed service submission deliberately clears passwords. No auth redesign, global keyboard workaround or browser-security change was added.

The first optimized-preview browser run found a distinct, repeatable defect: changing the password type kept input focus but reset selectionStart/selectionEnd to zero. After appending a character and hiding the password, Backspace had no effect. A focused probe recorded end caret 13 → 0 after Show and 14 → 0 after Hide, with unchanged value lengths and focus. See [before-fix caret probe](./phase2f5/caret-before.json) and [retained failing attempt](./phase2f5/preview-attempt-1.json).

PasswordField now captures the current range/direction and restores it on the next animation frame after the visibility/type update, with layout-effect cleanup canceling pending work. Pointer interaction retains the existing input focus; keyboard activation keeps focus on the visibility button. Values, validation, autocomplete, disabled behavior, form actions, guards and service selection are preserved. The same shared component serves login, signup and password reset. Original source is retained in [the backup](./phase2f5/before/EntryUI.tsx.txt).

A synchronous layout-effect restoration and a microtask restoration were insufficient: the trace recorded a successful setSelectionRange call followed by a later reset to zero. The retained first corrected-build attempt still fails the original Backspace assertion. Frame-based restoration passes the focused development probe; the pending callback is canceled on cleanup and checks the same mounted input and selection owner. See [after-fix probe](./phase2f5/caret-after.json) and [intermediate attempt](./phase2f5/preview-attempt-2.json).

The browser harness explicitly waits for the asserted selection after the scheduled frame before continuing to edit; the original Backspace/value assertions remain. A 16-versus-17 character-length mistake in the added assertion was corrected and retained as preview-attempt-4.json. Mobile login and premiere captures were visually inspected.

The earlier no-text insertion failure has not been explained by this caret defect. No current reproduction or evidence establishes that it was exclusively a browser-driver failure. Physical keyboard and mobile operating-system keyboard testing remains required; automated Chromium key events and emulated touch are not physical-device verification.

## Product and route inventory

The consolidated [route inventory](./FRONTEND_ROUTE_INVENTORY.md) enumerates every current page pattern and its frontend/service status. There are 49 page patterns, including the protected development lab. No active app page imports RoutePlaceholder/AuthPlaceholder. All 137 literal internal href references resolve to an existing filesystem route pattern.

That static audit does not prove every computed identity, external URL, fragment or backend action works. The [control/content inventory](./phase2f5/control-boundaries.md) names unavailable operations rather than interpreting them as completed services. Existing entry bridge routes are implemented links to authentication, not the obsolete placeholders described in early architecture prose.

Confirmed /premieres interactions remain catalog artwork/detail navigation, browser-local markers, removal and reload persistence with explicit no-notification disclosures. No supplied dates exist, so there is no valid countdown to exercise, event lifecycle, entitlement state or event viewing action to implement. No dated event unit tests or event fixtures were added for nonexistent approved operations.

Excluded pending confirmation: scheduled premiere discovery/details, screenings, reservations, account reminders/delivery, event participation and collective premiere sessions; Creator Lounge discovery/profiles, reviewed biographies/filmographies, interviews, announcements and live Q&A. No creator marketplace, followers, badges, upload infrastructure, admin platform or independent player/server was created.

## Backend and environment handoff

[Phase 2F.5 boundaries](./PHASE_2F5_BACKEND_CONTRACTS.md) document existing behavior and the scope decisions/data/permissions required before defining event/creator operations. This is deliberately not a speculative typed service API. Those modules will require frontend work after approval, not just backend adapters.

The [production handoff](./FRONTEND_PRODUCTION_HANDOFF.md) now points to the consolidated inventory and corrected authentication behavior. Production auth/session/profile/account/catalog/entitlement/playback, Rooms, StoryMatch, StoryLens and DataSense continue using their existing contracts. No endpoints, production rights, source URLs, schedule timestamps or verified creator relationships were invented.

Explicit optimized preview remains NEXT_PUBLIC_USE_MOCKS=1 with NEXT_PUBLIC_FLURZI_CHANNEL=preview. Its existing fictional auth/recovery responses remain disclosed. Release uses mocks disabled and fails closed for missing services. No new event/creator fixtures or test utilities were needed. No deployment was performed.

## Validation

- Final explicit optimized-preview and release builds: PASS. Preview build ID: OFDrKlwpRBwj1BUlZgAja. Final release ID: aEs-mjN6lhK7KliSATaWL. Both use the default Turbopack builder.
- Final release sequence: typecheck, lint, build, then single-worker unit suite: PASS; no lint errors/warnings. Corrected preview build and single-worker suite also passed. All 369 existing tests across 11 files are preserved; no dependencies or shared test configuration changed. Intermediate helper-only lint warnings were corrected. Vitest retains the existing config-loader compatibility warning.
- Focused Chromium: 84 responsive observations and 60 login/signup/recovery keyboard cases across both optimized configurations, all nine requested widths, desktop and touch emulation, reduced motion and landscape. No page errors or horizontal page overflow. Checked auth inputs/visibility actions and premiere buttons meet 44px dimensions.
- Raw-key entry, Show/Hide, continued typing, Backspace, backward-range replacement, Tab/Enter button focus, ordinary preview sign-in/registration/verification entry, recovery/reset and release unavailable responses passed. No input-value fill workaround is used by the Phase 2F.5 browser harness. Test expectations/timeouts were not relaxed.
- Premiere local marker toggle/reload/removal and actual title link/Back passed. No service dates exist, so countdown/event lifecycle/registration/live participation tests are not applicable. No new dialog was introduced; retained dialog infrastructure is unchanged.
- Protected development player page/media/caption/private fixture requests return 404 in both optimized builds. Release binary/text asset scan: 1149 generated client/server files, zero audited developer/test literals.
- Source audit: 212 baseline files unchanged; only components/streaming/EntryUI.tsx changed among protected sources. Existing uncommitted StoryLens/DataSense work, catalog, guards, services, player, tests/configuration and root debug log are preserved. Owned port 3018 is closed; the existing development server on port 3000 remains healthy (HTTP 200), and was not stopped.
- Firefox and WebKit are not installed in the local Playwright browser inventory; they were not tested. Physical devices and operating-system keyboards were not tested. The prior no-text insertion root cause remains unestablished despite successful raw-key regression coverage.

[Validation](./phase2f5/validation.json) · [Preview browser](./phase2f5/preview-browser.json) · [Release browser](./phase2f5/release-browser.json) · [Source/release audit](./phase2f5/source-release-audit.json) · [Route data](./phase2f5/route-inventory.json)

[Preview mobile login](./phase2f5/preview-390-login.png) · [Release mobile login](./phase2f5/release-390-login.png) · [Mobile premiere showcase](./phase2f5/release-390-premieres.png)


## Remaining frontend work

- Confirm premiere/Creator Lounge scope from authoritative requirements before adding routes, types or UI. Those experiences cannot be claimed complete.
- Integrate an approved payment-provider journey and public support workflow; these need contract/UI integration beyond merely enabling existing unavailable controls.
- Replace draft legal, business and fictional editorial content with approved content and rights-cleared metadata/artwork.
- Register and verify production service adapters; test persistent writes/restoration, populated account/billing/device states, real licensed playback, telemetry/quality controls, independent remote collaboration and reviewed contextual metadata.
- Complete physical-device/OS-keyboard and supported-browser acceptance, actual notification delivery and production authorization/failure testing.

Commercial launch readiness is not established by frontend builds or a page returning HTTP 200.
