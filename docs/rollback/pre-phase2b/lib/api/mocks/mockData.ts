// DEV MOCK DATA — NOT PRODUCTION. Fictional titles only, for Codex/UI work
// and tests. Never describe this as production auth, catalog or licensing.
import type { CatalogTitle, SubscriptionPlan, ViewerProfile } from "@/types/streaming";

export const mockUser = {
  id: "mock-user-1",
  email: "demo@flurzi.example",
  displayName: "Demo Viewer",
  emailVerified: true,
  roles: ["subscriber"],
};

export const mockAccount = {
  id: "mock-account-1",
  email: mockUser.email,
  displayName: mockUser.displayName,
  emailVerified: true,
  createdAt: "2026-01-01T00:00:00.000Z",
};

export const mockProfiles: ViewerProfile[] = [
  {
    id: "mock-profile-main",
    accountId: mockAccount.id,
    name: "Main",
    avatarKey: "amber",
    isKids: false,
    hasPin: false,
    preferences: { language: "en", autoplay: true, playbackQuality: "auto" },
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "mock-profile-kids",
    accountId: mockAccount.id,
    name: "Kids",
    avatarKey: "teal",
    isKids: true,
    hasPin: true,
    preferences: { language: "en", autoplay: false, playbackQuality: "auto", maturityRating: "PG" },
    createdAt: "2026-01-02T00:00:00.000Z",
  },
];

const baseAvailability = { status: "licensed" as const, region: "global" };

export const mockTitles: CatalogTitle[] = [
  {
    id: "mock-quiet-beyond",
    slug: "the-quiet-beyond",
    mediaType: "movie",
    title: "The Quiet Beyond",
    tagline: "Some journeys begin where the known world ends.",
    synopsis: "Fictional demo title. Not licensed for production playback.",
    genres: [{ id: "g-mystery", name: "Mystery", slug: "mystery" }],
    cast: [{ id: "c-1", name: "Demo Cast One", role: "cast" }],
    releaseYear: 2026,
    artwork: { posterUrl: "/images/quiet-beyond.webp", backdropUrl: "/images/quiet-beyond.webp" },
    availability: baseAvailability,
    isLicensedForPlayback: false,
    featured: true,
    durationMinutes: 118,
  },
  {
    id: "mock-velvet-hours",
    slug: "velvet-hours",
    mediaType: "series",
    title: "Velvet Hours",
    synopsis: "Fictional demo series for UI development only.",
    genres: [{ id: "g-drama", name: "Drama", slug: "drama" }],
    cast: [],
    releaseYear: 2025,
    artwork: { posterUrl: "/images/velvet-hours.webp", backdropUrl: "/images/velvet-hours.webp" },
    availability: baseAvailability,
    isLicensedForPlayback: false,
    seasons: [
      {
        id: "mock-velvet-hours-s1",
        number: 1,
        episodes: [
          { id: "mock-vh-s1e1", title: "An unopened letter", episodeNumber: 1, runtimeMinutes: 42, availability: baseAvailability, isLicensedForPlayback: false },
          { id: "mock-vh-s1e2", title: "The other side", episodeNumber: 2, runtimeMinutes: 44, availability: baseAvailability, isLicensedForPlayback: false },
        ],
      },
    ],
  },
];

export const mockPlans: SubscriptionPlan[] = [
  {
    id: "mock-essential",
    name: "Essential (mock)",
    description: "Dev mock plan — no real pricing.",
    monthlyPriceMinor: 899,
    currency: "EUR",
    capabilities: { "Picture quality": "HD (mock)" },
    isActive: true,
  },
  {
    id: "mock-premium",
    name: "Premium (mock)",
    description: "Dev mock plan — no real pricing.",
    monthlyPriceMinor: 1499,
    currency: "EUR",
    capabilities: { "Picture quality": "4K (mock)" },
    isActive: true,
  },
];
