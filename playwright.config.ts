import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for Singalong E2E tests.
 *
 * Tests run headlessly against a local dev server.
 * The coordination server must also be running (started by globalSetup or
 * manually via `npm run dev:server`).
 *
 * Run: npx playwright test
 * Run headless explicitly: npx playwright test --project=chromium
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 8_000 },
  fullyParallel: false, // rooms share a single server; serialise to avoid races
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: 'http://localhost:5174',
    trace: 'on-first-retry',
    // Allow fake media — critical for WebRTC tests without real mic/camera
    launchOptions: {
      args: [
        '--use-fake-ui-for-media-stream',
        '--use-fake-device-for-media-stream',
        '--allow-file-access-from-files',
        '--disable-web-security',
        '--autoplay-policy=no-user-gesture-required',
      ],
    },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Start the Vite dev server automatically before running tests.
  // The coordination server (port 4000) must be started separately
  // (make dev-server) because it connects to LiveKit on startup.
  webServer: {
    command: 'npm run dev -- --port 5174',
    url: 'http://localhost:5174',
    reuseExistingServer: true,
    timeout: 15_000,
  },
});
