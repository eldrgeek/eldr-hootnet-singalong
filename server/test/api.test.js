/**
 * Singalong server API unit tests
 *
 * Uses node:test + supertest. LiveKit is fully mocked — no VPS needed.
 * SQLite runs in-memory (:memory:) so every test run starts clean.
 *
 * Run: node --test server/test/api.test.js
 */
import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import Database from 'better-sqlite3';
import { createApp, MAX_PERFORMERS } from '../app.js';

// ── Test helpers ──────────────────────────────────────────────────────────────

/** Fresh in-memory DB with the schema applied */
function makeTestDb() {
  const db = new Database(':memory:');
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
  return db;
}

/** Mock LiveKit roomService — resolves immediately, never throws */
function makeMockRoomService() {
  return {
    createRoom: async () => ({ name: 'mock' }),
    deleteRoom: async () => {},
  };
}

/** Mock token generator — returns a predictable fake JWT-shaped string */
async function mockMakeToken(identity, roomName) {
  return `fake.token.${identity}.${roomName}`;
}

/** Build a test app instance with a fresh in-memory DB */
function makeTestApp(overrides = {}) {
  const db = makeTestDb();
  const agentProcesses = {};
  const spawnedRooms = [];
  const app = createApp({
    db,
    makeToken: mockMakeToken,
    roomService: makeMockRoomService(),
    livekitWsUrl: 'wss://test.example.com',
    agentProcesses,
    spawnAgentFn: (roomId) => {
      spawnedRooms.push(roomId);
      agentProcesses[roomId] = { pid: 9999, kill: () => {} };
    },
    ...overrides,
  });
  return { app, db, agentProcesses, spawnedRooms };
}

// ── /health ───────────────────────────────────────────────────────────────────

