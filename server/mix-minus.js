/**
 * mix-minus.js — Pure mix-minus routing logic (no LiveKit deps, fully testable)
 *
 * Core invariant:
 *   Performer at slot N should only hear performers at slots 1..(N-1).
 *   They must never hear themselves.
 *   Performer #1 (the lead) hears silence.
 *
 * These functions are the authoritative implementation of that invariant.
 * The agent (agent/index.js) implements the same logic imperatively; this
 * module exists so unit tests can verify correctness without WebRTC deps.
 */

/**
 * Given a frame arriving from performer `fromPosition`, return the list
 * of monitor positions that should receive it.
 *
 * A monitor-N track carries the mix for performer N:
 *   - monitor-N receives audio from any performer whose position < N
 *   - i.e., fromPosition is in the mix for N iff fromPosition < N
 *
 * @param {number}   fromPosition     - 1-indexed slot of the sending performer
 * @param {number[]} monitorPositions - Active monitor positions in the room
 * @returns {number[]} Monitor positions that receive this frame
 */
export function getMixRecipients(fromPosition, monitorPositions) {
  return monitorPositions.filter(pos => fromPosition < pos);
}

/**
 * Build the complete mix matrix for a set of performer positions.
 * Returns a map: monitorPosition → [performerPositions that feed into it].
 *
 * Example with 4 performers:
 *   { 1: [], 2: [1], 3: [1,2], 4: [1,2,3] }
 *
 * @param {number[]} positions - All active performer positions
 * @returns {Record<number, number[]>}
 */
export function buildMixMatrix(positions) {
  const matrix = {};
  for (const monPos of positions) {
    matrix[monPos] = positions.filter(p => p < monPos);
  }
  return matrix;
}

/**
 * Verify the invariant: performer N never hears themselves.
 *
 * @param {number}   position         - Performer position to check
 * @param {number[]} monitorPositions - Active monitor positions
 * @returns {boolean} true if invariant holds
 */
export function selfHearingFree(position, monitorPositions) {
  const recipients = getMixRecipients(position, monitorPositions);
  return !recipients.includes(position);
}
