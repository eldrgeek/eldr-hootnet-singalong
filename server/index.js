// Singalong Coordination Server — Phase 1
import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';
import { randomBytes } from 'crypto';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const LIVEKIT_URL    = process.env.LIVEKIT_URL    || 'ws://localhost:7880';     // server-side: local
const LIVEKIT_WS_URL = process.env.LIVEKIT_WS_URL || 'wss://vpsmikewolf.duckdns.org'; // browser-side: TLS
const API_KEY        = process.env.LIVEKIT_API_KEY    || 'q8Hl5dKhf1Bg4j4h';
const API_SECRET     = process.env.LIVEKIT_API_SECRET || 'AFBcuVt7gG9rM75SE1HjETZxaPFhawaokOCWhp82lrgOdLhw';
const PORT           = process.env.PORT || 4000;

// ── Database ─────────────────────────────────────────────────────────────────
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

// ── Agent Process Management ──────────────────────────────────────────────────
import { spawn } from 'child_process';
const agentProcesses = {}; // roomId -> ChildProcess

function spawnAgent(roomId) {
  if (agentProcesses[roomId]) {
    console.log(`[server] Agent already running for room ${roomId}`);
    return;
  }
  const agentDir = join(__dirname, '..', 'agent');
  const env = {
    ...process.env,
    ROOM_NAME: roomId,
    LIVEKIT_URL: LIVEKIT_URL,
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

// ── Token Helpers ─────────────────────────────────────────────────────────────
function makeToken(identity, roomName, opts = {}) {
  const at = new AccessToken(API_KEY, API_SECRET, {
    identity,
    ttl: '6h',
  });
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

// ── Express App ───────────────────────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => res.json({ ok: true, livekit: LIVEKIT_URL }));

// POST /rooms — create a new room
app.post('/rooms', async (req, res) => {
  try {
    const id = randomBytes(8).toString('hex');
    const join_code = randomBytes(3).toString('hex').toUpperCase();
    const created_at = Date.now();

    // Create room in LiveKit
    await roomService.createRoom({ name: id, emptyTimeout: 300, maxParticipants: 20 });

    db.prepare(`INSERT INTO rooms (id, join_code, status, created_at) VALUES (?,?,?,?)`)
      .run(id, join_code, 'waiting', created_at);

    res.json({ roomId: id, joinCode: join_code, livekitUrl: LIVEKIT_WS_URL });
  } catch (err) {
    console.error('POST /rooms error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /rooms/:id — room state
app.get('/rooms/:id', (req, res) => {
  const room = db.prepare('SELECT * FROM rooms WHERE id=?').get(req.params.id);
  if (!room) return res.status(404).json({ error: 'Room not found' });

  const performers = db.prepare(
    'SELECT position, identity, display_name, joined_at, left_at FROM performers WHERE room_id=? ORDER BY position'
  ).all(req.params.id);

  res.json({ ...room, performers, livekitUrl: LIVEKIT_WS_URL });
});

// GET /rooms/code/:joinCode — look up room by join code
app.get('/rooms/code/:joinCode', (req, res) => {
  const room = db.prepare('SELECT * FROM rooms WHERE join_code=?').get(req.params.joinCode.toUpperCase());
  if (!room) return res.status(404).json({ error: 'Room not found' });
  res.json({ roomId: room.id, livekitUrl: LIVEKIT_WS_URL });
});

// POST /rooms/:id/join — performer joins, claims next slot
app.post('/rooms/:id/join', async (req, res) => {
  try {
    const { displayName = 'Performer' } = req.body;
    const roomId = req.params.id;

    const room = db.prepare('SELECT * FROM rooms WHERE id=?').get(roomId);
    if (!room) return res.status(404).json({ error: 'Room not found' });
    if (room.status === 'closed') return res.status(400).json({ error: 'Room is closed' });

    // Find next available position (1-indexed)
    const taken = db.prepare('SELECT position FROM performers WHERE room_id=? AND left_at IS NULL').all(roomId);
    const takenPositions = new Set(taken.map(r => r.position));
    let position = 1;
    while (takenPositions.has(position)) position++;

    const identity = `performer-${position}`;
    const now = Date.now();

    db.prepare(`
      INSERT INTO performers (room_id, position, identity, display_name, joined_at)
      VALUES (?,?,?,?,?)
      ON CONFLICT(room_id, position) DO UPDATE SET
        identity=excluded.identity, display_name=excluded.display_name,
        joined_at=excluded.joined_at, left_at=NULL
    `).run(roomId, position, identity, displayName, now);

    // Update room to live and spawn agent if first performer
    if (room.status === 'waiting') {
      db.prepare('UPDATE rooms SET status=? WHERE id=?').run('live', roomId);
      spawnAgent(roomId);
    }

    const token = await makeToken(identity, roomId, { canPublish: true, canSubscribe: true });

    res.json({
      position,
      identity,
      token,
      livekitUrl: LIVEKIT_WS_URL,
      roomId,
    });
  } catch (err) {
    console.error('POST /rooms/:id/join error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /rooms/:id/performers/:position — performer leaves
app.delete('/rooms/:id/performers/:position', (req, res) => {
  db.prepare('UPDATE performers SET left_at=? WHERE room_id=? AND position=?')
    .run(Date.now(), req.params.id, parseInt(req.params.position));
  res.json({ ok: true });
});

// POST /rooms/:id/tokens/audience
app.post('/rooms/:id/tokens/audience', async (req, res) => {
  try {
    const room = db.prepare('SELECT * FROM rooms WHERE id=?').get(req.params.id);
    if (!room) return res.status(404).json({ error: 'Room not found' });

    const identity = `audience-${randomBytes(4).toString('hex')}`;
    const token = await makeToken(identity, req.params.id, { canPublish: false, canSubscribe: true });
    res.json({ token, identity, livekitUrl: LIVEKIT_WS_URL });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /rooms/:id/tokens/control
app.post('/rooms/:id/tokens/control', async (req, res) => {
  try {
    const room = db.prepare('SELECT * FROM rooms WHERE id=?').get(req.params.id);
    if (!room) return res.status(404).json({ error: 'Room not found' });

    const identity = `control-${randomBytes(4).toString('hex')}`;
    const token = await makeToken(identity, req.params.id, { canPublish: false, canSubscribe: true });
    res.json({ token, identity, livekitUrl: LIVEKIT_WS_URL });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /rooms/:id/start-agent — manually start agent (from control room)
app.post('/rooms/:id/start-agent', (req, res) => {
  const room = db.prepare('SELECT * FROM rooms WHERE id=?').get(req.params.id);
  if (!room) return res.status(404).json({ error: 'Room not found' });
  spawnAgent(req.params.id);
  res.json({ ok: true });
});

// DELETE /rooms/:id — close room
app.delete('/rooms/:id', async (req, res) => {
  try {
    db.prepare('UPDATE rooms SET status=?, closed_at=? WHERE id=?')
      .run('closed', Date.now(), req.params.id);
    try {
      await roomService.deleteRoom(req.params.id);
    } catch (_) { /* ignore if already gone */ }
    // Kill agent if running
    if (agentProcesses[req.params.id]) {
      agentProcesses[req.params.id].kill();
      delete agentProcesses[req.params.id];
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Singalong server listening on :${PORT}`);
  console.log(`LiveKit URL: ${LIVEKIT_URL}`);
  console.log(`API Key: ${API_KEY}`);
});
