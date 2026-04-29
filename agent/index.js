// Singalong Mix-Minus Agent — Phase 1
// Subscribes to all mic-* tracks, publishes monitor-N (mix-minus) + monitor-audience
import {
  Room,
  RoomEvent,
  TrackKind,
  TrackSource,
  TrackPublishOptions,
  AudioSource,
  AudioFrame,
  LocalAudioTrack,
  AudioStream,
} from '@livekit/rtc-node';
import { AccessToken } from 'livekit-server-sdk';

const LIVEKIT_URL  = process.env.LIVEKIT_URL    || 'ws://localhost:7880'; // on VPS: local
const API_KEY      = process.env.LIVEKIT_API_KEY    || 'q8Hl5dKhf1Bg4j4h';
const API_SECRET   = process.env.LIVEKIT_API_SECRET || 'AFBcuVt7gG9rM75SE1HjETZxaPFhawaokOCWhp82lrgOdLhw';
const ROOM_NAME    = process.env.ROOM_NAME || process.argv[2];
const AGENT_ID     = 'mix-agent';

const SAMPLE_RATE    = 48000;
const CHANNELS       = 1;
const FRAME_SAMPLES  = 480; // 10 ms @ 48 kHz

if (!ROOM_NAME) {
  console.error('Usage: ROOM_NAME=<roomId> node index.js  OR  node index.js <roomId>');
  process.exit(1);
}

// ── Token ─────────────────────────────────────────────────────────────────────
async function makeAgentToken() {
  const at = new AccessToken(API_KEY, API_SECRET, {
    identity: AGENT_ID,
    ttl: '24h',
  });
  at.addGrant({
    room: ROOM_NAME,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
    hidden: true,
  });
  return at.toJwt();
}

// ── Mix State ─────────────────────────────────────────────────────────────────
// monitorSources[position] = AudioSource for that monitor track
const monitorSources = {};   // { [position: number]: AudioSource }
const audienceSource = new AudioSource(SAMPLE_RATE, CHANNELS);

// Silent frame for monitor-1 (lead performer hears nothing)
const SILENT_FRAME_DATA = new Int16Array(FRAME_SAMPLES); // all zeros
function makeSilentFrame() {
  return new AudioFrame(SILENT_FRAME_DATA, SAMPLE_RATE, CHANNELS, FRAME_SAMPLES);
}

// ── Publish helper ────────────────────────────────────────────────────────────
async function publishMonitorTrack(room, name, source) {
  const track = LocalAudioTrack.createAudioTrack(name, source);
  const opts = new TrackPublishOptions({ source: TrackSource.SOURCE_MICROPHONE });
  await room.localParticipant.publishTrack(track, opts);
  console.log(`[agent] Published track: ${name}`);
  return track;
}

// ── Ensure monitor-N exists ───────────────────────────────────────────────────
async function ensureMonitorTrack(room, position) {
  if (monitorSources[position]) return;

  const source = new AudioSource(SAMPLE_RATE, CHANNELS);
  monitorSources[position] = source;
  await publishMonitorTrack(room, `monitor-${position}`, source);

  // Position 1 = lead: always silence (no prior performers)
  if (position === 1) {
    const silenceLoop = async () => {
      while (monitorSources[position]) {
        try {
          await source.captureFrame(makeSilentFrame());
        } catch (_) {}
      }
    };
    silenceLoop().catch(() => {});
  }
}

// ── Route a received audio frame to the right monitor outputs ─────────────────
async function routeFrame(fromPosition, frame) {
  const promises = [];

  // monitor-N receives this frame if fromPosition < N
  for (const [posStr, src] of Object.entries(monitorSources)) {
    const monPos = parseInt(posStr);
    if (fromPosition < monPos) {
      promises.push(src.captureFrame(frame).catch(() => {}));
    }
  }

  // Audience monitor always gets all performer audio
  promises.push(audienceSource.captureFrame(frame).catch(() => {}));

  await Promise.all(promises);
}

// ── Handle a newly subscribed mic track ──────────────────────────────────────
async function handleMicTrack(room, track, publication, participant) {
  const trackName = publication.name;
  if (!trackName?.startsWith('mic-')) return;

  const position = parseInt(trackName.split('-')[1]);
  if (isNaN(position) || position < 1) return;

  console.log(`[agent] Subscribing to ${trackName} from ${participant.identity} (pos ${position})`);

  // Make sure this performer's monitor track exists
  await ensureMonitorTrack(room, position);

  // Stream frames from this mic and route them
  const audioStream = new AudioStream(track, SAMPLE_RATE, CHANNELS);
  try {
    for await (const frame of audioStream) {
      await routeFrame(position, frame);
    }
  } catch (err) {
    console.log(`[agent] AudioStream for ${trackName} ended: ${err?.message || err}`);
  }
  console.log(`[agent] Stream ended for ${trackName}`);
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const token = await makeAgentToken();
  const room = new Room();

  room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
    if (track.kind !== TrackKind.KIND_AUDIO) return;
    handleMicTrack(room, track, publication, participant).catch(err =>
      console.error('[agent] handleMicTrack error:', err)
    );
  });

  room.on(RoomEvent.TrackUnsubscribed, (_track, publication, participant) => {
    console.log(`[agent] Unsubscribed: ${publication.name} from ${participant.identity}`);
  });

  room.on(RoomEvent.ParticipantConnected, (p) => {
    console.log(`[agent] Participant joined: ${p.identity}`);
  });

  room.on(RoomEvent.ParticipantDisconnected, (p) => {
    console.log(`[agent] Participant left: ${p.identity}`);
  });

  room.on(RoomEvent.Disconnected, () => {
    console.log('[agent] Disconnected. Exiting.');
    // Clean up sources
    for (const k of Object.keys(monitorSources)) delete monitorSources[k];
    process.exit(0);
  });

  console.log(`[agent] Connecting to ${LIVEKIT_URL} room=${ROOM_NAME}`);
  await room.connect(LIVEKIT_URL, token, { autoSubscribe: true });
  console.log(`[agent] Connected. Participants: ${room.remoteParticipants.size}`);

  // Publish audience monitor track
  await publishMonitorTrack(room, 'monitor-audience', audienceSource);

  // Handle any mic tracks already in the room
  for (const [, participant] of room.remoteParticipants) {
    for (const [, publication] of participant.trackPublications) {
      if (publication.name?.startsWith('mic-') && publication.track) {
        handleMicTrack(room, publication.track, publication, participant).catch(console.error);
      }
    }
  }

  console.log('[agent] Ready — waiting for performers.');
}

main().catch(err => {
  console.error('[agent] Fatal:', err);
  process.exit(1);
});
