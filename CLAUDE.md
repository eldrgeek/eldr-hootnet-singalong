---
district: shows-creative
status: active
depends_on: []
capabilities: [web-audio, livekit, netlify, vps]
last_reviewed: 2026-06-23
---

# singalong — Hootnet Singalong, browser multi-track overdub recorder

React + Web Audio app: load a reference track, record over it, layer takes. v2 explores synchronized ensemble play over the net (LiveKit).

**Where work happens:** `src/audio.ts` (decode + sample-accurate playback engine) · `src/pages/` (Home/Performer/Audience/Control) · `src/App.tsx` · `server/` (Node API: `app.js`, `index.js`, `mix-minus.js`, `singalong.db`) · `agent/` (LiveKit agent).

**Key docs** (read in this order):
- [README.md](README.md) — what it is, how to run, MVP status + roadmap.
- [SPECIFICATION.md](SPECIFICATION.md) — v2 spec: net-latency physics, non-negotiables, architecture, open questions.
- [README-TESTING.md](README-TESTING.md) — 48 unit + 21 Playwright E2E tests.

**Build/run:** `npm run dev` (Vite client) · `npm run dev:server` (Node API) · `npm run build` (tsc + vite) · `npm test` / `npm run test:e2e` / `npm run test:all`.

**Depends on / used by:** deploys to Netlify (`netlify.toml`, publish `dist`); `/api/*` proxies to the **VPS at `vpsmikewolf.duckdns.org:4000`**. Uses `livekit-client` for the ensemble/relay path.

**Gotchas**
- `/api/*` is a hard redirect to the VPS on `:4000` — local server work needs that endpoint (or the proxy) reachable, and the VPS service running.
- Use headphones when testing recording — the mic picks up speaker playback and double-records the mix.
- `legacy/` is the dead React-16/Firebase prototype kept for reference only — do not build on it.
