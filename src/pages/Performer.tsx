import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Room,
  RoomEvent,
  Track,
  createLocalAudioTrack,
  ConnectionState,
} from 'livekit-client'
import { SERVER_URL } from '../config'

type Phase = 'setup' | 'joining' | 'live' | 'error' | 'ended'

export default function Performer() {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()

  const [phase, setPhase] = useState<Phase>('setup')
  const [displayName, setDisplayName] = useState('Performer')
  const [position, setPosition] = useState<number | null>(null)
  const [connState, setConnState] = useState<string>('disconnected')
  const [monitorState, setMonitorState] = useState<'waiting' | 'active'>('waiting')
  const [rtt, setRtt] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [roomCode, setRoomCode] = useState('')

  const roomRef = useRef<Room | null>(null)
  const rttIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    // Fetch room info to get join code
    fetch(`${SERVER_URL}/rooms/${roomId}`)
      .then(r => r.json())
      .then(d => { if (d.join_code) setRoomCode(d.join_code) })
      .catch(() => {})

    return () => cleanup()
  }, [roomId])

  function cleanup() {
    if (rttIntervalRef.current) clearInterval(rttIntervalRef.current)
    roomRef.current?.disconnect()
    roomRef.current = null
  }

  async function join() {
    setPhase('joining')
    setError('')
    try {
      // Get token from server
      const res = await fetch(`${SERVER_URL}/rooms/${roomId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Join failed')

      const { token, livekitUrl, position: pos } = data
      setPosition(pos)

      // Build room
      const room = new Room({
        adaptiveStream: false,
        dynacast: false,
        audioCaptureDefaults: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      })
      roomRef.current = room

      room.on(RoomEvent.ConnectionStateChanged, (state: ConnectionState) => {
        setConnState(state)
      })

      room.on(RoomEvent.Disconnected, () => {
        setPhase('ended')
        cleanup()
      })

      // Subscribe to monitor-{pos} from mix-agent
      room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
        const expectedMonitor = `monitor-${pos}`
        if (
          participant.identity === 'mix-agent' &&
          publication.trackName === expectedMonitor &&
          track.kind === Track.Kind.Audio
        ) {
          // Attach monitor to audio element
          const el = track.attach()
          el.autoplay = true
          el.style.display = 'none'
          document.body.appendChild(el)
          setMonitorState('active')
          console.log(`[performer-${pos}] Monitor attached: ${expectedMonitor}`)
        }
      })

      // Connect WITHOUT auto-subscribe (we only want our monitor track)
      await room.connect(livekitUrl, token, { autoSubscribe: false })

      // Manually subscribe to our monitor track when it appears
      room.on(RoomEvent.TrackPublished, (publication, participant) => {
        if (
          participant.identity === 'mix-agent' &&
          publication.trackName === `monitor-${pos}`
        ) {
          publication.setSubscribed(true)
        }
      })

      // Also check existing publications (agent might already be there)
      for (const [, participant] of room.remoteParticipants) {
        if (participant.identity === 'mix-agent') {
          for (const [, pub] of participant.trackPublications) {
            if (pub.trackName === `monitor-${pos}`) {
              pub.setSubscribed(true)
            }
          }
        }
      }

      // Publish our mic
      const micTrack = await createLocalAudioTrack({
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      })
      await room.localParticipant.publishTrack(micTrack, {
        name: `mic-${pos}`,
        source: Track.Source.Microphone,
      })
      console.log(`[performer-${pos}] Published mic-${pos}`)

      // RTT polling
      rttIntervalRef.current = setInterval(async () => {
        const stats = await room.getStats()
        // Look for RTT in stats
        for (const report of stats.values ? stats.values() : []) {
          if ((report as any).type === 'candidate-pair' && (report as any).state === 'succeeded') {
            const r = (report as any).currentRoundTripTime
            if (r != null) setRtt(Math.round(r * 1000))
          }
        }
      }, 2000)

      setPhase('live')
    } catch (e: any) {
      setError(e.message)
      setPhase('error')
    }
  }

  function leave() {
    cleanup()
    navigate('/')
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🎙 Performer View</h1>
      <p style={styles.sub}>Room: <code>{roomId}</code> {roomCode && <> · Code: <strong>{roomCode}</strong></>}</p>

      {phase === 'setup' && (
        <div style={styles.card}>
          <h2>Join as Performer</h2>
          <input
            style={styles.input}
            placeholder="Your name"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && join()}
          />
          <button style={styles.btnPrimary} onClick={join}>
            Join Session
          </button>
        </div>
      )}

      {phase === 'joining' && (
        <div style={styles.card}>
          <p>Joining room… connecting to LiveKit…</p>
        </div>
      )}

      {phase === 'live' && (
        <div style={styles.card}>
          <div style={styles.positionBadge}>
            Performer #{position}
          </div>

          <div style={styles.statusGrid}>
            <StatusRow label="Connection" value={connState} good={connState === 'connected'} />
            <StatusRow label="Monitor" value={monitorState} good={monitorState === 'active'} />
            <StatusRow label="Publishing" value={`mic-${position}`} good={true} />
            {rtt !== null && <StatusRow label="RTT" value={`${rtt} ms`} good={rtt < 150} />}
          </div>

          {position === 1 && (
            <div style={styles.infoBox}>
              ℹ You are the lead (Performer #1). You hear nothing from the mix — your monitor is silent.
            </div>
          )}
          {(position ?? 0) > 1 && monitorState === 'waiting' && (
            <div style={styles.infoBox}>
              ⏳ Waiting for mix-agent to connect and publish your monitor track…
            </div>
          )}
          {(position ?? 0) > 1 && monitorState === 'active' && (
            <div style={styles.successBox}>
              ✅ Mix-minus active — you are hearing performers 1–{(position ?? 0) - 1}
            </div>
          )}

          <button style={styles.btnDanger} onClick={leave}>
            Leave Session
          </button>
        </div>
      )}

      {phase === 'error' && (
        <div style={styles.card}>
          <p style={styles.errorText}>Error: {error}</p>
          <button style={styles.btnPrimary} onClick={() => setPhase('setup')}>Try Again</button>
        </div>
      )}

      {phase === 'ended' && (
        <div style={styles.card}>
          <p>Session ended.</p>
          <button style={styles.btnPrimary} onClick={() => navigate('/')}>Home</button>
        </div>
      )}
    </div>
  )
}

function StatusRow({ label, value, good }: { label: string; value: string; good: boolean }) {
  return (
    <div style={styles.statusRow}>
      <span style={styles.statusLabel}>{label}</span>
      <span style={{ ...styles.statusValue, color: good ? '#16a34a' : '#dc2626' }}>{value}</span>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: 520, margin: '40px auto', padding: '0 20px', fontFamily: 'system-ui, sans-serif' },
  title: { fontSize: 28, margin: '0 0 4px' },
  sub: { color: '#666', margin: '0 0 24px', fontSize: 14 },
  card: { background: '#f8f8f8', borderRadius: 12, padding: 24, marginBottom: 16 },
  positionBadge: {
    fontSize: 24, fontWeight: 700, color: '#2563eb',
    background: '#eff6ff', padding: '12px 20px', borderRadius: 10,
    marginBottom: 20, textAlign: 'center',
  },
  statusGrid: { marginBottom: 20 },
  statusRow: { display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #eee' },
  statusLabel: { color: '#666', fontSize: 14 },
  statusValue: { fontWeight: 600, fontSize: 14 },
  infoBox: { background: '#fef9c3', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 },
  successBox: { background: '#dcfce7', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16, color: '#15803d' },
  input: { width: '100%', padding: '10px 12px', fontSize: 15, border: '2px solid #ddd', borderRadius: 8, boxSizing: 'border-box', marginBottom: 12 },
  btnPrimary: { padding: '10px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, cursor: 'pointer', fontWeight: 600 },
  btnDanger: { padding: '10px 20px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, cursor: 'pointer', marginTop: 16 },
  errorText: { color: '#dc2626' },
}
