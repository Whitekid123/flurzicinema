import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      // Match tsconfig paths so unit tests can import @/* modules.
      "@": new URL(".", import.meta.url).pathname,
    },
  },
  test: {
    // Only real unit tests — TS + optional TSX. Never collect Playwright
    // specs or files inside rollback archives / generated dirs.
    include: ["tests/**/*.unit.test.{ts,tsx}"],
    exclude: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "test-results/**",
      "docs/**",
      "tests/**/*.spec.ts",
      "**/*.spec.ts",
    ],
    environment: "node",
    globals: false,
  },
});
