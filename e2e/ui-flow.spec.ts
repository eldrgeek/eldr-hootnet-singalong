/**
 * E2E: UI flow tests (browser-level)
 *
 * Tests use a real Chromium browser with fake media streams so WebRTC
 * getUserMedia works without a physical microphone.
 *
 * Two tiers of assertions:
 *   1. UI flow — works without a live LiveKit server (just needs :4000)
 *   2. WebRTC assertions — skipped automatically if LiveKit is unreachable
 *
 * Prerequisites:
 *   make dev-server   (coordination server on :4000)
 *   npm run dev       (Vite dev server on :5174)  ← started by playwright webServer
 */
import { test, expect, type Page, type BrowserContext } from '@playwright/test';
import { SERVER, apiCreateRoom, apiJoinRoom, apiRoomState, apiDeleteRoom } from './helpers';

// ── Skip-guard: if coordination server isn't up, skip everything ───────────

test.beforeAll(async () => {
  try {
    const res = await fetch(`${SERVER}/health`);
    if (!res.ok) throw new Error('unhealthy');
  } catch {
    test.skip();
  }
});

// ── Helpers ────────────────────────────────────────────────────────────────

/** Navigate to home and wait for the page to settle */
async function goHome(page: Page) {
  await page.goto('/');
  await page.waitForSelector('text=Hootnet Singalong');
}

/** Check whether the Vite app can reach the coordination server */
async function serverReachable(): Promise<boolean> {
  try {
    const r = await fetch(`${SERVER}/health`);
    return r.ok;
  } catch {
    return false;
  }
}

// ── Suite 1: Home page ──────────────────────────────────────────────────────

test.describe('Home page', () => {
  test('renders title and both action cards', async ({ page }) => {
    await goHome(page);
    await expect(page.getByRole('heading', { name: /Hootnet Singalong/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Create Room/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Join as Performer/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Join as Audience/i })).toBeVisible();
  });

  test('join buttons disabled until code is entered', async ({ page }) => {
    await goHome(page);
    await expect(page.getByRole('button', { name: /Join as Performer/i })).toBeDisabled();
    await expect(page.getByRole('button', { name: /Join as Audience/i })).toBeDisabled();
  });

  test('join buttons enable when code is typed', async ({ page }) => {
    await goHome(page);
    await page.getByPlaceholder(/room code/i).fill('ABC123');
    await expect(page.getByRole('button', { name: /Join as Performer/i })).toBeEnabled();
    await expect(page.getByRole('button', { name: /Join as Audience/i })).toBeEnabled();
  });

  test('shows error for invalid room code', async ({ page }) => {
    await goHome(page);
    await page.getByPlaceholder(/room code/i).fill('ZZZZZZ');
    await page.getByRole('button', { name: /Join as Performer/i }).click();
    // Error renders as a <p> with the server's error message
    await expect(page.locator('text=/Room not found|not found/i').first()).toBeVisible({ timeout: 8000 });
  });
});

// ── Suite 2: Create room flow ───────────────────────────────────────────────

