/**
 * E2E test helpers — thin wrappers around the coordination API so tests
 * stay readable and don't repeat fetch boilerplate.
 */

export const SERVER = 'http://localhost:4000';

/** Create a room via the API and return { roomId, joinCode } */
export async function apiCreateRoom(): Promise<{ roomId: string; joinCode: string }> {
  const res = await fetch(`${SERVER}/rooms`, { method: 'POST' });
  if (!res.ok) throw new Error(`POST /rooms failed: ${res.status}`);
  return res.json();
}

/** Join a room as a performer and return the full response */
export async function apiJoinRoom(
  roomId: string,
  displayName = 'Tester'
): Promise<{ position: number; identity: string; token: string; roomId: string }> {
  const res = await fetch(`${SERVER}/rooms/${roomId}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ displayName }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(`POST /rooms/${roomId}/join failed: ${res.status} — ${body.error ?? ''}`);
  }
  return res.json();
}

/** Fetch the instrumentation state for a room */
export async function apiRoomState(roomId: string): Promise<{
  code: string;
  status: string;
  performers: Array<{ slot: number; peerId: string }>;
  agentTracks: string[];
  mixAgentConnected: boolean;
}> {
  const res = await fetch(`${SERVER}/rooms/${roomId}/state`);
  if (!res.ok) throw new Error(`GET /rooms/${roomId}/state failed: ${res.status}`);
  return res.json();
}

/** Close a room */
export async function apiDeleteRoom(roomId: string): Promise<void> {
  await fetch(`${SERVER}/rooms/${roomId}`, { method: 'DELETE' });
}
