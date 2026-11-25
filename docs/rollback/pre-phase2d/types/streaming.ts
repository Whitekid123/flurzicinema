// Flurzi Cinema — authenticated streaming app domain models.
// Frontend contracts only. The backend engineer owns persistence,
// permissions and playback authorisation. These types are deliberately
// decoupled from any third-party metadata API (TMDB etc.) and from the
// public-site `PublicTitle` / `Movie` types in types/public.ts /
// types/cinema.ts — adapters may map between them, components must not
// depend on a specific source API.

export type Id = string;
export type IsoDateTime = string;
export type IsoDate = string;

export type MediaType = "movie" | "series";

export interface Genre { id: Id; name: string; slug: string }
export interface CastMember { id: Id; name: string; character?: string; role: "cast" | "crew"; order?: number }

export interface StreamingAvailability {
  status: "licensed" | "metadata-only" | "unannounced" | "unavailable";
  region?: string;
  availableFrom?: IsoDateTime;
  availableUntil?: IsoDateTime;
}

export interface TitleArtwork { posterUrl?: string; backdropUrl?: string; logoUrl?: string }

export interface TitleBase {
  id: Id;
  slug: string;
  mediaType: MediaType;
  title: string;
  tagline?: string;
  synopsis?: string;
  genres: Genre[];
  cast: CastMember[];
  releaseYear?: number;
  rating?: { value: number; outOf: number; source: string; votes?: number };
  contentRating?: { label: string; region: string; source: string };
  artwork: TitleArtwork;
  availability: StreamingAvailability;
  isLicensedForPlayback: boolean;
  featured?: boolean;
  addedAt?: IsoDateTime;
}

export interface Movie extends TitleBase {
  mediaType: "movie";
  durationMinutes?: number;
}

export interface Episode {
  id: Id;
  title: string;
  description?: string;
  episodeNumber: number;
  runtimeMinutes?: number;
  artwork?: TitleArtwork;
  availability: StreamingAvailability;
  isLicensedForPlayback: boolean;
}

export interface Season {
  id: Id;
  number: number;
  description?: string;
  episodes: Episode[];
}

export interface Series extends TitleBase {
  mediaType: "series";
  seasons: Season[];
}

export type CatalogTitle = Movie | Series;

// --- Account / identity ---------------------------------------------------

export interface Account {
  id: Id;
  email: string;
  displayName?: string;
  emailVerified: boolean;
  createdAt: IsoDateTime;
  locale?: string;
  region?: string;
}

export interface AuthenticatedUser {
  id: Id;
  email: string;
  displayName?: string;
  emailVerified: boolean;
  roles: string[];
}

export interface Session {
  id: Id;
  userId: Id;
  accountId: Id;
  createdAt: IsoDateTime;
  expiresAt: IsoDateTime;
  // Opaque to the browser in production. The frontend never stores or
  // exposes access tokens; sessions are validated server-side.
  isMock: boolean;
}

export type AuthStatus =
  | "unauthenticated"
  | "authenticating"
  | "authenticated"
  | "email-verification-required"
  | "subscription-required"
  | "onboarding-incomplete"
  | "session-expired"
  | "access-denied"
  | "service-unavailable";

export interface AuthState {
  status: AuthStatus;
  user?: AuthenticatedUser;
  account?: Account;
  session?: Session;
  // dev-mock only — never treat as production auth
  isMock: boolean;
}

// --- Profiles -------------------------------------------------------------

export interface ViewerProfile {
  id: Id;
  accountId: Id;
  name: string;
  avatarKey?: string;
  isKids: boolean;
  hasPin: boolean;
  preferences: ProfilePreferences;
  createdAt: IsoDateTime;
}

export interface ProfilePreferences {
  language?: string;
  audioLanguage?: string;
  subtitleLanguage?: string;
  playbackQuality?: "auto" | "low" | "medium" | "high" | "4k";
  autoplay?: boolean;
  reducedMotion?: boolean;
  maturityRating?: string;
}

// --- Subscription ---------------------------------------------------------

export interface SubscriptionPlan {
  id: Id;
  name: string;
  description?: string;
  monthlyPriceMinor?: number;
  yearlyPriceMinor?: number;
  currency?: string;
  capabilities: Record<string, string>;
  isActive: boolean;
}

export type SubscriptionStatus =
  | "none" | "trialing" | "active" | "past-due" | "cancelled" | "paused";

export interface Subscription {
  id: Id;
  accountId: Id;
  planId: Id;
  status: SubscriptionStatus;
  currentPeriodStart?: IsoDateTime;
  currentPeriodEnd?: IsoDateTime;
  cancelAtPeriodEnd?: boolean;
}

export interface Entitlement {
  accountId: Id;
  canStream: boolean;
  canDownload: boolean;
  maxStreams: number;
  maxProfiles: number;
  planId?: Id;
  reason?: string;
}

export interface BillingHistoryItem {
  id: Id;
  date: IsoDateTime;
  amountMinor: number;
  currency: string;
  status: "paid" | "pending" | "failed" | "refunded";
  invoiceUrl?: string;
}

// --- Watch / playback -----------------------------------------------------

export interface WatchlistItem {
  id: Id;
  titleId: Id;
  profileId: Id;
  addedAt: IsoDateTime;
}

export interface ViewingProgress {
  id: Id;
  titleId: Id;
  episodeId?: Id;
  profileId: Id;
  positionSeconds: number;
  durationSeconds?: number;
  completed: boolean;
  lastWatchedAt: IsoDateTime;
}

export interface PlaybackMetadata {
  titleId: Id;
  episodeId?: Id;
  manifestUrl?: string;
  expiresAt?: IsoDateTime;
  captions: { language: string; label: string; url: string }[];
  audioTracks?: { language: string; label: string }[];
  qualities?: string[];
  isLicensed: boolean;
}

export interface Notification {
  id: Id;
  accountId: Id;
  title: string;
  body?: string;
  read: boolean;
  createdAt: IsoDateTime;
  href?: string;
}

export interface DeviceInfo {
  id: Id;
  label?: string;
  platform?: string;
  lastSeenAt?: IsoDateTime;
  isCurrent: boolean;
}
