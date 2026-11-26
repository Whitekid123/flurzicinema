import type {DataIdentity,DataPlanningMetadata} from "@/types/datasense";
// Typed service contracts for the authenticated streaming app.
// Production adapters implement these interfaces against the backend API
// (docs/BACKEND_API_CONTRACTS.md). Dev mocks live in lib/api/mocks/ and
// are clearly marked non-production. No service here stores passwords,
// tokens in localStorage, or treats client route checks as security.
import type {
  Account,
  AuthenticatedUser,
  BillingHistoryItem,
  CatalogTitle,
  DeviceInfo,
  Entitlement,
  Notification,
  PlaybackMetadata,
  Session,
  Subscription,
  SubscriptionPlan,
  ViewingProgress,
  ViewerProfile,
  WatchlistItem,
} from "@/types/streaming";
import type { Page, PageRequest } from "./pagination";

// --- Authentication -------------------------------------------------------

export interface RegisterRequest { email: string; password: string; displayName?: string }
export interface LoginRequest { email: string; password: string; rememberMe?: boolean }
export interface AuthResult { user: AuthenticatedUser; account: Account; session: Session }
export interface PasswordRecoveryRequest { email: string }
export interface PasswordResetRequest { token: string; newPassword: string }

export interface AuthenticationService {
  register(input: RegisterRequest): Promise<AuthResult>;
  login(input: LoginRequest): Promise<AuthResult>;
  logout(): Promise<void>;
  getCurrentSession(): Promise<AuthResult | null>;
  verifyEmail(token: string): Promise<void>;
  resendVerificationEmail(): Promise<void>;
  requestPasswordRecovery(input: PasswordRecoveryRequest): Promise<void>;
  resetPassword(input: PasswordResetRequest): Promise<void>;
  getAccount(): Promise<Account | null>;
  // Optional authorized display-name update. Email changes require a separate verified-identity workflow.
  updateAccount?(input: { displayName: string }): Promise<Account>;
  // Optional third-party auth — only when the backend provides it.
  getOAuthProviders?(): Promise<{ id: string; label: string }[]>;
}

// --- Profiles -------------------------------------------------------------

export interface CreateProfileRequest { name: string; avatarKey?: string; isKids?: boolean; pin?: string }
export interface UpdateProfileRequest { name?: string; avatarKey?: string; isKids?: boolean; pin?: string; preferences?: ViewerProfile["preferences"] }

export interface ProfileService {
  listProfiles(): Promise<ViewerProfile[]>;
  createProfile(input: CreateProfileRequest): Promise<ViewerProfile>;
  updateProfile(profileId: string, input: UpdateProfileRequest): Promise<ViewerProfile>;
  deleteProfile(profileId: string): Promise<void>;
  selectProfile(profileId: string): Promise<ViewerProfile>;
  verifyPin?(profileId: string, pin: string): Promise<boolean>;
}

// --- Catalog --------------------------------------------------------------

export interface CatalogService {
  listTitles(query?: PageRequest & { mediaType?: "movie" | "series" }): Promise<Page<CatalogTitle>>;
  getTitle(id: string): Promise<CatalogTitle | null>;
  search(query: string, page?: PageRequest): Promise<Page<CatalogTitle>>;
  listGenres(): Promise<{ id: string; name: string; slug: string }[]>;
  listRecommendations(titleId: string, profileId?: string): Promise<CatalogTitle[]>;
  getContinueWatching(profileId: string): Promise<ViewingProgress[]>;
  getViewingHistory(profileId: string, page?: PageRequest): Promise<Page<ViewingProgress>>;
}

// --- Subscription ---------------------------------------------------------

export interface SubscriptionService {
  listPlans(): Promise<SubscriptionPlan[]>;
  getSubscription(): Promise<Subscription | null>;
  getEntitlement(): Promise<Entitlement>;
  getBillingHistory(page?: PageRequest): Promise<Page<BillingHistoryItem>>;
  changePlan(planId: string): Promise<Subscription>;
  cancelSubscription(): Promise<Subscription>;
  listDevices(): Promise<DeviceInfo[]>;
  revokeDevice(deviceId: string): Promise<void>;
}

// --- Watchlist ------------------------------------------------------------

export interface WatchlistService {
  listWatchlist(profileId: string): Promise<WatchlistItem[]>;
  addToWatchlist(profileId: string, titleId: string): Promise<WatchlistItem>;
  removeFromWatchlist(profileId: string, titleId: string): Promise<void>;
  isInWatchlist(profileId: string, titleId: string): Promise<boolean>;
}

// --- Playback -------------------------------------------------------------

export interface PlaybackService {
  // Optional authorized metadata only; this never grants a playback session.
  getDataPlanningMetadata?(input:DataIdentity&{signal?:AbortSignal}):Promise<DataPlanningMetadata>;
  getPlaybackMetadata(titleId: string, episodeId?: string, context?: { profileId: string; signal?: AbortSignal }): Promise<PlaybackMetadata>;
  reportProgress(progress: Omit<ViewingProgress, "id">): Promise<ViewingProgress>;
  reportCompleted(titleId: string, episodeId?: string, context?: { profileId: string; playbackSessionId: string }): Promise<void>;
}

// --- Notifications / recommendations -------------------------------------

export interface RecommendationService {
  listNotifications(page?: PageRequest): Promise<Page<Notification>>;
  markNotificationRead(notificationId: string): Promise<void>;
  getHomeRails(profileId: string): Promise<{ id: string; title: string; items: CatalogTitle[] }[]>;
}

export interface ServiceRegistry {
  auth: AuthenticationService;
  profiles: ProfileService;
  catalog: CatalogService;
  subscriptions: SubscriptionService;
  watchlist: WatchlistService;
  playback: PlaybackService;
  recommendations: RecommendationService;
}
