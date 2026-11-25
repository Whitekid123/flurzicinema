# Flurzi Cinema — frontend readiness corrections

The existing frontend through Phase 2F.2 has been corrected for authentication interaction, customer-facing wording and backend handoff. The cinematic layouts, typography, artwork and animation systems are retained. Production authentication, payments, email delivery, licensed playback and remote collaboration are not claimed operational.

## Mobile authentication root cause

CredentialsScreen and RecoveryScreen used disabled={busy || !mockMode} on their inputs and returned from submit whenever mocks were disabled. Verification controls had the same mode gate. Consequently the normal production configuration disabled email, password, reset and verification interactions even though those interfaces already had service contracts. This was a release-mode defect affecting desktop and mobile, rather than a touch-only layout failure.

Inspection covered authentication markup, disabled/read-only/inert states, decorative layers, positioning, pointer events, focus, global styles and dialog behavior. The initial explicit-preview browser probe found the email input itself at elementFromPoint, pointer-events auto, no inert ancestor and successful focus on tap. That preview configuration did not reproduce an interception problem. The release-mode disabled props were confirmed in the original source backups. The owner's particular handset/browser/build was not available for direct inspection.

The mode gates have been removed from normal forms and submit handlers. Inputs are disabled only while their request is pending. Forms validate locally, focus invalid fields and call AuthenticationService in either configuration. Unavailable release services return safe feedback rather than silently preventing interaction. Raw transport messages are not rendered by authentication screens. Existing email/password autocomplete and input modes are retained. No random z-index increase was used.

## Interaction corrections

- Password visibility toggles preserve input focus on pointer activation; keyboard activation remains available.
- Authentication artwork shading and caption layers explicitly ignore pointer events.
- Coarse-pointer inputs and selects use 16px text to avoid input-focus zoom. Existing typography and palette are retained.
- Buttons, summaries, artwork-card tools, featured arrows and avatar choices retain comfortable touch targets. Coarse-pointer buttons/summaries have a 44px minimum.
- Form controls have scroll margins. Mobile streaming content reserves navigation and safe-area space. The profile menu scrolls within short viewports.
- Native dialogs retain centering, bounded dynamic-viewport height and internal scrolling. Clicking dialog padding no longer acts as an outside click; backdrop dismissal checks coordinates against the actual dialog bounds. Escape, focus trapping/restoration and body-scroll cleanup remain in the shared component.

The affected authentication screens are login, signup, recovery, reset and verification. Broader checks include onboarding, profile selection/creation/management, dashboard, discovery/search/libraries, movie/series details, all account screens, Cinema Rooms and StoryMatch. Player authorization/unavailable behavior and its existing controls were reviewed; no new player or media source was added.

## Customer-facing copy and availability

Normal headings, navigation, plan preferences, account labels, title availability, libraries, public entry points, FAQs and shared error messages now use consumer language. Public account entry points lead to the implemented authentication screens. Stale claims that accounts and sign-in were future interfaces were removed. Room and matching errors say the feature is temporarily unavailable instead of exposing integration details.

A shared development notice identifies explicit preview activity. Specific disclosures remain for unsent emails, non-persistent preferences, unenforced preview parental settings, local room behavior and voluntary same-device responses/votes. CSS class names, internal IDs, service terminology and protected test codes were not blindly renamed.

Public room/matching illustrations lead into the implemented experiences in a release. Illustrative seating does not claim connected people. The public contact exercise and unapproved legal drafts are isolated from release UI; release pages show accurate unavailable states. No inquiry delivery or approved legal policy is invented. Approved legal/business content remains required before real registration and commerce are enabled.

Public editorial artwork and its five fictional title identities are retained. They confer no streaming rights, audience activity, ratings, memberships or remote participation. Catalog metadata/rights validation and fail-closed playback remain intact.

## Development and production separation

NEXT_PUBLIC_USE_MOCKS still controls deliberate development services. A production-optimized preview additionally requires NEXT_PUBLIC_FLURZI_CHANNEL=preview. next.config.ts rejects a production build/start with mocks enabled without that explicit channel. Environment flags are compiled into client assets: release deployment must build with mocks off and must never promote a preview artifact. Runtime environment changes alone cannot convert an existing preview build into a release.

Test credential filling and test recovery/verification links live in DevelopmentAuthTools behind literal build-time conditions. Mock registry loading is also behind a literal build-time branch. Release browser assets are audited for test credentials, test reset/verification codes and the mock account identifier. Release forms remain usable while unavailable adapters reject requests. Developer footage URLs return 404 in production, including optimized preview builds.

Membership purchases and payment changes remain unavailable pending the approved provider workflow. Development viewing preferences do not create memberships. No successful login, email, charge, invoice, device revocation, invitation, recommendation or playback access is fabricated in release mode.

## Service integration and preservation

lib/api/client.ts selects the established service registry and applies a 20-second deadline while retaining optional operations and method binding. lib/api/experience-services.ts selects RoomService and StoryMatchService for the current viewer. Their visual components no longer import development adapters directly. Production adapters remain explicit fail-closed implementations; no URL, socket server or backend was invented. The existing interfaces are retained.

The [production handoff](./FRONTEND_PRODUCTION_HANDOFF.md) contains the route inventory, service-integration matrix, adapter locations, environment instructions, cookie-session requirements, contracts, error behavior, streaming authorization, concurrency and real-time requirements. It identifies remaining frontend wiring for an approved payment-provider workflow and selected-profile restoration policy rather than presenting those as complete backend services.

