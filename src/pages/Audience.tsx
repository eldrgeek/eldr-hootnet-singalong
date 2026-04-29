import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Room, RoomEvent, Track, ConnectionState } from 'livekit-client'
import { SERVER_URL } from '../config'

export default function Audience() {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()

  const [connState, setConnState] = useState<string>('connecting')
  const [muted, setMuted] = useState(false)
  const [performers, setPerformers] = useState<string[]>([])
  const [hasAudio, setHasAudio] = useState(false)
  const [error, setError] = useState('')

  const roomRef = useRef<Room | null>(null)
  const audioRef = useRef<HTMLAudioElement[]>([])

  useEffect(() => {
    connect()
    return () => {
      roomRef.current?.disconnect()
      audioRef.current.forEach(el => el.remove())
    }
  }, [roomId])

  async function connect() {
    try {
      const res = await fetch(`${SERVER_URL}/rooms/${roomId}/tokens/audience`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Token error')

      const { token, livekitUrl } = data
      const room = new Room({ adaptiveStream: false, dynacast: false })
      roomRef.current = room

      room.on(RoomEvent.ConnectionStateChanged, (s: ConnectionState) => setConnState(s))

      room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
        if (track.kind !== Track.Kind.Audio) return

        // Audience subscribes to monitor-audience from mix-agent, OR all mic tracks if no agent
        const isMonitorAudience =
          participant.identity === 'mix-agent' && publication.trackName === 'monitor-audience'
        const isMicTrack = publication.trackName?.startsWith('mic-')

        if (isMonitorAudience || isMicTrack) {
          const el = track.attach()
          el.autoplay = true
          el.muted = muted
          el.style.display = 'none'
          document.body.appendChild(el)
          audioRef.current.push(el)
          setHasAudio(true)
        }
      })

      room.on(RoomEvent.ParticipantConnected, updatePerformers)
      room.on(RoomEvent.ParticipantDisconnected, updatePerformers)

      await room.connect(livekitUrl, token, { autoSubscribe: true })

      updatePerformers()
      setConnState('connected')
    } catch (e: any) {
      setError(e.message)
      setConnState('error')
    }
  }

  function updatePerformers() {
    if (!roomRef.current) return
    const perfs: string[] = []
    for (const [, p] of roomRef.current.remoteParticipants) {
      if (p.identity.startsWith('performer-')) perfs.push(p.identity)
    }
    setPerformers(perfs)
  }

  function toggleMute() {
    const next = !muted
    setMuted(next)
    audioRef.current.forEach(el => { el.muted = next })
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🎧 Audience View</h1>
      <p style={styles.sub}>Room: <code>{roomId}</code></p>

      <div style={styles.card}>
        <div style={styles.statusRow}>
          <span>Connection</span>
          <span style={{ color: connState === 'connected' ? '#16a34a' : '#dc2626' }}>{connState}</span>
        </div>
        <div style={styles.statusRow}>
          <span>Audio</span>
          <span style={{ color: hasAudio ? '#16a34a' : '#999' }}>{hasAudio ? 'Streaming' : 'Waiting…'}</span>
        </div>
        <div style={styles.statusRow}>
          <span>Performers</span>
          <span>{performers.length > 0 ? performers.join(', ') : 'None yet'}</span>
        </div>

        {error && <p style={styles.errorText}>{error}</p>}

        <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
          <button style={muted ? styles.btnSecondary : styles.btnPrimary} onClick={toggleMute}>
            {muted ? '🔇 Unmute' : '🔊 Mute'}
          </button>
          <button style={styles.btnDanger} onClick={() => { roomRef.current?.disconnect(); navigate('/') }}>
            Leave
          </button>
        </div>
      </div>

      {hasAudio && !muted && (
        <div style={styles.nowPlaying}>
          🎵 Listening to live ensemble mix
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: 480, margin: '40px auto', padding: '0 20px', fontFamily: 'system-ui, sans-serif' },
  title: { fontSize: 28, margin: '0 0 4px' },
  sub: { color: '#666', margin: '0 0 24px', fontSize: 14 },
  card: { background: '#f8f8f8', borderRadius: 12, padding: 24 },
  statusRow: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee', fontSize: 15 },
  btnPrimary: { padding: '10px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, cursor: 'pointer', fontWeight: 600 },
  btnSecondary: { padding: '10px 20px', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: 8, fontSize: 15, cursor: 'pointer' },
  btnDanger: { padding: '10px 20px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, cursor: 'pointer' },
  errorText: { color: '#dc2626', marginTop: 12 },
  nowPlaying: { marginTop: 16, padding: '12px 20px', background: '#dcfce7', borderRadius: 10, color: '#15803d', fontWeight: 600, textAlign: 'center' },
}
