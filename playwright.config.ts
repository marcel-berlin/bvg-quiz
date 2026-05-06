import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  reporter: [
    ["./tests/privacy-reporter.ts"],
    ["list"],
  ],
  use: {
    baseURL: "http://localhost:4321",
  },
  webServer: {
    command: "pnpm preview",
    url: "http://localhost:4321",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
