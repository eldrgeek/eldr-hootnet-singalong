// Singalong Coordination Server — Phase 1
import Database from 'better-sqlite3';
import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createApp } from './app.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const LIVEKIT_URL    = process.env.LIVEKIT_URL    || 'ws://localhost:7880';
const LIVEKIT_WS_URL = process.env.LIVEKIT_WS_URL || 'wss://vpsmikewolf.duckdns.org';
const API_KEY        = process.env.LIVEKIT_API_KEY    || 'q8Hl5dKhf1Bg4j4h';
const API_SECRET     = process.env.LIVEKIT_API_SECRET || 'AFBcuVt7gG9rM75SE1HjETZxaPFhawaokOCWhp82lrgOdLhw';
const PORT           = process.env.PORT || 4000;

// ── Database ──────────────────────────────────────────────────────────────────
const db = new Database(join(__dirname, 'singalong.db'));
db.exec(`
  CREATE TABLE IF NOT EXISTS rooms (
    id          TEXT PRIMARY KEY,
    join_code   TEXT UNIQUE,
    status      TEXT DEFAULT 'waiting',
    created_at  INTEGER,
    closed_at   INTEGER
  );
  CREATE TABLE IF NOT EXISTS performers (
    room_id      TEXT REFERENCES rooms(id),
    position     INTEGER,
    identity     TEXT,
    display_name TEXT,
    joined_at    INTEGER,
    left_at      INTEGER,
    PRIMARY KEY (room_id, position)
  );
`);

// ── LiveKit Room Service ──────────────────────────────────────────────────────
const roomService = new RoomServiceClient(LIVEKIT_URL, API_KEY, API_SECRET);

// ── Token Helper ──────────────────────────────────────────────────────────────
function makeToken(identity, roomName, opts = {}) {
  const at = new AccessToken(API_KEY, API_SECRET, { identity, ttl: '6h' });
  at.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: opts.canPublish ?? false,
    canSubscribe: opts.canSubscribe ?? true,
    canPublishData: true,
    hidden: opts.hidden ?? false,
  });
  return at.toJwt();
}

// ── Agent Process Management ──────────────────────────────────────────────────
const agentProcesses = {};

function spawnAgent(roomId) {
  if (agentProcesses[roomId]) {
    console.log(`[server] Agent already running for room ${roomId}`);
    return;
  }
  const agentDir = join(__dirname, '..', 'agent');
  const env = {
    ...process.env,
    ROOM_NAME: roomId,
    LIVEKIT_URL,
    LIVEKIT_API_KEY: API_KEY,
    LIVEKIT_API_SECRET: API_SECRET,
  };
  const proc = spawn('node', ['index.js', roomId], {
    cwd: agentDir,
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: false,
  });
  proc.stdout.on('data', d => process.stdout.write(`[agent:${roomId.slice(0,8)}] ${d}`));
  proc.stderr.on('data', d => process.stderr.write(`[agent:${roomId.slice(0,8)}] ${d}`));
  proc.on('exit', (code) => {
    console.log(`[server] Agent for ${roomId} exited with code ${code}`);
    delete agentProcesses[roomId];
  });
  agentProcesses[roomId] = proc;
  console.log(`[server] Spawned agent for room ${roomId} (pid ${proc.pid})`);
}

// ── Start ─────────────────────────────────────────────────────────────────────
const app = createApp({
  db,
  makeToken,
  roomService,
  livekitWsUrl: LIVEKIT_WS_URL,
  agentProcesses,
  spawnAgentFn: spawnAgent,
});

app.listen(PORT, () => {
  console.log(`Singalong server listening on :${PORT}`);
  console.log(`LiveKit URL: ${LIVEKIT_URL}`);
  console.log(`API Key: ${API_KEY}`);
});
