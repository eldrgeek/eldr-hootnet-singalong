/**
 * E2E: Server API smoke tests
 *
 * These tests hit the real coordination server (http://localhost:4000) without
 * opening a browser. They verify the full request/response cycle including the
 * real SQLite DB and real token generation — but LiveKit calls are best-effort
 * (the server silently continues if LiveKit is unreachable in dev).
 *
 * Prerequisites: `make dev-server` (starts server/index.js on :4000)
 */
import { test, expect } from '@playwright/test';
import { SERVER, apiCreateRoom, apiJoinRoom, apiRoomState, apiDeleteRoom } from './helpers';

// Skip this suite gracefully if the server isn't running
test.beforeAll(async () => {
  try {
    const res = await fetch(`${SERVER}/health`);
    if (!res.ok) throw new Error('unhealthy');
  } catch {
    test.skip(); // marks all tests in this file as skipped
  }
});

test('GET /health returns ok', async ({ request }) => {
  const res = await request.get(`${SERVER}/health`);
  expect(res.ok()).toBe(true);
  const body = await res.json();
  expect(body.ok).toBe(true);
});

test('creates a room and resolves it by code', async ({ request }) => {
  const { roomId, joinCode } = await apiCreateRoom();
  expect(roomId).toBeTruthy();
  expect(joinCode).toMatch(/^[0-9A-F]{6}$/);

  // Resolve by code
  const res = await request.get(`${SERVER}/rooms/code/${joinCode}`);
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.roomId).toBe(roomId);

  await apiDeleteRoom(roomId);
});

test('join endpoint assigns sequential performer slots', async () => {
  const { roomId } = await apiCreateRoom();

  const p1 = await apiJoinRoom(roomId, 'Alice');
  const p2 = await apiJoinRoom(roomId, 'Bob');

  expect(p1.position).toBe(1);
  expect(p1.identity).toBe('performer-1');
  expect(p2.position).toBe(2);
  expect(p2.identity).toBe('performer-2');
  expect(p1.token).toBeTruthy();
  expect(p2.token).toBeTruthy();

  await apiDeleteRoom(roomId);
});

test('state endpoint reflects active performers', async () => {
  const { roomId } = await apiCreateRoom();

  const state0 = await apiRoomState(roomId);
  expect(state0.performers).toHaveLength(0);
  expect(state0.status).toBe('waiting');

  await apiJoinRoom(roomId, 'Alice');
  await apiJoinRoom(roomId, 'Bob');

  const state2 = await apiRoomState(roomId);
  expect(state2.performers).toHaveLength(2);
  expect(state2.performers[0]).toMatchObject({ slot: 1, peerId: 'performer-1' });
  expect(state2.performers[1]).toMatchObject({ slot: 2, peerId: 'performer-2' });
  expect(state2.status).toBe('live');

  await apiDeleteRoom(roomId);
});

test('joining a full room returns 400', async ({ request }) => {
  const { roomId } = await apiCreateRoom();

  // Fill all 8 slots
  for (let i = 0; i < 8; i++) {
    await apiJoinRoom(roomId, `Performer ${i + 1}`);
  }

  const overflow = await request.post(`${SERVER}/rooms/${roomId}/join`, {
    data: { displayName: 'Overflow' },
  });
  expect(overflow.status()).toBe(400);
  const body = await overflow.json();
  expect(body.error).toMatch(/full/i);

  await apiDeleteRoom(roomId);
});

test('joining with invalid code returns 404', async ({ request }) => {
  const res = await request.get(`${SERVER}/rooms/code/ZZZZZZ`);
  expect(res.status()).toBe(404);
});

test('closing a room prevents new joins', async ({ request }) => {
  const { roomId } = await apiCreateRoom();
  await apiDeleteRoom(roomId);

  const res = await request.post(`${SERVER}/rooms/${roomId}/join`, {
    data: { displayName: 'Late' },
  });
  expect(res.status()).toBe(400);
  const body = await res.json();
  expect(body.error).toMatch(/closed/i);
});
