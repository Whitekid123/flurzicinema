# Physical phone verification

No physical phone was available for this milestone. Chromium touch emulation cannot prove that iOS or Android opens and positions its native keyboard correctly.

Use the corrected HTTPS staging release, or run an explicitly labeled development preview on a host the phone can reach. The default dev command binds to 127.0.0.1, which a separate phone cannot reach. For a trusted local network, set NEXT_PUBLIC_USE_MOCKS=1 and run:

    node node_modules/next/dist/bin/next dev --hostname 0.0.0.0 --port 3010

Open http://YOUR-COMPUTER-LAN-ADDRESS:3010/login from the phone on the same network. Use fictional credentials in preview mode. For an optimized preview build, also set NEXT_PUBLIC_FLURZI_CHANNEL=preview before building and starting. Do not use that artifact as a release.

1. Open /login in Safari on iPhone and Chrome on Android when available. Tap the center and both sides of Email address. Confirm a caret and native keyboard appear. Type, select, replace and paste an address.
2. Tap Password, enter text and toggle the eye twice. Confirm the field remains usable and no unwanted zoom or page jump occurs. Use the keyboard’s Next/Return actions, then tap Sign in. A release without adapters should show a safe unavailable error, never a successful session.
3. Submit empty/invalid values, then correct them. Confirm validation moves focus to the relevant field and a subsequent request works or shows the truthful service error. Verify Forgot password and Create an account links by touch.
4. On /signup, type in both fields, toggle visibility, select the Terms acknowledgement and exercise validation. Read the actual Terms/Privacy availability before enabling real registration. Policies still require approval.
5. On /forgot-password, type and submit an address. Preview must disclose that no email was sent. Follow the preview-only test reset link, type and confirm a new fictional password. A real reset link must come from the approved email workflow.
6. Open /reset-password without a token and confirm the new-link state. Open an invalid token and verify safe feedback. On /verify-email, exercise the supplied-link action and unavailable/error states; preview test links must be absent from release mode.
7. With the keyboard open, scroll from the active input to the submit button and footer, then back. Test portrait and landscape, the smallest supported phone text size and a larger accessibility text setting. Confirm no input is clipped and the page scrolls normally after dismissing the keyboard.
8. In explicit preview mode, complete sign-in, viewing preference and profile selection. Tap search/filter controls, save/remove a title, edit/cancel a profile and change/cancel caption preferences. Open and close recovery, profile PIN and confirmation dialogs. Confirm dialogs scroll in a short landscape viewport and restore focus/scrolling on close.
9. Check the bottom navigation, the profile menu, Cinema Rooms form/cards and StoryMatch choices. At the bottom of each page, confirm navigation does not cover the final control. Check native selects, checkboxes and sliders with a real authorized playback source when one is available.

Record phone model, OS/browser version, URL/build channel, orientation and the exact failed step. Native keyboard behavior, Safari/Firefox, actual emails, populated production billing/devices and licensed playback still need device/backend acceptance testing.
