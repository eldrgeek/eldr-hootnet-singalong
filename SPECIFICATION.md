# Hootnet Singalong v2 — Technical Specification

**Version**: 0.1 (Pass 1 — structure and open questions; iterate after Mike's review)
**Date**: 2026-04-27
**Status**: Draft — awaiting answers to Open Questions

---

## Table of Contents

0. [Background Context](#0-background-context)
1. [Non-Negotiables](#1-non-negotiables)
2. [Out of Scope (v1)](#2-out-of-scope-v1)
3. [Success Criteria](#3-success-criteria)
4. [Architecture Specification](#4-architecture-specification)
5. [Safety Invariants](#5-safety-invariants)
6. [Implementation Roadmap](#6-implementation-roadmap)
7. [Open Questions](#7-open-questions)
8. [References](#8-references)

---

## 0. Background Context

### The Problem: Playing Music Together Over the Internet

Human musical ensemble performance — a jazz trio trading solos, a bluegrass band singing in three-part harmony, a string quartet playing Brahms — depends on millisecond-level feedback between performers. A drummer hears the bassist, adjusts their tempo, the bassist responds; this feedback loop runs continuously at a rate of roughly 50–100 ms. When that loop is broken or delayed, performance falls apart: players drift, phrasing collapses, and the musical conversation becomes a shouting match across a bad phone line.

The speed of light through fiber optic cable is approximately 200 km/ms. A performer in San Francisco and one in New York are separated by roughly 4,300 km — a theoretical minimum round-trip of ~21 ms. With real-world routing, codec processing, jitter buffers, and OS scheduling, the practical floor for a coast-to-coast WebRTC call is 40–80 ms one-way. **The physics are non-negotiable.**

There is general consensus among musicians and researchers that:
- **< 25 ms** one-way: imperceptible, equivalent to being on stage together
- **25–80 ms** one-way: noticeable but tolerable for practiced players; bluegrass, jazz, folk
- **80–150 ms** one-way: requires deliberate adaptation; rock/pop possible, classical difficult
- **> 150 ms** one-way: effectively unplayable; musicians cannot maintain shared tempo

This means Singalong is, at its core, a **latency engineering problem** as much as a product problem.

### Why Existing Tools Fail

| Tool | Model | Problem |
|------|-------|---------|
| Zoom / FaceTime | Conference call | Echo cancellation, AGC, and noise suppression destroy musical audio; 100–400 ms latency typical |
| JamKazam | P2P mesh | Closed ecosystem; requires paid subscription and proprietary hardware; unmaintained |
| Jamulus | P2P star | Open source, LAN-optimized; excellent for same-city but poor WAN perf; no web client |
| BandLab / Soundtrap | Async overdub | Sequential recording: each player hears prior takes, records over them — NOT live performance |
| Ninjam | Block-based async | Intentionally 1–2 bar delayed (latency = block size); avant-garde not ensemble |

None of these expose a web-native, programmable API for custom ensemble structures. Jamulus is the closest spiritual predecessor, but it requires a native desktop app and a self-hosted server.

### The Singalong Architecture: Mix-Minus for N Performers

Singalong uses the **mix-minus** model, borrowed from broadcast radio engineering. In a traditional radio studio, each host hears everyone *except themselves* in their monitor headphones (the "minus" being their own voice). This eliminates the intolerable feedback of hearing yourself delayed.

Applied to a live musical ensemble with N performers in defined order:

```
P1 (Lead)     ── publishes ──▶  SFU  ──▶  mix-agent
P2            ── publishes ──▶  SFU  ──▶  mix-agent ──▶ monitor-2 ──▶ P2 hears: [P1]
P3            ── publishes ──▶  SFU  ──▶  mix-agent ──▶ monitor-3 ──▶ P3 hears: [P1, P2]
PN            ── publishes ──▶  SFU  ──▶  mix-agent ──▶ monitor-N ──▶ PN hears: [P1..N-1]

Audience     ◀──────────────────── monitor-full ──────────────────── [P1..PN] full mix
Control Room ◀──────────────────── all stems (raw, individual tracks)
```

The SFU (Selective Forwarding Unit) is a media server that routes WebRTC streams without decoding them; the mix-agent is a server-side Node.js service that subscribes to raw stems, mixes them in software, and publishes virtual "monitor" participants back to the room. Each performer subscribes exclusively to their assigned monitor track — never directly to peers.

This design has three key properties: (1) no performer hears their own voice through the system, (2) the mix presented to each performer is deterministically correct regardless of network topology, and (3) per-stem recording is a natural byproduct of the SFU's egress infrastructure.

### Prior Work: The Legacy Hootnet Singalong

The original `eldrgeek/eldr-hootnet-singalong` was a Firebase-backed sequential overdub tool: P1 records, saves to cloud; P2 downloads, listens, records over it; etc. This is fundamentally **not live performance** — it is asynchronous collaboration. The existing `src/` directory in this repo contains a clean sequential-overdub MVP (Vite + React 19 + Web Audio API) that may be repurposed as a solo practice mode, but is not the v2 product.

### What Hootnet Singalong v2 Is

A **live, simultaneous, multi-party WebRTC musical ensemble platform** where:
- All performers play *at the same time*, in real time
- Each hears a server-generated mix-minus (all prior performers, not themselves)
- An audience can listen to the full ensemble mix without affecting it
- A control room receives per-stem raw audio for live mastering or post-production
- All stems are server-recorded for later mixing and export

---

## 1. Non-Negotiables

These requirements cannot be relaxed in v1 without fundamentally changing what the product is.

**N1 — Mix-Minus Correctness**: Each performer MUST receive a monitor track that contains all lower-numbered performers' audio and zero of their own audio. A monitor containing the listener's own stream, even partially, creates a feedback loop that makes performance impossible.

**N2 — Simultaneous Live Performance**: All performers MUST be connected and playing in real time. This is not an overdub or async-record system. All streams MUST be active simultaneously.

**N3 — Per-Stem Server Recording**: Every performer's audio stream MUST be captured as a separate `.opus` file server-side via LiveKit Egress. The mixed output alone is not sufficient; stems are required for post-production.

**N4 — Three Frontend Route Views**: The frontend MUST implement three distinct views:
  - `/play/:roomId` — performer view (instrument, monitor, join/leave)
  - `/audience/:roomId` — listener view (full ensemble mix, read-only)
  - `/control/:roomId` — control room view (per-stem monitoring, level meters)

**N5 — Latency Budget**: The target mouth-to-ear latency (microphone captured to monitor played in headphones) MUST be < 150 ms for a functional product. < 80 ms is the ambitious design goal. Any architectural decision that adds latency above 150 ms is disqualifying.

**N6 — WebRTC / LiveKit SFU**: The media transport MUST use LiveKit as the SFU. The specific LiveKit instance at `vpsmikewolf.duckdns.org` is already provisioned. No other media transport is in scope.

**N7 — Node.js Mix Agent**: The server-side mix service MUST be a Node.js LiveKit Agent. It MUST subscribe to all performer stems, compute per-performer mix-minus mixes, and publish each as a named virtual participant (e.g., `monitor-2`, `monitor-3`) within the same LiveKit room.

**N8 — Coordination Server**: A thin backend service MUST manage room state (room creation, performer ordering, token issuance). It MUST persist state so that a performer who drops and reconnects rejoins the same position in the chain.

**N9 — No Peer-to-Peer Audio**: Performers MUST NOT subscribe directly to each other's tracks. All audio paths route through the mix agent. This is the only way to guarantee mix-minus correctness and enable server-side recording.

<!-- ANSWER(Q1): Keep /practice solo mode unless it costs something — 2026-04-29 -->

---

## 2. Out of Scope (v1)

The following are explicitly deferred to future versions. Raising them during v1 implementation is a scope-creep flag.

**OS1 — DAW-Quality Mix Engine**: No compressors, EQ, reverb, or send/return effects on the server mix. The mix agent does gain-summing only. Professional mix quality is a post-production concern.

**OS2 — MIDI Sync / Clock**: No MIDI timecode, Ableton Link, or tempo sync infrastructure. Click track (Q6) is a simple audio tone, not a protocol-level sync signal.

**OS3 — Desktop Native App**: No Electron, Tauri, or OS-level native app. Web browser only (Chromium-based browsers primary target; Firefox secondary).

**OS4 — Mobile Native App**: No iOS or Android native app. Mobile browser support is best-effort only; microphone latency on mobile is significantly worse due to OS audio stack constraints.

**OS5 — Video**: No webcam video tracks. Audio only. Video adds bandwidth, latency jitter, and UI complexity without benefiting the core musical use case.

**OS6 — Sample-Accurate Alignment in DAW Export**: Stems are captured via LiveKit Egress. RTP timestamp alignment to sub-millisecond accuracy for DAW import is a Phase 4 concern. Phase 1–3 exports may have alignment drift of tens of milliseconds.

**OS7 — User Accounts / Auth System**: No OAuth, no user database, no profile pages. Room access is via room code or link. Anonymous join by default.

<!-- ANSWER(Q7): Anonymous room code only, no accounts — 2026-04-29 -->

**OS8 — Billing / Monetization**: No payment infrastructure, usage metering, or tiered access. Out of scope for v1 entirely.

**OS9 — Chat / Text Communication**: No in-room text chat. Audio-only communication surface; if performers need to communicate, they use a separate channel (phone, Discord, etc.).

**OS10 — Recording Playback UI**: The recording manifest and stem files are server-side artifacts. A browser-based playback/mixing UI for recorded stems is not in scope for v1.

---

## 3. Success Criteria

Success criteria are binary and measurable. Each phase has its own criteria; overall v1 success requires all Phase 1–3 criteria to be met.

### Phase 1 Success Criteria (LiveKit Foundation)

- [ ] **SC-1.1**: A performer at P1 position can join a room via `/play/:roomId` and publish a microphone stream to LiveKit without error.
- [ ] **SC-1.2**: A performer at P2 position can join the same room and receive a monitor track containing P1's audio only (verified by listening test and LiveKit room inspector).
- [ ] **SC-1.3**: P2 receives zero audio of their own voice through the monitor track (feedback loop test: hold P2 mic next to P2 speaker at high gain; no runaway feedback).
- [ ] **SC-1.4**: Measured mouth-to-ear latency P1→P2 is < 200 ms on a LAN / same-datacenter VPS test (measured via clap test with high-speed camera or WebRTC `getStats()` RTT + playout delay).
- [ ] **SC-1.5**: LiveKit Egress captures two separate `.opus` stem files (one per performer) for the duration of the session.

### Phase 2 Success Criteria (N-Performer + Audience)

- [ ] **SC-2.1**: At least 5 performers can join simultaneously; each receives the correct mix-minus (verified programmatically by inspecting mix-agent routing table).
- [ ] **SC-2.2**: An audience member at `/audience/:roomId` hears the full ensemble mix with no artifacts from joining/leaving the performer view.
- [ ] **SC-2.3**: Audience member joins do not affect performer latency (measured: P1→P2 latency delta < 5 ms when 10 audience members connect simultaneously).
- [ ] **SC-2.4**: A performer dropping and reconnecting resumes at the same position number in the chain without requiring a room restart.

### Phase 3 Success Criteria (Control Room + Recording Manifest)

- [ ] **SC-3.1**: Control room view at `/control/:roomId` displays per-stem level meters in real time, with stems labeled by performer name and position number.
- [ ] **SC-3.2**: On room close, a recording manifest JSON file is written containing: room ID, start/end timestamps, performer order, per-stem Egress file paths, and estimated alignment offsets.
- [ ] **SC-3.3**: Stems can be downloaded from the coordination server's artifact endpoint.

---

## 4. Architecture Specification

### 4.1 System Components

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Client Browser                               │
│  React + Vite + livekit-client SDK                                  │
│  /play/:roomId    /audience/:roomId    /control/:roomId             │
└───────────┬────────────────────────────────────────────────────────┘
            │  HTTPS + WebRTC (DTLS-SRTP)
            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    LiveKit SFU                                       │
│  vpsmikewolf.duckdns.org  (already installed)                       │
│  Manages rooms, track subscriptions, Egress recording               │
└───────────┬─────────────────────┬──────────────────────────────────┘
            │  LiveKit SDK (gRPC)  │  LiveKit Agent SDK (Node.js)
            ▼                     ▼
┌──────────────────┐   ┌─────────────────────────────────────────────┐
│  Coordination    │   │              Mix Agent (Node.js)            │
│  Server          │   │                                             │
│  (Node.js/       │   │  Subscribes: all performer stems            │
│   Express +      │   │  Computes:   per-performer mix-minus        │
│   SQLite)        │   │  Publishes:  monitor-1 .. monitor-N         │
│                  │   │             monitor-audience                │
│  REST API        │   │             monitor-control (all stems)     │
│  Room CRUD       │   │                                             │
│  Token issuance  │   │  One agent instance per room                │
│  Recording       │   │  Spawned by coordination server on          │
│   manifests      │   │  first performer join                       │
└──────────────────┘   └─────────────────────────────────────────────┘
            │
            ▼
┌──────────────────┐
│  LiveKit Egress  │
│  Per-participant │
│  .opus files     │
│  written to VPS  │
│  filesystem      │
└──────────────────┘
```

### 4.2 LiveKit Room Topology

Each Singalong session maps to one LiveKit room. Participants within the room:

| Participant Identity | Type | Publishes | Subscribes To |
|---------------------|------|-----------|---------------|
| `performer-1` | Human | `mic-1` (audio) | `monitor-1` |
| `performer-2` | Human | `mic-2` (audio) | `monitor-2` |
| `performer-N` | Human | `mic-N` (audio) | `monitor-N` |
| `audience-{uuid}` | Human | *(nothing)* | `monitor-audience` |
| `control-{uuid}` | Human | *(nothing)* | all `mic-*` tracks |
| `mix-agent` | Agent | `monitor-1..N`, `monitor-audience` | all `mic-*` tracks |

Performer tokens are issued by the coordination server with subscription permissions scoped to their specific monitor track. A performer token for position 2 MUST NOT grant subscription rights to `mic-1`, `mic-2`, or any monitor other than `monitor-2`.

### 4.3 Mix Agent Design

The mix agent is a persistent Node.js service using the LiveKit Agents SDK. One agent instance runs per active room. It is responsible for all audio mixing.

**Core loop (per audio frame, ~10 ms)**:

```
for each monitor-N (N = 1..numPerformers):
  sources = all mic-* tracks WHERE position < N
  mixed_frame = sum(source_frames) / normalize(len(sources))
  publish mixed_frame → monitor-N

monitor-audience = sum(all mic-* frames) / normalize(numPerformers)
```

**Mix normalization**: Simple gain scaling (total gain = 1 / sqrt(N_sources)) to prevent clipping as performers join. No dynamic compression in Phase 1.

**Track subscription management**: The agent must react to `trackPublished` and `trackUnpublished` events to update its routing table in real time as performers join/leave.

**Monitor track naming convention**: `monitor-{position}` where position is 1-indexed integer matching the performer's chain position. Monitor 1 always contains silence (or click track if enabled). The audience monitor is `monitor-audience`.

<!-- ANSWER(Q6): Click track deferred — out of Phase 1 — 2026-04-29 -->

<!-- ANSWER(Q8): Max 8 performers for v1 — 2026-04-29 -->

### 4.4 Coordination Server API Surface

The coordination server is a thin Node.js/Express service backed by SQLite. It handles room lifecycle and token issuance; it does NOT process audio.

**Rooms**:

```
POST   /rooms                        Create room; returns roomId, joinCode
GET    /rooms/:roomId                Room state (performers, status)
DELETE /rooms/:roomId                Close room; trigger Egress stop; write manifest
```

**Performers**:

```
POST   /rooms/:roomId/join           Claim next performer slot; returns position, LiveKit token
DELETE /rooms/:roomId/performers/:n  Remove performer from slot (admin/self)
```

**Tokens**:

```
POST   /rooms/:roomId/tokens/audience   Issue audience token (subscribe-only, monitor-audience)
POST   /rooms/:roomId/tokens/control    Issue control token (subscribe-only, all mic-* tracks)
```

**Recordings**:

```
GET    /rooms/:roomId/recording         Recording manifest (JSON)
GET    /rooms/:roomId/recording/:stem   Download specific stem file
```

**Room State Schema (SQLite)**:

```sql
CREATE TABLE rooms (
  id          TEXT PRIMARY KEY,   -- UUID
  join_code   TEXT UNIQUE,        -- 6-char alphanumeric
  status      TEXT,               -- 'waiting' | 'live' | 'closed'
  created_at  INTEGER,
  closed_at   INTEGER
);

CREATE TABLE performers (
  room_id     TEXT REFERENCES rooms(id),
  position    INTEGER,            -- 1-indexed chain position
  identity    TEXT,               -- LiveKit participant identity
  display_name TEXT,
  joined_at   INTEGER,
  left_at     INTEGER,
  PRIMARY KEY (room_id, position)
);

CREATE TABLE stems (
  room_id     TEXT REFERENCES rooms(id),
  position    INTEGER,
  egress_id   TEXT,               -- LiveKit Egress job ID
  file_path   TEXT,               -- Server-side .opus file path
  started_at  INTEGER,
  stopped_at  INTEGER
);
```

<!-- ANSWER(Q2): Reuse existing LiveKit at vpsmikewolf.duckdns.org — 2026-04-29 -->

<!-- ANSWER(Q5): Control room assigns performer slots explicitly — 2026-04-29 -->

### 4.5 Frontend Route Structure

**Stack**: React 19 + Vite + TypeScript + `livekit-client` SDK. Three primary routes.

#### `/play/:roomId` — Performer View

State machine: `connecting → waiting → live → ended`

UI elements:
- Join form: display name input, "Join as Performer" button
- Position indicator: "You are Performer #3"
- Monitor: receives `monitor-N` track; plays to headphones only (never to speaker output in mixing setup)
- Mic status: armed/recording indicator
- Latency display: RTT from `getStats()` (informational)
- Leave button

Audio pipeline:
1. Request microphone via `getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } })`
2. Publish mic track to LiveKit room as `mic-N`
3. Subscribe to `monitor-N` track from mix-agent
4. Route monitor output to audio output device (never to mic input)

#### `/audience/:roomId` — Audience View

State machine: `connecting → listening → ended`

UI elements:
- Room name / performer list (display-name + position)
- Volume control for monitor-audience track
- Live performer count indicator
- "Mute/Unmute" local playback control only

No microphone access requested. Subscribe-only token.

#### `/control/:roomId` — Control Room View

State machine: `connecting → monitoring → ended`

UI elements:
- Per-stem level meter panel (one meter per performer position 1..N)
- Performer identity labels
- Per-stem individual volume controls (local gain, does not affect mix)
- Recording status indicator (Egress active/inactive per stem)
- Aggregate latency display (RTT per performer, from coordination server polling `getStats()`)

<!-- ANSWER(Q4): VPS from day one — latency is the product — 2026-04-29 -->

### 4.6 Data Flow: A Single Audio Frame

```
1. P2 speaks into microphone
2. Browser captures PCM via getUserMedia (48 kHz, 20 ms frames typical)
3. livekit-client SDK encodes to Opus, wraps in RTP
4. RTP → WebRTC DTLS-SRTP → SFU at vpsmikewolf.duckdns.org
5. SFU forwards mic-2 RTP to mix-agent's subscriber
6. Mix-agent decodes frame, adds to mix-1 buffer (P1 only)
7. Mix-agent encodes mix-1 buffer → Opus → publishes as monitor-1 track
8. SFU forwards monitor-1 to performer-1's subscription
9. livekit-client SDK in P1's browser decodes Opus, queues for playout
10. Browser audio subsystem plays frame to headphones

Total path steps involving audio processing: encode (step 3), decode+mix+encode (steps 5-7), decode (step 9)
Each codec round-trip adds ~5-10 ms; two round-trips = 10-20 ms codec overhead
```

<!-- ANSWER(Q3): New repo under mikewolf — hootnet-singalong — 2026-04-29 -->

---

## 5. Safety Invariants

These are hard constraints. Any implementation that violates them produces either a broken product (audio feedback) or loss of data (unrecoverable stems).

**SI-1 — No Self-Monitoring**: A performer's own mic track MUST NEVER appear in their monitor track. This is enforced at the mix-agent level: `monitor-N` MUST be computed from the set `{mic-1, ..., mic-(N-1)}` with `mic-N` explicitly excluded, even if N=1 (in which case monitor-1 is silence or click-only). Token-level subscription restrictions are a secondary defense, not a substitute.

**SI-2 — Stems Always Independent**: LiveKit Egress MUST be configured for per-participant recording, not composite (mixed) recording. If the Egress job is misconfigured to record the room composite, stem separation is lost permanently. The egress `type` MUST be `TRACK` or `PARTICIPANT`, never `ROOM_COMPOSITE`.

**SI-3 — Monitor Track Identity Immutable**: Once a performer is assigned position N and `monitor-N` is published by the mix-agent, the monitor track identity MUST NOT change during the session. Track identity changes mid-session would cause the client to lose its subscription. Position reassignment requires full session teardown and rejoin.

**SI-4 — Egress Started Before Mix Agent Publishes**: The coordination server MUST initiate Egress recording for each performer's mic track before the mix-agent begins publishing monitors. This prevents a race condition where the mix-agent connects, performers hear monitors, but recording hasn't started yet. The window of unrecorded audio MUST be < 1 second from performer join.

**SI-5 — Room Closed = Egress Stopped**: When a room transitions to `closed` status, the coordination server MUST stop all active Egress jobs before acknowledging the close. Unclosed Egress jobs can continue recording and consuming VPS disk indefinitely.

**SI-6 — Performer Token Scope**: LiveKit tokens issued to performers MUST include an explicit `subscribe` allowlist containing only their assigned `monitor-N` track. Performers MUST NOT be granted subscribe permission to other performers' mic tracks or monitors. This is a defense-in-depth measure (the mix-agent is the real gatekeeper, but token scoping prevents even accidental direct subscriptions).

**SI-7 — Audience Cannot Publish**: Audience tokens MUST be issued with `canPublish: false`. An audience member publishing audio would appear in the mix-agent's routing table as an unsorted participant, potentially corrupting the mix-minus calculation. The coordination server's `/tokens/audience` endpoint MUST hard-code `canPublish: false` regardless of request body.

---

## 6. Implementation Roadmap

### Phase 1 — LiveKit Foundation (Weeks 1–2)
*Goal: Two performers, correct mix-minus, stems captured. Prove the latency budget.*

#### Infrastructure
- ⬜ 2026-04-27 — Verify LiveKit server at vpsmikewolf.duckdns.org is healthy (check version, API key, TURN/STUN config)
- ⬜ 2026-04-27 — Confirm Egress plugin is installed and writable destination directory exists on VPS
- ⬜ 2026-04-27 — Scaffold monorepo layout: `packages/agent/`, `packages/server/`, `packages/client/`

#### Mix Agent (packages/agent)
- ⬜ 2026-04-27 — Initialize LiveKit Agent (Node.js) with room subscription loop
- ⬜ 2026-04-27 — Implement 2-performer mix-minus: mic-1 → monitor-2 passthrough; monitor-1 → silence
- ⬜ 2026-04-27 — Add `trackPublished` / `trackUnpublished` event handling for routing table updates
- ⬜ 2026-04-27 — Integration test: confirm monitor-2 audio is P1 only (log frame checksums, no self-audio)

#### Coordination Server (packages/server)
- ⬜ 2026-04-27 — Initialize Express + SQLite; apply schema migrations
- ⬜ 2026-04-27 — Implement `POST /rooms`, `POST /rooms/:id/join`
- ⬜ 2026-04-27 — Implement LiveKit token issuance with scoped permissions
- ⬜ 2026-04-27 — Implement Egress start on performer join (per-participant track recording)
- ⬜ 2026-04-27 — Implement `DELETE /rooms/:id` with Egress stop and manifest write

#### Frontend (packages/client)
- ⬜ 2026-04-27 — Scaffold Vite + React 19 + TypeScript + React Router
- ⬜ 2026-04-27 — Implement `/play/:roomId` route: join form, mic publish, monitor subscribe
- ⬜ 2026-04-27 — Wire `getUserMedia` with AGC/AEC/NS disabled
- ⬜ 2026-04-27 — Display RTT and playout delay from `getStats()`

#### Phase 1 Validation
- ⬜ 2026-04-27 — Clap test: measure mouth-to-ear latency P1→P2 (target < 200 ms)
- ⬜ 2026-04-27 — Confirm two .opus stem files written to VPS after 30-second session
- ⬜ 2026-04-27 — Confirm SI-1: no feedback loop when P2 mic is held to P2 speaker

---

### Phase 2 — N-Performer + Audience (Weeks 3–4)
*Goal: Full mix-minus chain for up to max performers; audience view functional.*

- ⬜ N/A — Generalize mix-agent routing table from 2-performer to N-performer
- ⬜ N/A — Implement `monitor-audience` track (full mix of all mic-* tracks)
- ⬜ N/A — Implement performer reconnect: slot reservation, identity reuse on rejoin
- ⬜ N/A — Implement `/audience/:roomId` route with subscribe-only token flow
- ⬜ N/A — Load test: 5 performers + 10 audience members; measure latency delta
- ⬜ N/A — Programmatic routing verification: assert monitor-N contains exactly tracks {1..N-1}

<!-- ANSWER(Q8): Max 8 performers for v1 — 2026-04-29 -->

---

### Phase 3 — Control Room + Recording Manifest (Weeks 5–6)
*Goal: Control room view, downloadable stems, complete recording manifest.*

- ⬜ N/A — Implement `/control/:roomId` route with per-stem level meters
- ⬜ N/A — Implement recording manifest JSON write on room close
- ⬜ N/A — Implement `GET /rooms/:id/recording` and `GET /rooms/:id/recording/:stem` endpoints
- ⬜ N/A — UI: recording status indicator per stem in control room view
- ⬜ N/A — Integration test: download all stems, verify file integrity (Opus header valid, duration matches session length ±2 s)

---

### Phase 4 — Sample-Accurate Alignment + Polish (Weeks 7–9)
*Goal: Stems usable in a DAW without manual alignment; production-hardened.*

- ⬜ N/A — Research RTP timestamp extraction from LiveKit Egress metadata
- ⬜ N/A — Implement alignment offset calculation using NTP-synchronized `captureTime` fields
- ⬜ N/A — Write alignment offsets to recording manifest
- ⬜ N/A — Optional: generate a reference alignment `.wav` (click track or detected transient) to aid DAW import
- ⬜ N/A — Harden coordination server: health checks, Egress watchdog, reconnect on agent crash
- ⬜ N/A — Browser compatibility testing: Chrome, Edge, Firefox, Safari (audio path only)
- ⬜ N/A — VPS hardening: reverse proxy (Caddy or Nginx), HTTPS for coordination server, firewall rules

---

## 7. Open Questions

Summary table for quick review. Each question also appears inline (as `<!-- QUESTION(QN): ... -->`) in the relevant section for context.

| ID | Section | Question | Impact if Deferred |
|----|---------|----------|--------------------|
| Q1 ✅ | §1 | **Keep as /practice solo mode** unless it adds cost/complexity | Resolved 2026-04-29 |
| Q2 ✅ | §4.4 | **Reuse existing LiveKit at vpsmikewolf.duckdns.org** | Resolved 2026-04-29 |
| Q3 ✅ | §4.6 | **New repo under mikewolf account** — name: hootnet-singalong | Resolved 2026-04-29 |
| Q4 ✅ | §4.5 | **VPS from day one** — latency is the product | Resolved 2026-04-29 |
| Q5 ✅ | §4.4 | **Control room assigns slots** — not join-order; UI in control room view | Resolved 2026-04-29 |
| Q6 ✅ | §4.3 | **Later** — out of Phase 1 scope | Resolved 2026-04-29 |
| Q7 ✅ | §2 | **Anonymous room code only** — no accounts | Resolved 2026-04-29 |
| Q8 ✅ | §4.3 | **8 performers max for v1** | Resolved 2026-04-29 |

**How to answer**: Edit this document inline, replacing the question with your answer below each `<!-- QUESTION -->` comment. Then we iterate to Pass 2.

---

## 8. References

[1] LiveKit Documentation — https://docs.livekit.io — Accessed 2026-04-27

[2] LiveKit Agents SDK (Node.js) — https://docs.livekit.io/agents/overview/ — Accessed 2026-04-27

[3] LiveKit Egress — Per-participant track recording — https://docs.livekit.io/egress/overview/ — Accessed 2026-04-27

[4] WebRTC `getStats()` API — RTT and playout delay measurement — https://www.w3.org/TR/webrtc-stats/ — Accessed 2026-04-27

[5] Chafe, C. et al. "Effect of Time Delay on Ensemble Latency Tolerance" — Stanford CCRMA, 2004 — https://ccrma.stanford.edu/~cc/pubs/ — Accessed 2026-04-27

[6] Jamulus — Open source ensemble music server — https://jamulus.io — Accessed 2026-04-27

[7] Hootnet Singalong legacy repo — `eldrgeek/eldr-hootnet-singalong` — GitHub (private)

[8] Prior architecture audit — `~/Projects/SOMA/audits/2026-04-27-singalong-resurrection.md` — Internal

[9] Opus Interactive Audio Codec — RFC 6716 — https://tools.ietf.org/html/rfc6716 — Accessed 2026-04-27

[10] LiveKit livekit-client SDK — https://github.com/livekit/client-sdk-js — Accessed 2026-04-27

---

*End of SPECIFICATION.md v0.1 — 2026-04-27*
*Next step: Mike reviews, answers QUESTION blocks inline, returns for Pass 2 iteration.*
