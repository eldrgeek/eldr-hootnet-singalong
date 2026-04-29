# Hootnet Singalong — Test Suite

## Quick start

```bash
make test          # fast unit tests — no server, no browser needed
make test-e2e      # Playwright E2E  — needs coordination server running
make test-all      # everything
```

---

## Test layers

### 1. Unit tests — `make test` or `npm test`

Location: `server/test/`
Runner: Node built-in `node:test`
Requirements: **none** (no LiveKit, no running server)

| File | What it covers |
|---|---|
| `test/api.test.js` | All REST endpoints via supertest (31 tests) |
| `test/mix-minus.test.js` | Mix-minus routing invariants (17 tests) |

These tests use:
- An **in-memory SQLite database** — no file on disk
- A **mock LiveKit roomService** — `createRoom` / `deleteRoom` resolve instantly
- A **mock token generator** — returns a deterministic fake string

They are the primary CI signal. If these 48 tests pass, the coordination logic is correct.

**Run individually:**
```bash
cd server
npm run test:api   # API tests only
npm run test:mix   # mix-minus tests only
npm test           # both
```

---

### 2. Mix-minus routing invariants (`test/mix-minus.test.js`)

Tests the pure routing logic extracted into `server/mix-minus.js`:

- `getMixRecipients(fromPosition, monitorPositions)` — which monitor tracks
  receive a given performer's audio
- `buildMixMatrix(positions)` — complete N×N routing table
- `selfHearingFree(position, positions)` — no performer hears themselves

**Core invariant verified:** performer at slot N hears exactly slots 1..(N-1).
Performer #1 (the lead) always hears silence.

---

### 3. Playwright E2E tests — `make test-e2e`

Location: `e2e/`
Runner: `@playwright/test` (Chromium, headless)
Requirements:
- **Coordination server** running on `:4000` → `make dev-server` in a second terminal
- **Vite dev server** on `:5174` → started automatically by Playwright

| File | What it covers | Needs LiveKit? |
|---|---|---|
| `e2e/server-api.spec.ts` | Real HTTP calls against `:4000` — create/join/state/close | No* |
| `e2e/ui-flow.spec.ts` | Browser UI: home page, create room, join flow, 2-context session | No* |
| `e2e/ui-flow.spec.ts` (WebRTC suite) | Performer connects to LiveKit, reaches "live" phase | **Yes** |

*These suites skip gracefully if the coordination server is unreachable.

**The WebRTC suite** auto-skips when the VPS LiveKit instance is not reachable. It
verifies that clicking "Join Session" completes the full WebRTC negotiation and the
UI transitions to the live performer view. To run it you need:
- The VPS running (`vpsmikewolf.duckdns.org`)
- LiveKit server running on the VPS

**Fake media flags** are passed to Chromium so `getUserMedia` works in CI without
a physical microphone:
```
--use-fake-ui-for-media-stream
--use-fake-device-for-media-stream
```

---

## File map

```
server/
  app.js              ← Express app factory (injectable deps, fully testable)
  index.js            ← Production entry point (real DB, real LiveKit)
  mix-minus.js        ← Pure routing logic (no LiveKit deps)
  test/
    api.test.js       ← REST API unit tests
    mix-minus.test.js ← Routing invariant tests

e2e/
  helpers.ts          ← Thin fetch wrappers for API calls in tests
  server-api.spec.ts  ← API smoke tests via Playwright request fixture
  ui-flow.spec.ts     ← Browser UI + state-endpoint verification

playwright.config.ts  ← Playwright config (baseURL, fake media args, webServer)
Makefile              ← make test / test-e2e / test-all / dev-server
```

---

## Architecture note: testability hook

`GET /rooms/:id/state` was added to the server as a first-class instrumentation
endpoint. It returns:

```json
{
  "code": "A3F9C2",
  "status": "live",
  "performers": [
    { "slot": 1, "peerId": "performer-1" },
    { "slot": 2, "peerId": "performer-2" }
  ],
  "agentTracks": ["monitor-audience", "monitor-1", "monitor-2"],
  "mixAgentConnected": true
}
```

Tests use this endpoint instead of introspecting LiveKit or reading the database
directly, keeping assertions stable across refactors.

---

## What each assertion proves

| Assertion | Proves |
|---|---|
| `POST /rooms` returns `{roomId, joinCode}` | Room creation end-to-end |
| `GET /rooms/code/:code` resolves roomId | Code lookup works |
| `POST /rooms/:id/join` assigns sequential slots | Slot allocation logic |
| Join #9 returns 400 "full" | Performer cap enforced |
| Join a closed room returns 400 | Status guard works |
| `GET /rooms/:id/state` performers array | DB state correct |
| `mixAgentConnected: true` after first join | Agent is spawned on first join |
| `agentTracks` contains `monitor-N` for each slot | Track naming invariant |
| `getMixRecipients(N, positions)` excludes N | Core mix-minus invariant |
| `buildMixMatrix` for 8 performers | Full routing table correctness |
| `selfHearingFree` passes for all slots | Self-hearing prevention |
| UI: Create Room → control page with code | React routing + API integration |
| UI: enter code → navigate to `/play/:id` | Join flow front-to-back |
| 2 browser contexts, one room, state = 2 performers | Multi-client coordination |
