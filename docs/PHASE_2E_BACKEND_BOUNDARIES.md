# Phase 2E account service boundaries

The account centre uses the existing service registry. No HTTP adapter or payment backend was implemented.

## Account identity

AuthenticationService.getAccount returns the current account. Account IDs must match the authenticated account before display. Email and verification status remain read-only.

An optional, backward-compatible AuthenticationService.updateAccount({ displayName: string }): Promise<Account> boundary is added. Adapters that do not implement it show an unavailable state. The development adapter deliberately does not implement it.

Expected authorized operation: accept a trimmed display name of 1–80 characters, validate the cookie session and ownership, persist the name, synchronize relevant account/user identity records, and return the complete updated Account for that same ID. The backend engineer must choose the final HTTP endpoint, CSRF policy and reauthentication requirements. This document does not assert that an endpoint exists. Email changes require a separate verified-email workflow; passwords are never collected here.

## Membership and billing

Existing getSubscription/listPlans/getBillingHistory are read operations. Subscription identity must match the authenticated account. A null subscription or status none means no active membership. Development plan choices never imply payment or entitlement; fixture prices and benefits are suppressed in the account centre.

changePlan remains used only by the pre-existing development preference flow. Production plan purchase/change controls are withheld pending an approved payment-provider workflow. No card form, checkout URL or payment details are fabricated.

cancelSubscription is exposed only for supplied production active/trialing/past-due/paused records without an already scheduled cancellation. A confirmation precedes the request. The returned subscription must match this account and report cancelled or cancelAtPeriodEnd before success. Backend authorization, terms and exact cancellation timing remain authoritative.

getBillingHistory({page,pageSize:10}) must return only this account's records and stable paging metadata. Amounts use supplied integer minor units and ISO currency fraction digits. Invoice URLs require absolute HTTPS without embedded credentials; the backend must additionally constrain invoice hosts, authorize access and issue appropriate short-lived URLs. The frontend does not construct invoice IDs or URLs. Payment-method metadata has no existing contract and stays unavailable. Production plan price quotes, renewal prediction and payment changes are not implemented.

## Security and devices

requestPasswordRecovery({email}) and resendVerificationEmail use the existing contracts. The interface confirms only a received request; it never claims a changed password or newly verified identity. Real delivery, throttling, enumeration resistance and secure single-use links are backend responsibilities. Development requests explicitly send no email.

listDevices returns backend-owned DeviceInfo records. The UI does not infer a registered device from user agent or session ID. A supplied isCurrent flag identifies the current session. revokeDevice(id) is offered for non-current production devices after confirmation; removal follows a successful service response. Current-session logout uses AuthenticationService.logout through SessionProvider. Revocation must invalidate session credentials server-side, handle ownership, and define propagation to playback sessions.

The development adapter returns an empty authorized device list and rejects revocation of nonexistent devices. It also requires a verified development session for billing/device reads. No fake device fixture is installed.

No sign-out-all, active-session detail model, 2FA, alternate recovery address, password-change form or security-notification preferences exist in the contracts. They remain truthful unavailable states rather than new speculative operations.

## Viewer preferences

The existing ProfileService.updateProfile handles profile-owned preferences. Account preferences adds only audioLanguage and subtitleLanguage controls; existing profile management retains motion/autoplay/quality/language/maturity/kids controls. The update sends the current preference object with the two edited fields, validates returned profile and account IDs, and updates SessionProvider only while that viewer's editor remains mounted. Backend adapters should merge preference fields atomically and reject cross-account profile IDs.

Empty string means no preferred language. subtitleLanguage=off disables preferred captions. Other values are language tags. The current player matches supplied caption languages exactly; it does not create tracks or translations. Audio preference is stored for future transport integration; current player audio selection remains manual when native audio tracks are exposed. Quality and autoplay preferences do not claim adaptive rendition switching or automatic next episodes. Reduced motion already works in the streaming shell/player. Kids/maturity/PIN enforcement remains server work.

All development profile changes remain in memory and reset on refresh. Profile switching must preserve separate preferences and account identity. No browser credential or security-code storage is introduced.

## Errors and lifecycle

Account reads have bounded 20-second waits, stale-result suppression and retry. New account actions also bound the UI wait. A timeout does not cancel a backend write that has already been accepted; adapters must define idempotency and authoritative retry/status behavior. Service error details are not echoed into the UI. UNAUTHENTICATED/SESSION_EXPIRED show sign-in recovery; ACCESS_DENIED/PLAYBACK_DENIED and SUBSCRIPTION_REQUIRED remain denied rather than granting access. Production services continue failing closed without adapters.

Backend integration must additionally provide persistent cookie sessions, secure maturity enforcement, profile restoration, authoritative billing/device data and authorization on every read/write. Frontend guards and identity checks are usability safeguards, not access control.
