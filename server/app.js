/**
 * app.js — Express app factory for the Singalong coordination server.
 *
 * Accepts injected dependencies so the app is fully unit-testable without
 * a real LiveKit instance or SQLite file.
 */
import express from 'express';
import cors from 'cors';
import { randomBytes } from 'crypto';

export const MAX_PERFORMERS = 8;

/**
 * @param {object} opts
 * @param {import('better-sqlite3').Database} opts.db
 * @param {function(string, string, object): Promise<string>} opts.makeToken
 * @param {{ createRoom: function, deleteRoom: function }} opts.roomService
 * @param {string}   [opts.livekitWsUrl]   - Browser-facing WebSocket URL
 * @param {object}   [opts.agentProcesses] - Shared map of roomId → ChildProcess
 * @param {function} [opts.spawnAgentFn]   - Called when first performer joins
 */
export function createApp({
  db,
  makeToken,
  roomService,
  livekitWsUrl = 'wss://localhost',
  agentProcesses = {},
  spawnAgentFn = () => {},
}) {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // ── Health ──────────────────────────────────────────────────────────────────
  app.get('/health', (_req, res) => {
    res.json({ ok: true });
  });

  // ── POST /rooms — create a new room ────────────────────────────────────────
  app.post('/rooms', async (req, res) => {
    try {
      const id = randomBytes(8).toString('hex');
      const join_code = randomBytes(3).toString('hex').toUpperCase();
      const created_at = Date.now();

      // createRoom pre-configures the LiveKit room (timeout, max participants).
      // LiveKit auto-creates rooms on first participant join, so this call is
      // best-effort — we continue even if LiveKit is temporarily unreachable.
      try {
        await roomService.createRoom({ name: id, emptyTimeout: 300, maxParticipants: 20 });
      } catch (livekitErr) {
        console.warn(`[server] LiveKit createRoom warning (non-fatal): ${livekitErr.message}`);
      }

      db.prepare('INSERT INTO rooms (id, join_code, status, created_at) VALUES (?,?,?,?)')
        .run(id, join_code, 'waiting', created_at);

      res.json({ roomId: id, joinCode: join_code, livekitUrl: livekitWsUrl });
    } catch (err) {
      console.error('POST /rooms error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // ── GET /rooms/code/:joinCode — look up room by human join code ─────────────
  // NOTE: This route MUST be defined before GET /rooms/:id to avoid Express
  // treating the literal segment "code" as a roomId.
  app.get('/rooms/code/:joinCode', (req, res) => {
    const room = db.prepare('SELECT * FROM rooms WHERE join_code=?')
      .get(req.params.joinCode.toUpperCase());
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json({ roomId: room.id, livekitUrl: livekitWsUrl });
  });

  // ── GET /rooms/:id/state — instrumentation endpoint for tests & monitoring ──
  app.get('/rooms/:id/state', (req, res) => {
    const room = db.prepare('SELECT * FROM rooms WHERE id=?').get(req.params.id);
    if (!room) return res.status(404).json({ error: 'Room not found' });

    const performers = db
      .prepare(
        'SELECT position, identity FROM performers WHERE room_id=? AND left_at IS NULL ORDER BY position'
      )
      .all(req.params.id)
      .map(p => ({ slot: p.position, peerId: p.identity }));

    const mixAgentConnected = !!agentProcesses[req.params.id];

    res.json({
      code: room.join_code,
      status: room.status,
      performers,
      // agentTracks reflects what the agent publishes; when it's running the
      // monitor-audience track is always present.  Per-performer monitor-N
      // tracks are created on demand as performers join.
      agentTracks: mixAgentConnected
        ? ['monitor-audience', ...performers.map(p => `monitor-${p.slot}`)]
        : [],
      mixAgentConnected,
    });
  });

  // ── GET /rooms/:id — room state ─────────────────────────────────────────────
  app.get('/rooms/:id', (req, res) => {
    const room = db.prepare('SELECT * FROM rooms WHERE id=?').get(req.params.id);
    if (!room) return res.status(404).json({ error: 'Room not found' });

    const performers = db
      .prepare(
        'SELECT position, identity, display_name, joined_at, left_at FROM performers WHERE room_id=? ORDER BY position'
      )
      .all(req.params.id);

    res.json({ ...room, performers, livekitUrl: livekitWsUrl });
  });

  // ── POST /rooms/:id/join — claim next performer slot ───────────────────────
  app.post('/rooms/:id/join', async (req, res) => {
    try {
      const { displayName = 'Performer' } = req.body;
      const roomId = req.params.id;

      const room = db.prepare('SELECT * FROM rooms WHERE id=?').get(roomId);
      if (!room) return res.status(404).json({ error: 'Room not found' });
      if (room.status === 'closed') return res.status(400).json({ error: 'Room is closed' });

      // Enforce performer cap
      const taken = db
        .prepare('SELECT position FROM performers WHERE room_id=? AND left_at IS NULL')
        .all(roomId);
      if (taken.length >= MAX_PERFORMERS) {
        return res.status(400).json({ error: 'Room is full' });
      }

      const takenPositions = new Set(taken.map(r => r.position));
      let position = 1;
      while (takenPositions.has(position)) position++;

      const identity = `performer-${position}`;
      const now = Date.now();

      db.prepare(`
        INSERT INTO performers (room_id, position, identity, display_name, joined_at)
        VALUES (?,?,?,?,?)
        ON CONFLICT(room_id, position) DO UPDATE SET
          identity=excluded.identity,
          display_name=excluded.display_name,
          joined_at=excluded.joined_at,
          left_at=NULL
      `).run(roomId, position, identity, displayName, now);

      if (room.status === 'waiting') {
        db.prepare('UPDATE rooms SET status=? WHERE id=?').run('live', roomId);
        spawnAgentFn(roomId);
      }

      const token = await makeToken(identity, roomId, { canPublish: true, canSubscribe: true });

      res.json({ position, identity, token, livekitUrl: livekitWsUrl, roomId });
    } catch (err) {
      console.error('POST /rooms/:id/join error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // ── DELETE /rooms/:id/performers/:position — performer leaves ───────────────
  app.delete('/rooms/:id/performers/:position', (req, res) => {
    db.prepare('UPDATE performers SET left_at=? WHERE room_id=? AND position=?')
      .run(Date.now(), req.params.id, parseInt(req.params.position));
    res.json({ ok: true });
  });

  // ── POST /rooms/:id/tokens/audience ────────────────────────────────────────
  app.post('/rooms/:id/tokens/audience', async (req, res) => {
    try {
      const room = db.prepare('SELECT * FROM rooms WHERE id=?').get(req.params.id);
      if (!room) return res.status(404).json({ error: 'Room not found' });
      const identity = `audience-${randomBytes(4).toString('hex')}`;
      const token = await makeToken(identity, req.params.id, { canPublish: false, canSubscribe: true });
      res.json({ token, identity, livekitUrl: livekitWsUrl });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── POST /rooms/:id/tokens/control ─────────────────────────────────────────
  app.post('/rooms/:id/tokens/control', async (req, res) => {
    try {
      const room = db.prepare('SELECT * FROM rooms WHERE id=?').get(req.params.id);
      if (!room) return res.status(404).json({ error: 'Room not found' });
      const identity = `control-${randomBytes(4).toString('hex')}`;
      const token = await makeToken(identity, req.params.id, { canPublish: false, canSubscribe: true });
      res.json({ token, identity, livekitUrl: livekitWsUrl });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── POST /rooms/:id/start-agent — manually trigger agent spawn ──────────────
  app.post('/rooms/:id/start-agent', (req, res) => {
    const room = db.prepare('SELECT * FROM rooms WHERE id=?').get(req.params.id);
    if (!room) return res.status(404).json({ error: 'Room not found' });
    spawnAgentFn(req.params.id);
    res.json({ ok: true });
  });

  // ── DELETE /rooms/:id — close room ─────────────────────────────────────────
  app.delete('/rooms/:id', async (req, res) => {
    try {
      db.prepare('UPDATE rooms SET status=?, closed_at=? WHERE id=?')
        .run('closed', Date.now(), req.params.id);
      try {
        await roomService.deleteRoom(req.params.id);
      } catch (_) { /* ignore if already gone */ }
      // Kill agent if running
      if (agentProcesses[req.params.id]) {
        agentProcesses[req.params.id].kill?.();
        delete agentProcesses[req.params.id];
      }
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return app;
}
