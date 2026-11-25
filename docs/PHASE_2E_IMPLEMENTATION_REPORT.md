# Flurzi Cinema — Phase 2E

## Delivered frontend

Six account routes now share a cohesive account centre inside the existing StreamingShell and RequireAuth layout:

- /account: service-backed identity and membership summary, selected viewing profile, preferences, profile management, security/devices entry points and confirmed sign-out.
- /account/details: account name, email, verification and supplied locale/region; truthful unavailable editing states.
- /account/billing: supplied subscription status and selected plan, plan information, cancellation state/period when supplied, payment integration state and billing-history frontend.
- /account/security: account recovery requests, supplied email-verification status, conditional verification requests, device-management entry and confirmed session logout.
- /account/devices: service-backed list, empty/error/retry states, supplied current-session/activity metadata and conditional confirmed revocation.
- /account/preferences: current profile summary, links to existing profile editing, and supported audio/caption preference saving and cancellation.

The public website, auth/onboarding/profile screens, streaming dashboard, catalog/discovery/libraries, title details and player were preserved. No catalog, artwork, playback source, entitlement or viewing activity was added. No dependencies or shared test configuration were changed.

The neutral cinematic interface reuses Manrope, the existing shell/profile menu, entry controls/feedback/avatar and native-dialog component. Desktop uses a compact account sidebar; tablet/mobile use an intentional account navigation grid within the retained streaming navigation. Account styles are scoped and imported locally. No decorative dashboard metrics, payment form or additional animation library was introduced.

## Components and interactions

New components are AccountUI.tsx (AccountShell, headings, SettingsSection, AccountDetailRow, shared resource/error/unavailable states, ConfirmationDialog and AccountSignOut), AccountScreens.tsx (overview, details and preferences), AccountBilling.tsx, and AccountSecurity.tsx (security and devices). Styles live in components/streaming/account.css. lib/account-centre.ts supplies ownership checks, status/date/currency/invoice helpers, navigation state, preference validation/saving and bounded reads.

Account identity comes from AuthenticationService.getAccount and is checked against the authenticated account ID. Subscription records are similarly checked. Missing optional information is omitted or labeled unavailable. Account creation dates, payment details and security protections are not invented.

Reads have loading, error and retry states with a 20-second deadline and stale-result suppression. New account saves, recovery, cancellation, revocation and sign-out waits are also bounded. Independent account/subscription/plan requests preserve available information when another service fails. Service error details are not printed into the interface. Expired/unauthenticated responses offer session revalidation through the existing SessionProvider and guard; denied or membership-required errors do not grant access.

Sign-out and consequential actions use the existing focus-trapping dialog with Escape and focus restoration. Buttons wait for service confirmation. Failed requests retain error feedback. The account dialog has neutral colors, explicit centering/padding and 44px close controls. There is no browser credential/token/security-code storage.

## Membership and billing

A missing subscription or status none is shown as no active membership. Supplied production trial/active/past-due/cancelled/paused states have distinct labels. A scheduled cancellation and valid supplied period end are displayed without guessing a renewal date.

The development preference is explicitly not membership, payment or streaming access. Fixture prices and benefits are suppressed in the account centre. The existing /subscribe preference flow is linked without being redesigned.

Production plan purchases/changes and payment-method management remain unavailable until the approved payment workflow exists. No payment details are collected. No active membership is created.

The existing cancelSubscription operation is wired only for eligible supplied production subscriptions without an already scheduled cancellation. A returned record must match the account and indicate cancelled or cancelAtPeriodEnd before success. Development preference cancellation is not presented as commercial subscription management.

The production billing-history view requests ten records per page, supports previous/next paging, supplied statuses, valid dates, currency-specific minor-unit formatting and supplied HTTPS invoice links. Missing data is not replaced by sample charges. The development account explicitly has no billing activity. Actual production billing records and cancellation could not be demonstrated without an adapter.

## Security and devices

Recovery requests use the actual account email and existing requestPasswordRecovery operation. A confirmation reports a received request rather than a changed password. Development feedback explicitly says no email was sent and no password changed. Unverified accounts have a conditional resend-verification action; existing auth guards still control access.

Sign-out uses SessionProvider.signOut. Sign-out everywhere, 2FA, alternate recovery addresses, password-change values and security-notification preferences remain unavailable because suitable operations do not exist. No fake success flow or new client security system was introduced.

DeviceInfo remains the device model. The interface displays only returned IDs/labels/platform/activity/current-session flags, deduplicates IDs, and never infers registered devices from the browser. Non-current production devices can be revoked after confirmation; removal follows the service response. Current-session logout uses the existing logout flow.

The prior mock revokeDevice implementation silently succeeded for any ID. It now requires a verified demo session and rejects nonexistent devices. Mock billing/device reads also require that session. The demo list stays empty; no device fixture was installed.

## Viewer preference integration

Existing profile management remains the single editor for names/avatars, language, motion, autoplay, quality, maturity and kids/PIN settings. The account page links to that editor rather than duplicating its controls.

Audio/caption controls use the existing audioLanguage/subtitleLanguage fields and ProfileService.updateProfile. Updates retain other preference fields, validate returned profile/account identity and update SessionProvider only while that viewer editor remains mounted. Switching profiles remounts account content; a late save cannot restore an old selected viewer.

