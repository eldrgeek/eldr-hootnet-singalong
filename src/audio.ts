// Audio engine: decode files to AudioBuffers, play multiple buffers in sync,
// record mic via MediaRecorder. Single shared AudioContext.

export type TrackKind = "reference" | "recording";

export interface Track {
  id: string;
  name: string;
  kind: TrackKind;
  buffer: AudioBuffer;
  blob: Blob; // original encoded data (for download / re-decode if needed)
  muted: boolean;
}

let ctx: AudioContext | null = null;
export function getCtx(): AudioContext {
  if (!ctx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    ctx = new Ctor();
  }
  return ctx;
}

export async function decode(blob: Blob): Promise<AudioBuffer> {
  const arr = await blob.arrayBuffer();
  // decodeAudioData mutates the buffer in some browsers; pass a copy.
  return getCtx().decodeAudioData(arr.slice(0));
}

export async function fileToTrack(
  file: File,
  kind: TrackKind = "reference"
): Promise<Track> {
  const buffer = await decode(file);
  return {
    id: crypto.randomUUID(),
    name: file.name,
    kind,
    buffer,
    blob: file,
    muted: false,
  };
}

export async function blobToTrack(
  blob: Blob,
  name: string,
  kind: TrackKind
): Promise<Track> {
  const buffer = await decode(blob);
  return {
    id: crypto.randomUUID(),
    name,
    kind,
    buffer,
    blob,
    muted: false,
  };
}

// ---- Multi-track playback ----

export interface PlaybackHandle {
  stop: () => void;
  duration: number;
  startedAt: number;
  startOffset: number;
}

export function playTracks(
  tracks: Track[],
  offset: number,
  onEnded: () => void
): PlaybackHandle {
  const c = getCtx();
  if (c.state === "suspended") void c.resume();

  const startTime = c.currentTime + 0.08; // small lead-in for tight sync
  const duration = Math.max(0, ...tracks.map((t) => t.buffer.duration));
  const sources: AudioBufferSourceNode[] = [];

  let endedFired = false;
  const fireEnded = () => {
    if (endedFired) return;
    endedFired = true;
    onEnded();
  };

  for (const t of tracks) {
    if (t.muted) continue;
    const src = c.createBufferSource();
    src.buffer = t.buffer;
    const g = c.createGain();
    g.gain.value = 1;
    src.connect(g).connect(c.destination);
    src.start(startTime, offset);
    sources.push(src);
  }

  // Schedule onEnded based on longest track.
  const remaining = Math.max(0, duration - offset);
  const timer = window.setTimeout(fireEnded, remaining * 1000 + 100);

  return {
    duration,
    startedAt: startTime,
    startOffset: offset,
    stop: () => {
      window.clearTimeout(timer);
      for (const s of sources) {
        try {
          s.stop();
        } catch {
          /* already stopped */
        }
      }
    },
  };
}

// ---- Mic capture + recording ----

export interface MicSession {
  stream: MediaStream;
  recorder: MediaRecorder;
  mimeType: string;
  chunks: Blob[];
}

export async function startMic(): Promise<MicSession> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false,
    },
  });
  const mimeType = pickMime();
  const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };
  return { stream, recorder, mimeType: mimeType || recorder.mimeType, chunks };
}

export function stopMic(session: MicSession): Promise<Blob> {
  return new Promise((resolve) => {
    session.recorder.onstop = () => {
      const type = session.mimeType || "audio/webm";
      resolve(new Blob(session.chunks, { type }));
      session.stream.getTracks().forEach((t) => t.stop());
    };
    if (session.recorder.state !== "inactive") session.recorder.stop();
    else
      resolve(
        new Blob(session.chunks, { type: session.mimeType || "audio/webm" })
      );
  });
}

function pickMime(): string {
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];
  for (const m of candidates) {
    if (MediaRecorder.isTypeSupported(m)) return m;
  }
  return "";
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
