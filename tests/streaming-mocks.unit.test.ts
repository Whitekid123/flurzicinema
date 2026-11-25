// Unit tests for mock adapters (run with `npm run test:unit`).
// These exercise dev mocks only — production adapters are not yet written.
import { describe, expect, it } from "vitest";
import { createMockServices } from "../lib/api/mocks/mockServices";

describe("mock services (dev only)", () => {
  const services = createMockServices();

  it("login rejects invalid email", async () => {
    await expect(services.auth.login({ email: "not-an-email", password: "x" })).rejects.toThrowError();
  });

  it("login returns mock session flagged isMock", async () => {
    const result = await services.auth.login({ email: "demo@example.com", password: "x" });
    expect(result.session.isMock).toBe(true);
  });

  it("catalog lists fictional titles", async () => {
    const page = await services.catalog.listTitles({ mediaType: "movie" });
    expect(page.items.length).toBeGreaterThan(0);
    expect(page.items.every((t) => t.mediaType === "movie")).toBe(true);
  });

  it("playback never fabricates a licensable source", async () => {
    const metadata = await services.playback.getPlaybackMetadata("any");
    expect(metadata.isLicensed).toBe(false);
    expect(metadata.manifestUrl).toBeUndefined();
  });
});