The unchanged Phase 2D player already consumes subtitleLanguage for an exactly matching supplied caption track; off selects no preferred captions. Audio preference is saved but automatic audio selection is not integrated. Native audio selection remains available in the player when the browser exposes real tracks. Reduced motion already affects the streaming app/player. Autoplay and quality remain saved preferences, without claiming automatic next episodes or adaptive quality switching. Kids/maturity/PIN enforcement remains backend work.

Demo preference changes last through client navigation and reset on refresh.

## Contract boundaries

One backward-compatible optional operation was added: AuthenticationService.updateAccount({ displayName: string }): Promise<Account>. Adapters may implement an authorized, persistent display-name update; its form validates 1–80 trimmed characters and checks returned account identity. The development adapter deliberately leaves it absent, so the current UI shows read-only account details. Email editing remains unavailable and requires a verified-identity workflow.

No HTTP endpoint or payment/security backend was invented. Subscription/Profile service signatures and account/profile models remain intact. See [the backend boundaries](./PHASE_2E_BACKEND_BOUNDARIES.md) for required request/response semantics, authorization, merging, invoice delivery and missing capabilities.

Original touched sources are backed up in docs/rollback/pre-phase2e. A source audit checks 24 protected files, including auth/session/guards, dashboard/catalog/library/detail/player, public home, fixture data and package/Playwright configuration.

## Validation

- npm run typecheck: PASS. The final production build also passed its TypeScript step.
- npm run lint: PASS; zero errors or warnings.
- npm run build: PASS with the default Turbopack builder; all 47 static pages generated. Final build ID: dFRlQ5h6EmE03TsY6C-qC.
- npm run test:unit: PASS; 139 tests across six files, including 35 new account tests and all prior 104.
- Focused tests cover account/profile ownership, exact membership labels, missing billing data, currency/date/invoice handling, safe security errors, authorized mock reads, nonexistent device revocation, duplicate/current device handling, settings validation, failed/mismatched saves, profile switching, mock resets, navigation and bounded requests.
- Source audit: PASS; all 24 protected sources/configuration files match the pre-Phase-2E hashes.
- Owned production preview: all six account URLs returned HTTP 200. Status checks alone do not prove authentication; the normal demo sign-in, plan preference and profile-selection flow was separately exercised without guard bypass.
- Focused Chromium browser flow: PASS. All six screens at 1920, 1440, 1024, 768, 390 and 320px produced 36 successful overflow/clipping checks and captures.
- Interactions: active account navigation, read-only unavailable identity editing, accurate no-membership/no-billing/no-devices states, preference cancel/save/navigation persistence, retained profile-editor integration, selected-profile reduced motion, keyboard dialog activation/trapped focus/Escape/focus restoration, confirmed demo recovery, Kids PIN switching, profile-separated captions and stable account identity, return to Browse and desktop logout/auth guard.
- Separate 390px Chromium touch context: PASS for preference taps/save/cancel, system reduced motion, recovery-dialog bounds/centering and logout.
- Added visual regressions verify primary-label contrast (18.25:1 in the final captures), readable 64px account avatars, dialog padding and desktop/mobile centering. The mobile dialog has 16px side margins and fits within the 390 by 844 viewport.
- No browser page errors were recorded. The owned preview server was stopped; the final TCP check reports ECONNREFUSED on port 3009. No existing development server was stopped. The existing root debug log is unchanged.
- The existing full Playwright suite/configuration and deferred timeout investigation were left unchanged.

Desktop overview, mobile billing, 320px preferences and the final 390px recovery dialog were visually inspected. Review caught shared styles overriding primary button text color, shrinking avatar SVGs to 22px, resetting dialog padding and removing native dialog centering. Account-specific selectors restore readable labels, 64px avatars, padding and centering without changing shared styles. The corrected production build and full focused browser flow were rerun successfully.

The initial unit attempt had two timeouts during date/currency formatting initialization; an unchanged retry and the final suite passed. The first Chromium launch timed out before opening a page. That failed attempt is retained; the focused harness now allows up to 300 seconds for browser startup, and subsequent runs passed. Application assertion timeouts and shared test infrastructure were not changed. Vitest retained its existing config-loader compatibility warning.

The browser matrix uses desktop Chromium and an emulated touch context. Physical devices and Safari/Firefox were not tested. Populated production billing/invoice/cancellation, device revocation, optional account editing, actual email delivery and backend failure paths could not be browser-verified without adapters. The relevant validation/status/error/ownership logic has focused unit coverage; no fake production data was inserted to demonstrate those paths.

[Final browser/HTTP observations](./phase2e/observations.json) · [Validation](./phase2e/validation.json) · [Source audit](./phase2e/source-audit.json) · [Server teardown](./phase2e/server-teardown.json) · [Initial launch failure](./phase2e/attempt-1.json)

[Desktop overview](./phase2e/1440-overview.png) · [Mobile billing](./phase2e/390-billing.png) · [320px preferences](./phase2e/320-preferences.png) · [Centered recovery dialog](./phase2e/390-recovery-dialog.png)

## Backend dependencies and remaining limits

Production cookie-session adapters and restoration; authorized persistent account/profile writes; real membership, entitlement, billing/invoice and device records; approved payment-provider workflows; secure email delivery/recovery and parental enforcement remain backend dependencies.

The production-only display-name, populated billing/cancellation and populated device/revocation paths are integration-ready frontend behavior, not claimed live services. No account or streaming access is fabricated by this milestone.

Recommended next milestone: connect the approved account/session/profile/subscription/device adapters with the backend engineer, confirm payment-provider flows, and verify persistence and authorization end to end before enabling commercial membership actions.