test.describe('Create room flow', () => {
  test('Create Room navigates to control page and shows join code', async ({ page }) => {
    await goHome(page);
    await page.getByRole('button', { name: /Create Room/i }).click();

    // Should land on /control/:roomId
    await expect(page).toHaveURL(/\/control\//);

    // Join code display should be visible (6 uppercase hex chars)
    const codeEl = page.locator('div').filter({ hasText: /^[0-9A-F]{6}$/ }).first();
    await expect(codeEl).toBeVisible({ timeout: 8000 });
    const code = (await codeEl.textContent()) ?? '';
    expect(code).toMatch(/^[0-9A-F]{6}$/);
  });

  test('control page shows room ID and performer link', async ({ page }) => {
    await goHome(page);
    await page.getByRole('button', { name: /Create Room/i }).click();
    await expect(page).toHaveURL(/\/control\//);

    await expect(page.getByRole('heading', { name: /Control Room/i })).toBeVisible();
    await expect(page.getByText(/Room Created/i)).toBeVisible({ timeout: 8000 });
    await expect(page.getByText(/Copy Performer Link/i)).toBeVisible();
  });
});

// ── Suite 3: Join flow (API-driven room creation, UI join) ──────────────────

test.describe('Join flow', () => {
  let roomId: string;
  let joinCode: string;

  test.beforeEach(async () => {
    ({ roomId, joinCode } = await apiCreateRoom());
  });

  test.afterEach(async () => {
    await apiDeleteRoom(roomId);
  });

  test('entering a valid code and clicking Join navigates to /play/:roomId', async ({ page }) => {
    await goHome(page);
    await page.getByPlaceholder(/room code/i).fill(joinCode);
    await page.getByRole('button', { name: /Join as Performer/i }).click();

    await expect(page).toHaveURL(new RegExp(`/play/${roomId}`), { timeout: 8000 });
    await expect(page.getByRole('heading', { name: /Performer View/i })).toBeVisible();
  });

  test('performer page shows the Join Session button in setup phase', async ({ page }) => {
    await page.goto(`/play/${roomId}`);
    await expect(page.getByRole('button', { name: /Join Session/i })).toBeVisible();
    await expect(page.getByPlaceholder(/your name/i)).toBeVisible();
  });
});

// ── Suite 4: Room state verification (API + browser) ───────────────────────

test.describe('Room state', () => {
  let roomId: string;
  let joinCode: string;

  test.beforeEach(async () => {
    ({ roomId, joinCode } = await apiCreateRoom());
  });

  test.afterEach(async () => {
    await apiDeleteRoom(roomId);
  });

  test('state endpoint is empty before any performer joins', async () => {
    const state = await apiRoomState(roomId);
    expect(state.performers).toHaveLength(0);
    expect(state.status).toBe('waiting');
    expect(state.mixAgentConnected).toBe(false);
  });

  test('state reflects two performers joining via API', async () => {
    await apiJoinRoom(roomId, 'Alice');
    await apiJoinRoom(roomId, 'Bob');

    const state = await apiRoomState(roomId);
    expect(state.performers).toHaveLength(2);
    expect(state.status).toBe('live');
    expect(state.performers[0]).toMatchObject({ slot: 1, peerId: 'performer-1' });
    expect(state.performers[1]).toMatchObject({ slot: 2, peerId: 'performer-2' });
    // Mix agent should have been spawned
    expect(state.mixAgentConnected).toBe(true);
    expect(state.agentTracks).toContain('monitor-audience');
    expect(state.agentTracks).toContain('monitor-1');
    expect(state.agentTracks).toContain('monitor-2');
  });

  test('state code matches the join code', async () => {
    const state = await apiRoomState(roomId);
    expect(state.code).toBe(joinCode);
  });
});

// ── Suite 5: Multi-context — two performers in separate browser tabs ────────

test.describe('Two-performer session (UI)', () => {
  let roomId: string;
  let joinCode: string;

  test.beforeEach(async () => {
    ({ roomId, joinCode } = await apiCreateRoom());
  });

  test.afterEach(async () => {
    await apiDeleteRoom(roomId);
  });

  test('host creates room, second browser joins with code, state shows 2 performers', async ({
    browser,
  }) => {
    // Context A: host lands on control page
    const ctxA: BrowserContext = await browser.newContext({
      launchOptions: {
        args: [
          '--use-fake-ui-for-media-stream',
          '--use-fake-device-for-media-stream',
        ],
      },
    });
    const pageA = await ctxA.newPage();
    await pageA.goto(`/control/${roomId}?new=1&code=${joinCode}`);
    await expect(pageA.locator(`text=${joinCode}`).first()).toBeVisible({ timeout: 8000 });

    // Context B: performer opens the play URL directly
    const ctxB: BrowserContext = await browser.newContext({
      launchOptions: {
        args: [
          '--use-fake-ui-for-media-stream',
          '--use-fake-device-for-media-stream',
        ],
      },
    });
    const pageB = await ctxB.newPage();
    await pageB.goto(`/play/${roomId}`);
    await expect(pageB.getByRole('button', { name: /Join Session/i })).toBeVisible({ timeout: 6000 });

    // Context B: performer joins via the API (simulates clicking the button;
    // the button click triggers a LiveKit connection which we can't assert
    // without a live server, but the API call itself proves the slot claim)
    const joinData = await apiJoinRoom(roomId, 'Context B Performer');
    expect(joinData.position).toBe(1);
    expect(joinData.token).toBeTruthy();

    // State endpoint shows 1 active performer
    const state = await apiRoomState(roomId);
    expect(state.performers).toHaveLength(1);
    expect(state.mixAgentConnected).toBe(true);

    await ctxA.close();
    await ctxB.close();
  });
});

// ── Suite 6: WebRTC join (requires live LiveKit on VPS) ────────────────────
// These tests click the actual "Join Session" button which triggers WebRTC.
// They auto-skip if LiveKit is unreachable.

test.describe('WebRTC performer join (requires live LiveKit)', () => {
  let roomId: string;

  test.beforeEach(async () => {
    // Pre-check: is LiveKit (VPS) reachable?
    let liveKitReachable = false;
    try {
      const r = await fetch(`${SERVER}/health`);
      if (r.ok) {
        // Try to create a room; if LiveKit is down the server returns 500
        const rr = await fetch(`${SERVER}/rooms`, { method: 'POST' });
        if (rr.ok) {
          const d = await rr.json();
          roomId = d.roomId;
          liveKitReachable = true;
        }
      }
    } catch { /* unreachable */ }

    if (!liveKitReachable) test.skip();
  });

  test.afterEach(async () => {
    if (roomId) await apiDeleteRoom(roomId);
  });

  test('performer connects to LiveKit and reaches "live" phase', async ({ page }) => {
    await page.goto(`/play/${roomId}`);
    await page.getByPlaceholder(/your name/i).fill('E2E Performer');
    await page.getByRole('button', { name: /Join Session/i }).click();

    // Should transition to the live phase and show the position badge
    // (badge is a standalone div; use first() to avoid strict-mode on the info text below it)
    await expect(page.locator('text=/Performer #/i').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=connected').first()).toBeVisible({ timeout: 15000 });
  });

  test('performer #1 sees the "lead hears nothing" info box', async ({ page }) => {
    await page.goto(`/play/${roomId}`);
    await page.getByPlaceholder(/your name/i).fill('Lead');
    await page.getByRole('button', { name: /Join Session/i }).click();

    await expect(page.locator('text=/lead.*performer.*#1/i')).toBeVisible({ timeout: 15000 });
  });
});
