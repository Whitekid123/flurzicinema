// DEV MOCK ADAPTERS — NOT PRODUCTION AUTH/CATALOG.
// These let Codex build UI without a backend. They do not validate
// credentials against a real service, do not issue real sessions, and
// any successful login is a local fiction for development only.
// Production adapters must implement lib/api/services.ts interfaces
// against the backend and replace this file per environment flag.
import { ServiceError, ErrorCodes } from "../errors";
import { emptyPage } from "../pagination";
import type { ServiceRegistry } from "../services";
import { mockAccount, mockPlans, mockProfiles, mockTitles, mockUser } from "./mockData";

function delay<T>(value: T, ms = 30): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

const mockSession = {
  id: "mock-session-1",
  userId: mockUser.id,
  accountId: mockAccount.id,
  createdAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  isMock: true as const,
};

const mockAuthResult = { user: mockUser, account: mockAccount, session: mockSession };

export function createMockServices(): ServiceRegistry {
  return {
    auth: {
      async register() { return delay(mockAuthResult); },
      async login(input) {
        if (!input.email?.includes("@")) throw new ServiceError({ code: ErrorCodes.VALIDATION, message: "Enter a valid email address." });
        return delay(mockAuthResult);
      },
      async logout() { return delay(undefined); },
      async getCurrentSession() { return delay(mockAuthResult); },
      async verifyEmail() { return delay(undefined); },
      async resendVerificationEmail() { return delay(undefined); },
      async requestPasswordRecovery() { return delay(undefined); },
      async resetPassword() { return delay(undefined); },
      async getAccount() { return delay(mockAccount); },
      async getOAuthProviders() { return delay([]); },
    },
    profiles: {
      async listProfiles() { return delay(mockProfiles); },
      async createProfile(input) {
        return delay({ ...mockProfiles[0], id: `mock-profile-${Date.now()}`, name: input.name, isKids: input.isKids ?? false, hasPin: Boolean(input.pin), createdAt: new Date().toISOString() });
      },
      async updateProfile(profileId, input) { void profileId; return delay({ ...mockProfiles[0], name: input.name ?? mockProfiles[0].name }); },
      async deleteProfile() { return delay(undefined); },
      async selectProfile() { return delay(mockProfiles[0]); },
      async verifyPin() { return delay(true); },
    },
    catalog: {
      async listTitles(query) {
        const filtered = mockTitles.filter((t) => !query?.mediaType || t.mediaType === query.mediaType);
        return delay({ items: filtered, page: 1, pageSize: 24, total: filtered.length });
      },
      async getTitle(id) { return delay(mockTitles.find((t) => t.id === id || t.slug === id) ?? null); },
      async search(query) {
        const needle = query.toLowerCase();
        const items = mockTitles.filter((t) => t.title.toLowerCase().includes(needle));
        return delay({ items, page: 1, pageSize: 24, total: items.length });
      },
      async listGenres() { return delay([{ id: "g-mystery", name: "Mystery", slug: "mystery" }]); },
      async listRecommendations() { return delay(mockTitles.slice(0, 1)); },
      async getContinueWatching() { return delay([]); },
      async getViewingHistory() { return delay(emptyPage()); },
    },
    subscriptions: {
      async listPlans() { return delay(mockPlans); },
      async getSubscription() {
        return delay({ id: "mock-sub-1", accountId: mockAccount.id, planId: mockPlans[0].id, status: "active" as const });
      },
      async getEntitlement() { return delay({ accountId: mockAccount.id, canStream: true, canDownload: false, maxStreams: 2, maxProfiles: 5, planId: mockPlans[0].id }); },
      async getBillingHistory() { return delay(emptyPage()); },
      async changePlan(planId) { return delay({ id: "mock-sub-1", accountId: mockAccount.id, planId, status: "active" as const }); },
      async cancelSubscription() { return delay({ id: "mock-sub-1", accountId: mockAccount.id, planId: mockPlans[0].id, status: "cancelled" as const, cancelAtPeriodEnd: true }); },
      async listDevices() { return delay([]); },
      async revokeDevice() { return delay(undefined); },
    },
    watchlist: {
      async listWatchlist() { return delay([]); },
      async addToWatchlist(profileId, titleId) { return delay({ id: `mock-wl-${titleId}`, titleId, profileId, addedAt: new Date().toISOString() }); },
      async removeFromWatchlist() { return delay(undefined); },
      async isInWatchlist() { return delay(false); },
    },
    playback: {
      async getPlaybackMetadata(titleId) {
        // Mock only — production must return a short-lived, server-authorised
        // manifest. Never fabricate a licensable source.
        return delay({ titleId, manifestUrl: undefined, captions: [], isLicensed: false });
      },
      async reportProgress(progress) { return delay({ ...progress, id: `mock-prog-${progress.titleId}` }); },
      async reportCompleted() { return delay(undefined); },
    },
    recommendations: {
      async listNotifications() { return delay(emptyPage()); },
      async markNotificationRead() { return delay(undefined); },
      async getHomeRails() { return delay([{ id: "rail-mock", title: "Mock rail (dev only)", items: mockTitles }]); },
    },
  };
}

export const mockServices = createMockServices();
