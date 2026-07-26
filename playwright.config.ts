import { defineConfig } from '@playwright/test';

// Only the relay/attach half of devtools' e2e suite lives here — the
// launcher PWA fixture (devtools.aitc.dev-hosted) stays in devtools (see
// e2e/launcher-cdp-relay.test.ts's header comment). Neither test file in
// this repo drives a Playwright `page` against a served app: the run_tests
// integration test spawns its own headless Chromium directly, and the relay
// lifecycle tests hit `startChiiRelay` on random ports — so there is no
// `webServer` to boot here (contrast devtools' own playwright.config.ts).
export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.test.ts',
  timeout: 30_000,
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
});
