/**
 * Mix-minus routing unit tests
 *
 * Core invariant: performer at slot N hears slots 1..(N-1) only — never themselves.
 * Run: node --test server/test/mix-minus.test.js
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  getMixRecipients,
  buildMixMatrix,
  selfHearingFree,
} from '../mix-minus.js';

describe('getMixRecipients', () => {
  test('performer 1 feeds into no monitors when alone', () => {
    assert.deepEqual(getMixRecipients(1, [1]), []);
  });

  test('performer 1 feeds into monitor-2 only', () => {
    assert.deepEqual(getMixRecipients(1, [1, 2]), [2]);
  });

  test('performer 1 feeds into monitors 2,3,4', () => {
    assert.deepEqual(getMixRecipients(1, [1, 2, 3, 4]), [2, 3, 4]);
  });

  test('performer 2 feeds into monitors 3,4 but not 1 or 2', () => {
    assert.deepEqual(getMixRecipients(2, [1, 2, 3, 4]), [3, 4]);
  });

  test('performer 3 feeds into monitor-4 only', () => {
    assert.deepEqual(getMixRecipients(3, [1, 2, 3, 4]), [4]);
  });

  test('last performer (slot 4) feeds into no monitors', () => {
    assert.deepEqual(getMixRecipients(4, [1, 2, 3, 4]), []);
  });

  test('handles 8 performers (max room size)', () => {
    const positions = [1, 2, 3, 4, 5, 6, 7, 8];
    // Performer 1 feeds into monitors 2-8
    assert.deepEqual(getMixRecipients(1, positions), [2, 3, 4, 5, 6, 7, 8]);
    // Performer 7 feeds into monitor-8 only
    assert.deepEqual(getMixRecipients(7, positions), [8]);
    // Performer 8 feeds into nobody
    assert.deepEqual(getMixRecipients(8, positions), []);
  });

  test('handles non-contiguous positions (slot vacated and refilled)', () => {
    // positions 1, 3, 4 (slot 2 was vacated)
    assert.deepEqual(getMixRecipients(1, [1, 3, 4]), [3, 4]);
    assert.deepEqual(getMixRecipients(3, [1, 3, 4]), [4]);
    assert.deepEqual(getMixRecipients(4, [1, 3, 4]), []);
  });

  test('returns empty array for empty monitor list', () => {
    assert.deepEqual(getMixRecipients(1, []), []);
  });
});

describe('buildMixMatrix — full matrix correctness', () => {
  test('solo performer: empty matrix', () => {
    assert.deepEqual(buildMixMatrix([1]), { 1: [] });
  });

  test('2 performers: lead hears nothing, #2 hears #1', () => {
    assert.deepEqual(buildMixMatrix([1, 2]), {
      1: [],
      2: [1],
    });
  });

  test('4 performers: each hears all prior performers', () => {
    const matrix = buildMixMatrix([1, 2, 3, 4]);
    assert.deepEqual(matrix, {
      1: [],
      2: [1],
      3: [1, 2],
      4: [1, 2, 3],
    });
  });

  test('8 performers: performer 8 hears all 7 others', () => {
    const matrix = buildMixMatrix([1, 2, 3, 4, 5, 6, 7, 8]);
    assert.deepEqual(matrix[8], [1, 2, 3, 4, 5, 6, 7]);
    assert.deepEqual(matrix[1], []);
  });
});

describe('selfHearingFree — no performer hears themselves', () => {
  test('all positions pass the self-hearing check', () => {
    const positions = [1, 2, 3, 4, 5, 6, 7, 8];
    for (const pos of positions) {
      assert.equal(
        selfHearingFree(pos, positions),
        true,
        `Performer ${pos} must not hear themselves`
      );
    }
  });

  test('single performer is self-hearing-free', () => {
    assert.equal(selfHearingFree(1, [1]), true);
  });
});

describe('routing symmetry — audience always hears everyone', () => {
  // The audience monitor (implemented in the agent) receives ALL performer
  // frames regardless of position. We verify the inverse: getMixRecipients
  // correctly excludes the performer's own slot from the peer monitors.
  test('every performer feeds into strictly higher-numbered monitors', () => {
    const positions = [1, 2, 3, 4, 5, 6, 7, 8];
    for (const from of positions) {
      const recipients = getMixRecipients(from, positions);
      for (const r of recipients) {
        assert.ok(r > from, `monitor-${r} should only receive from slots < ${r}`);
      }
    }
  });

  test('monitor-1 is always empty (lead performer hears silence)', () => {
    const positions = [1, 2, 3, 4];
    // No performer's frame should land in monitor-1
    for (const from of positions) {
      const recipients = getMixRecipients(from, positions);
      assert.ok(!recipients.includes(1), `monitor-1 should never receive audio`);
    }
  });
});