Original sources, including the previously uncommitted StoryMatch work, were captured before correction in docs/readiness/before with initial hashes. The [source audit](./readiness/source-audit.json) lists exact changed/unchanged files and verifies protected session, player, playback, fixture, package and existing test sources. No dependencies, shared Playwright/Vitest configuration or original test assertions were changed. Existing focused harness labels were updated to follow the corrected interface wording. Historical milestone evidence is retained; new StoryMatch regression evidence has its own directory.

Primary modified areas are AuthScreens/EntryUI, the shared Modal, scoped interaction CSS, service selection/deadlines/error mapping, next.config.ts/.env.example, consumer wording in existing public/streaming components and help/FAQ content. New code includes DevelopmentAuthTools, DevelopmentNotice, customer-errors, deadline, environment and experience-services. The source audit provides the per-file inventory.

## Regression coverage and verification limits

The new readiness unit suite exercises release/preview selection, safe authentication error mapping and bounded request resolution/failure/timeout. Existing ownership, entitlement, playback, profile, room and matching tests are retained. Browser authentication regression checks use actual touch taps, elementFromPoint, focus assertions and typed values at 1920, 1440, 1024, 768, 430, 390, 375, 360 and 320px. Password visibility, invalid-input recovery, signup submission, reset confirmation, verification actions and recovery/registration links are exercised. A reduced-height viewport checks focus and scrolling; it does not emulate the native operating-system keyboard.

The authenticated preview audit signs in through the normal UI, selects a viewing preference/profile and uses visible navigation links. It verifies the actual route before collecting screen/control observations. It does not bypass guards or restore a fabricated browser session. The StoryMatch regression separately covers explicit preferences, restrictions, no-match/refinement, My List, shortlisting, individual votes, confirmation/focus behavior, profile isolation and exact movie/episode handoff into confirmed RoomService creation.

Harness failures were retained and corrected: a broad alert locator also matched Next's route announcer; full-page navigation reset in-memory preview authentication; and a reset test attempted to use a token after reload without first requesting recovery. The latter completion checks were rerun separately through the actual recovery-link flow; the completed core audit and targeted passing evidence are both recorded. These were test-harness corrections, not relaxed assertions or authentication bypasses.

An initial unit attempt hit the existing date/currency initialization timeouts during concurrent compilation; an idle unchanged retry passed. A build encountered stale generated .next/dev type references; a subsequent build passed without changing shared TypeScript/test settings. Vitest's existing config-loader warning remains. Screenshot review also identified an offscreen fixed skip link appearing in a scrolled full-page capture; computed hit bounds confirmed it remained outside the live viewport. Top-of-page captures avoid that screenshot artifact.

Chromium was available. Firefox and WebKit executables were not installed, and no physical phone was available. Native keyboard opening/placement, real Safari/Firefox behavior and physical-device playback remain unverified. Real billing/device/account-editing records, actual email delivery, licensed media and independently connected participants require approved adapters and separate end-to-end verification. Empty/unavailable states and existing unit validation are not presented as proof of those live services.

[Phone verification checklist](./readiness/PHONE_VERIFICATION.md) · [Browser summary](./readiness/summary.json) · [Release observations](./readiness/release-browser.json) · [Preview observations](./readiness/preview-browser.json) · [Authentication completion](./readiness/preview-auth-completion.json) · [StoryMatch regression](./readiness/storymatch-regression/observations.json) · [Release bundle audit](./readiness/release-bundle-audit.json) · [Release safeguard](./readiness/release-guard.json)

## Final results

- Typecheck: PASS.
- Lint: PASS, zero errors and warnings.
- Release build: PASS, default Turbopack, 53 static pages. Final release build ID: QbfQS-yha6-Ibo6K6rtf6. The explicit optimized preview build also passed.
- Unit tests: PASS, 244 tests across nine files, including nine readiness tests and the prior 235.
- Authentication: 45 screen/width observations in each mode, with actual tap/focus/typing checks and additional submission/verification/reset flows.
- Release/public responsive observations: 189. Authenticated preview observations: 262, with 157 enabled-control hit tests across 24 actual routes. StoryMatch/Rooms regression: 47 responsive observations plus the recorded interactions.
- No browser page errors were recorded. Firefox/WebKit were unavailable; physical phones were not tested.
- Release assets: PASS, no audited test credentials, PIN hints, test email-link codes or mock account identifier. The final PIN disclosure uses the same build-time isolation as other preview utilities.
- Release safeguard: PASS, unsafe mocks-enabled release startup rejected.
- Source audit and owned-server teardown: PASS. Ports 3012, 3014 and 3015 refused connections after teardown. No existing development server was stopped. The original root debug log was restored after retaining the identified owned Chromium warning separately.

The final working build is a release with mocks off. The final release browser run includes the completed authentication checks. No production adapter, approved payment workflow, email delivery, legal approval or licensed playback is implied by these results.

[Validation record](./readiness/validation.json) · [Additional file inventory](./readiness/additional-file-inventory.json) · [Server teardown](./readiness/server-teardown.json) · [Debug-log preservation](./readiness/debug-log-preservation.json) · [Release login](./readiness/release-login-top.png) · [Mobile recovery dialog](./readiness/preview-security-dialog.png)
