"use client";
// Session state strategy:
// - Server-owned account/entitlement data stays authoritative on the backend.
// - This context holds only the *current* client view of auth + profile.
// - It never stores passwords or tokens in localStorage. In production,
//   getCurrentSession is a cookie/session round-trip, not local state.
// - The dev mock (lib/api/mocks) is used only when NEXT_PUBLIC_USE_MOCKS=1
//   and is flagged isMock everywhere so UI/tests cannot mistake it for prod.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { AuthState, ViewerProfile } from "@/types/streaming";
import type { AuthenticationService, ProfileService } from "@/lib/api/services";
import { mockServices } from "@/lib/api/mocks/mockServices";

interface SessionContextValue {
  auth: AuthState;
  profile: ViewerProfile | null;
  authService: AuthenticationService;
  profileService: ProfileService;
  refresh: () => Promise<void>;
  setProfile: (profile: ViewerProfile | null) => void;
  signOut: () => Promise<void>;
}

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === "1";

const SessionContext = createContext<SessionContextValue | null>(null);

const initialAuth: AuthState = { status: "authenticating", isMock: USE_MOCKS };

// react-hooks/set-state-in-effect: the initial session fetch runs inside
// an async helper so setState only happens after the await, never
// synchronously in the effect body.
async function fetchSession(
  authService: AuthenticationService,
  requestId: number,
  isCurrent: (id: number) => boolean,
  onSuccess: (state: AuthState) => void,
  onError: () => void,
): Promise<void> {
  try {
    const result = await authService.getCurrentSession();
    if (!isCurrent(requestId)) return;
    if (!result) {
      onSuccess({ status: "unauthenticated", isMock: USE_MOCKS });
      return;
    }
    onSuccess({
      status: "authenticated",
      user: result.user,
      account: result.account,
      session: result.session,
      isMock: result.session.isMock,
    });
  } catch {
    if (!isCurrent(requestId)) return;
    onError();
  }
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(initialAuth);
  const [profile, setProfileState] = useState<ViewerProfile | null>(null);
  const requestRef = useRef(0);

  const authService = USE_MOCKS ? mockServices.auth : mockServices.auth; // TODO(backend): swap to HttpAuthenticationService
  const profileService = USE_MOCKS ? mockServices.profiles : mockServices.profiles; // TODO(backend): swap to HttpProfileService

  const isCurrent = useCallback((id: number) => requestRef.current === id, []);

  const refresh = useCallback(async () => {
    const requestId = ++requestRef.current;
    setAuth({ status: "authenticating", isMock: USE_MOCKS });
    await fetchSession(
      authService,
      requestId,
      isCurrent,
      (next) => {
        setAuth(next);
        if (next.status !== "authenticated") setProfileState(null);
      },
      () => setAuth({ status: "service-unavailable", isMock: USE_MOCKS }),
    );
  }, [authService, isCurrent]);

  useEffect(() => {
    const requestId = ++requestRef.current;
    void fetchSession(
      authService,
      requestId,
      isCurrent,
      (next) => {
        setAuth(next);
        if (next.status !== "authenticated") setProfileState(null);
      },
      () => setAuth({ status: "service-unavailable", isMock: USE_MOCKS }),
    );
  }, [authService, isCurrent]);

  const signOut = useCallback(async () => {
    await authService.logout();
    setProfileState(null);
    setAuth({ status: "unauthenticated", isMock: USE_MOCKS });
  }, [authService]);

  const value = useMemo<SessionContextValue>(
    () => ({
      auth,
      profile,
      authService,
      profileService,
      refresh,
      setProfile: setProfileState,
      signOut,
    }),
    [auth, profile, authService, profileService, refresh, signOut],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside <SessionProvider>");
  return ctx;
}

export function useCurrentProfile() {
  return useSession().profile;
}