describe('GET /health', () => {
  test('returns {ok: true}', async () => {
    const { app } = makeTestApp();
    const res = await request(app).get('/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.ok, true);
  });
});

// ── POST /rooms ───────────────────────────────────────────────────────────────

describe('POST /rooms', () => {
  test('creates a room and returns roomId + joinCode', async () => {
    const { app } = makeTestApp();
    const res = await request(app).post('/rooms');
    assert.equal(res.status, 200);
    assert.ok(res.body.roomId, 'should have roomId');
    assert.ok(res.body.joinCode, 'should have joinCode');
    assert.equal(res.body.livekitUrl, 'wss://test.example.com');
    // joinCode is 3 hex bytes → 6 uppercase chars
    assert.match(res.body.joinCode, /^[0-9A-F]{6}$/);
  });

  test('each call produces a unique roomId and joinCode', async () => {
    const { app } = makeTestApp();
    const [r1, r2] = await Promise.all([
      request(app).post('/rooms'),
      request(app).post('/rooms'),
    ]);
    assert.notEqual(r1.body.roomId, r2.body.roomId);
    assert.notEqual(r1.body.joinCode, r2.body.joinCode);
  });

  test('room persists in the database', async () => {
    const { app, db } = makeTestApp();
    const res = await request(app).post('/rooms');
    const row = db.prepare('SELECT * FROM rooms WHERE id=?').get(res.body.roomId);
    assert.ok(row, 'room should be in DB');
    assert.equal(row.join_code, res.body.joinCode);
    assert.equal(row.status, 'waiting');
  });

  test('succeeds even when LiveKit createRoom fails (best-effort)', async () => {
    // LiveKit auto-creates rooms on first participant join, so a transient
    // createRoom failure is non-fatal — the room is still created in the DB.
    const { app } = makeTestApp({
      roomService: {
        createRoom: async () => { throw new Error('LiveKit unavailable'); },
        deleteRoom: async () => {},
      },
    });
    const res = await request(app).post('/rooms');
    assert.equal(res.status, 200);
    assert.ok(res.body.roomId, 'should return roomId despite LiveKit being down');
    assert.ok(res.body.joinCode);
  });
});

// ── GET /rooms/:id ────────────────────────────────────────────────────────────

describe('GET /rooms/:id', () => {
  test('returns room metadata with empty performers list', async () => {
    const { app } = makeTestApp();
    const created = await request(app).post('/rooms');
    const { roomId } = created.body;

    const res = await request(app).get(`/rooms/${roomId}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.id, roomId);
    assert.deepEqual(res.body.performers, []);
    assert.equal(res.body.status, 'waiting');
  });

  test('returns 404 for unknown roomId', async () => {
    const { app } = makeTestApp();
    const res = await request(app).get('/rooms/doesnotexist');
    assert.equal(res.status, 404);
    assert.ok(res.body.error);
  });
});

// ── GET /rooms/code/:joinCode ─────────────────────────────────────────────────

describe('GET /rooms/code/:joinCode', () => {
  test('resolves roomId from join code', async () => {
    const { app } = makeTestApp();
    const created = await request(app).post('/rooms');
    const { roomId, joinCode } = created.body;

    const res = await request(app).get(`/rooms/code/${joinCode}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.roomId, roomId);
  });

  test('is case-insensitive', async () => {
    const { app } = makeTestApp();
    const created = await request(app).post('/rooms');
    const { joinCode } = created.body;

    const res = await request(app).get(`/rooms/code/${joinCode.toLowerCase()}`);
    assert.equal(res.status, 200);
    assert.ok(res.body.roomId);
  });

  test('returns 404 for invalid code', async () => {
    const { app } = makeTestApp();
    const res = await request(app).get('/rooms/code/ZZZZZZ');
    assert.equal(res.status, 404);
  });
});

// ── POST /rooms/:id/join ──────────────────────────────────────────────────────

describe('POST /rooms/:id/join', () => {
  test('first performer gets slot 1 and a token', async () => {
    const { app } = makeTestApp();
    const { body: { roomId } } = await request(app).post('/rooms');

    const res = await request(app)
      .post(`/rooms/${roomId}/join`)
      .send({ displayName: 'Alice' });

    assert.equal(res.status, 200);
    assert.equal(res.body.position, 1);
    assert.equal(res.body.identity, 'performer-1');
    assert.ok(res.body.token, 'should return token');
    assert.equal(res.body.roomId, roomId);
  });

  test('second performer gets slot 2', async () => {
    const { app } = makeTestApp();
    const { body: { roomId } } = await request(app).post('/rooms');

    await request(app).post(`/rooms/${roomId}/join`).send({ displayName: 'Alice' });
    const res = await request(app).post(`/rooms/${roomId}/join`).send({ displayName: 'Bob' });

    assert.equal(res.status, 200);
    assert.equal(res.body.position, 2);
  });

  test('room transitions to "live" on first join and agent is spawned', async () => {
    const { app, db, spawnedRooms } = makeTestApp();
    const { body: { roomId } } = await request(app).post('/rooms');

    await request(app).post(`/rooms/${roomId}/join`).send({});

    const row = db.prepare('SELECT status FROM rooms WHERE id=?').get(roomId);
    assert.equal(row.status, 'live');
    assert.ok(spawnedRooms.includes(roomId), 'agent should be spawned');
  });

  test('agent is spawned only once for multiple joins', async () => {
    const { app, spawnedRooms } = makeTestApp();
    const { body: { roomId } } = await request(app).post('/rooms');

    await request(app).post(`/rooms/${roomId}/join`).send({});
    await request(app).post(`/rooms/${roomId}/join`).send({});

    assert.equal(spawnedRooms.filter(r => r === roomId).length, 1);
  });

  test('returns 404 when joining nonexistent room', async () => {
    const { app } = makeTestApp();
    const res = await request(app).post('/rooms/badroom/join').send({});
    assert.equal(res.status, 404);
  });

  test('returns 400 when joining a closed room', async () => {
    const { app } = makeTestApp();
    const { body: { roomId } } = await request(app).post('/rooms');
    await request(app).delete(`/rooms/${roomId}`);

    const res = await request(app).post(`/rooms/${roomId}/join`).send({});
    assert.equal(res.status, 400);
    assert.match(res.body.error, /closed/i);
  });

  test(`returns 400 when room is full (${MAX_PERFORMERS} performers)`, async () => {
    const { app } = makeTestApp();
    const { body: { roomId } } = await request(app).post('/rooms');

    // Fill the room
    for (let i = 0; i < MAX_PERFORMERS; i++) {
      const r = await request(app).post(`/rooms/${roomId}/join`).send({ displayName: `P${i}` });
      assert.equal(r.status, 200, `join #${i+1} should succeed`);
    }

    // One too many
    const overflow = await request(app).post(`/rooms/${roomId}/join`).send({ displayName: 'Overflow' });
    assert.equal(overflow.status, 400);
    assert.match(overflow.body.error, /full/i);
  });

  test('slot is reused after a performer leaves', async () => {
    const { app } = makeTestApp();
    const { body: { roomId } } = await request(app).post('/rooms');

    await request(app).post(`/rooms/${roomId}/join`).send({ displayName: 'Alice' }); // slot 1
    await request(app).post(`/rooms/${roomId}/join`).send({ displayName: 'Bob' });   // slot 2

    // Alice leaves
    await request(app).delete(`/rooms/${roomId}/performers/1`);

    // New joiner should reclaim slot 1
    const res = await request(app).post(`/rooms/${roomId}/join`).send({ displayName: 'Charlie' });
    assert.equal(res.status, 200);
    assert.equal(res.body.position, 1);
  });

  test('token encodes performer identity', async () => {
    const { app } = makeTestApp();
    const { body: { roomId } } = await request(app).post('/rooms');
    const res = await request(app).post(`/rooms/${roomId}/join`).send({});

    // Our mock token is "fake.token.<identity>.<roomId>"
    assert.ok(res.body.token.includes('performer-1'));
    assert.ok(res.body.token.includes(roomId));
  });
});

// ── GET /rooms/:id/state (instrumentation) ────────────────────────────────────

describe('GET /rooms/:id/state', () => {
  test('returns empty performers before anyone joins', async () => {
    const { app } = makeTestApp();
    const { body: { roomId } } = await request(app).post('/rooms');
    const res = await request(app).get(`/rooms/${roomId}/state`);

    assert.equal(res.status, 200);
    assert.deepEqual(res.body.performers, []);
    assert.equal(res.body.mixAgentConnected, false);
    assert.deepEqual(res.body.agentTracks, []);
  });

  test('reflects joined performers', async () => {
    const { app } = makeTestApp();
    const { body: { roomId } } = await request(app).post('/rooms');

    await request(app).post(`/rooms/${roomId}/join`).send({ displayName: 'Alice' });
    await request(app).post(`/rooms/${roomId}/join`).send({ displayName: 'Bob' });

    const res = await request(app).get(`/rooms/${roomId}/state`);
    assert.equal(res.status, 200);
    assert.equal(res.body.performers.length, 2);
    assert.deepEqual(res.body.performers, [
      { slot: 1, peerId: 'performer-1' },
      { slot: 2, peerId: 'performer-2' },
    ]);
  });

  test('mixAgentConnected is true after first join (agent is spawned)', async () => {
    const { app } = makeTestApp();
    const { body: { roomId } } = await request(app).post('/rooms');

    await request(app).post(`/rooms/${roomId}/join`).send({});

    const res = await request(app).get(`/rooms/${roomId}/state`);
    assert.equal(res.body.mixAgentConnected, true);
    assert.ok(res.body.agentTracks.includes('monitor-audience'));
    assert.ok(res.body.agentTracks.includes('monitor-1'));
  });

  test('performer disappears from state after leaving', async () => {
    const { app } = makeTestApp();
    const { body: { roomId } } = await request(app).post('/rooms');

    await request(app).post(`/rooms/${roomId}/join`).send({ displayName: 'Alice' }); // slot 1
    await request(app).post(`/rooms/${roomId}/join`).send({ displayName: 'Bob' });   // slot 2
    await request(app).delete(`/rooms/${roomId}/performers/1`);

    const res = await request(app).get(`/rooms/${roomId}/state`);
    assert.equal(res.body.performers.length, 1);
    assert.equal(res.body.performers[0].slot, 2);
  });

  test('returns 404 for unknown room', async () => {
    const { app } = makeTestApp();
    const res = await request(app).get('/rooms/nope/state');
    assert.equal(res.status, 404);
  });

  test('includes join code in response', async () => {
    const { app } = makeTestApp();
    const { body: { roomId, joinCode } } = await request(app).post('/rooms');
    const res = await request(app).get(`/rooms/${roomId}/state`);
    assert.equal(res.body.code, joinCode);
  });
});

// ── DELETE /rooms/:id ─────────────────────────────────────────────────────────

describe('DELETE /rooms/:id', () => {
  test('marks room as closed', async () => {
    const { app, db } = makeTestApp();
    const { body: { roomId } } = await request(app).post('/rooms');

    const res = await request(app).delete(`/rooms/${roomId}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.ok, true);

    const row = db.prepare('SELECT status FROM rooms WHERE id=?').get(roomId);
    assert.equal(row.status, 'closed');
  });

  test('kills agent process if running', async () => {
    const { app, agentProcesses } = makeTestApp();
    const { body: { roomId } } = await request(app).post('/rooms');

    // Join to spawn agent
    await request(app).post(`/rooms/${roomId}/join`).send({});
    assert.ok(agentProcesses[roomId], 'agent should be in map');

    await request(app).delete(`/rooms/${roomId}`);
    assert.equal(agentProcesses[roomId], undefined, 'agent should be removed from map');
  });
});

// ── Token endpoints ───────────────────────────────────────────────────────────

describe('POST /rooms/:id/tokens/audience', () => {
  test('returns token and identity for valid room', async () => {
    const { app } = makeTestApp();
    const { body: { roomId } } = await request(app).post('/rooms');
    const res = await request(app).post(`/rooms/${roomId}/tokens/audience`);

    assert.equal(res.status, 200);
    assert.ok(res.body.token);
    assert.match(res.body.identity, /^audience-/);
  });

  test('returns 404 for unknown room', async () => {
    const { app } = makeTestApp();
    const res = await request(app).post('/rooms/unknown/tokens/audience');
    assert.equal(res.status, 404);
  });
});

describe('POST /rooms/:id/tokens/control', () => {
  test('returns token and identity for valid room', async () => {
    const { app } = makeTestApp();
    const { body: { roomId } } = await request(app).post('/rooms');
    const res = await request(app).post(`/rooms/${roomId}/tokens/control`);

    assert.equal(res.status, 200);
    assert.ok(res.body.token);
    assert.match(res.body.identity, /^control-/);
  });
});

// ── DELETE /rooms/:id/performers/:position ────────────────────────────────────

describe('DELETE /rooms/:id/performers/:position', () => {
  test('marks performer as left', async () => {
    const { app, db } = makeTestApp();
    const { body: { roomId } } = await request(app).post('/rooms');
    await request(app).post(`/rooms/${roomId}/join`).send({});

    const res = await request(app).delete(`/rooms/${roomId}/performers/1`);
    assert.equal(res.status, 200);
    assert.equal(res.body.ok, true);

    const row = db.prepare('SELECT left_at FROM performers WHERE room_id=? AND position=1').get(roomId);
    assert.ok(row.left_at, 'left_at should be set');
  });
});
