# Hootnet Singalong

Browser-based multi-track singalong / overdub recorder. Load a reference
track, record yourself over it, then layer the result by recording again
with everything playing back. No server, no install — runs entirely in the
browser via the Web Audio API and `MediaRecorder`.

## Try it

```sh
npm install
npm run dev
```

Then open the URL Vite prints. Allow microphone access when prompted.

## How it works

- **Tracks** are decoded into `AudioBuffer`s on import (or after recording).
- **Playback** spawns one `AudioBufferSourceNode` per unmuted track, started
  on a single `AudioContext.currentTime` lead-in so they line up tightly.
- **Recording** captures only the mic via `MediaRecorder` while the mix
  plays through the speakers/headphones. The new take becomes another
  track you can mute, rename, download, or layer on top of.

For tight monitoring, **use headphones** — otherwise your mic will pick up
the playback and you'll record both.

## Stack

- React 19 + TypeScript + Vite 8
- Web Audio API (decode + sample-accurate playback)
- MediaRecorder API (mic capture, Opus/WebM where available, MP4 on Safari)

## Status

MVP. Roadmap below.

### Roadmap

- Per-track volume + simple meters
- Punch-in / per-track recording offsets
- Visual waveforms (`OfflineAudioContext` peak extraction)
- Export mixed bounce as a single WAV/MP3
- Camera/video capture (the original concept included video takes)
- Shared sessions ("hootnet") via WebRTC or a tiny relay

## History

The original CodeSandbox prototype lives under [`legacy/`](./legacy/) for
reference. It was a React 16 + Overmind + Material-UI v4 + Firebase scaffold
that never reached a working recording loop. This rewrite throws that out
and starts over with a thin, modern audio engine.
