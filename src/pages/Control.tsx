import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { Room, RoomEvent, Track, ConnectionState } from 'livekit-client'
import { SERVER_URL } from '../config'

interface PerformerTrack {
  identity: string
  position: number
  trackName: string
  volume: number
  muted: boolean
  audioEl: HTMLAudioElement | null
}

export default function Control() {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const isNew = searchParams.get('new') === '1'
  const joinCode = searchParams.get('code') || ''

  const [connState, setConnState] = useState<string>('connecting')
  const [tracks, setTracks] = useState<PerformerTrack[]>([])
  const [error, setError] = useState('')
  const [agentStatus, setAgentStatus] = useState<'not-started' | 'starting' | 'connected'>('not-started')

  const roomRef = useRef<Room | null>(null)
  const performerLinks = {
    play: `${window.location.origin}/play/${roomId}`,
    audience: `${window.location.origin}/audience/${roomId}`,
  }

  useEffect(() => {
    connect()
    return () => {
      roomRef.current?.disconnect()
    }
  }, [roomId])

  async function connect() {
    try {
      const res = await fetch(`${SERVER_URL}/rooms/${roomId}/tokens/control`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Token error')

      const { token, livekitUrl } = data
      const room = new Room({ adaptiveStream: false, dynacast: false })
      roomRef.current = room

      room.on(RoomEvent.ConnectionStateChanged, (s: ConnectionState) => setConnState(s))

      room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
        if (track.kind !== Track.Kind.Audio) return
        if (!publication.trackName?.startsWith('mic-')) return

        const pos = parseInt(publication.trackName.split('-')[1])
        if (isNaN(pos)) return

        const el = track.attach()
        el.autoplay = true
        el.style.display = 'none'
        document.body.appendChild(el)

        setTracks(prev => {
          const existing = prev.find(t => t.identity === participant.identity)
          if (existing) return prev
          return [...prev, {
            identity: participant.identity,
            position: pos,
            trackName: publication.trackName || '',
            volume: 1,
            muted: false,
            audioEl: el,
          }]
        })
      })

      room.on(RoomEvent.TrackUnsubscribed, (_track, publication, participant) => {
        setTracks(prev => prev.filter(t =>
          !(t.identity === participant.identity && t.trackName === publication.trackName)
        ))
      })

      room.on(RoomEvent.ParticipantConnected, (participant) => {
        if (participant.identity === 'mix-agent') setAgentStatus('connected')
      })

      await room.connect(livekitUrl, token, { autoSubscribe: true })
      setConnState('connected')

      // Check if agent already connected
      for (const [, p] of room.remoteParticipants) {
        if (p.identity === 'mix-agent') setAgentStatus('connected')
      }
    } catch (e: any) {
      setError(e.message)
      setConnState('error')
    }
  }

  async function startAgent() {
    setAgentStatus('starting')
    try {
      const res = await fetch(`${SERVER_URL}/rooms/${roomId}/start-agent`, { method: 'POST' })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Failed to start agent')
      }
    } catch (e: any) {
      setError(`Agent start: ${e.message}`)
      setAgentStatus('not-started')
    }
  }

  function setTrackVolume(identity: string, volume: number) {
    setTracks(prev => prev.map(t => {
      if (t.identity !== identity) return t
      if (t.audioEl) t.audioEl.volume = volume
      return { ...t, volume }
    }))
  }

  function toggleTrackMute(identity: string) {
    setTracks(prev => prev.map(t => {
      if (t.identity !== identity) return t
      const next = !t.muted
      if (t.audioEl) t.audioEl.muted = next
      return { ...t, muted: next }
    }))
  }

  function copyLink(url: string) {
    navigator.clipboard.writeText(url)
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🎛 Control Room</h1>
      <p style={styles.sub}>Room: <code>{roomId}</code></p>

      {isNew && joinCode && (
        <div style={styles.joinBox}>
          <h2 style={{ margin: '0 0 8px' }}>Room Created!</h2>
          <p style={{ margin: '0 0 12px', color: '#666' }}>Share this code with performers:</p>
          <div style={styles.codeDisplay}>{joinCode}</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button style={styles.btnSmall} onClick={() => copyLink(performerLinks.play)}>
              Copy Performer Link
            </button>
            <button style={styles.btnSmall} onClick={() => copyLink(performerLinks.audience)}>
              Copy Audience Link
            </button>
          </div>
          <p style={{ fontSize: 12, color: '#888', marginTop: 8 }}>
            Performer: <code>{performerLinks.play}</code>
          </p>
        </div>
      )}

      <div style={styles.card}>
        <h3 style={{ margin: '0 0 12px' }}>System Status</h3>
        <div style={styles.statusRow}>
          <span>LiveKit Connection</span>
          <span style={{ color: connState === 'connected' ? '#16a34a' : '#dc2626' }}>{connState}</span>
        </div>
        <div style={styles.statusRow}>
          <span>Mix Agent</span>
          <span style={{ color: agentStatus === 'connected' ? '#16a34a' : agentStatus === 'starting' ? '#d97706' : '#dc2626' }}>
            {agentStatus === 'connected' ? '✅ Connected' : agentStatus === 'starting' ? '⏳ Starting…' : '⚠ Not connected'}
          </span>
        </div>
        {agentStatus === 'not-started' && (
          <button style={{ ...styles.btnPrimary, marginTop: 12 }} onClick={startAgent}>
            Start Mix Agent
          </button>
        )}
        {error && <p style={styles.errorText}>{error}</p>}
      </div>

      <div style={styles.card}>
        <h3 style={{ margin: '0 0 12px' }}>Performer Tracks ({tracks.length})</h3>
        {tracks.length === 0 ? (
          <p style={{ color: '#888', fontSize: 14 }}>No performers connected yet. Share the room code above.</p>
        ) : (
          tracks
            .sort((a, b) => a.position - b.position)
            .map(t => (
              <div key={t.identity} style={styles.trackRow}>
                <div style={styles.trackInfo}>
                  <span style={styles.posTag}>#{t.position}</span>
                  <span style={{ fontWeight: 600 }}>{t.identity}</span>
                  <span style={{ color: '#888', fontSize: 12, marginLeft: 8 }}>{t.trackName}</span>
                </div>
                <div style={styles.trackControls}>
                  <input
                    type="range"
                    min={0} max={1} step={0.05}
                    value={t.volume}
                    onChange={e => setTrackVolume(t.identity, parseFloat(e.target.value))}
                    style={{ width: 100 }}
                  />
                  <button
                    style={t.muted ? styles.btnMuted : styles.btnSmall}
                    onClick={() => toggleTrackMute(t.identity)}
                  >
                    {t.muted ? '🔇' : '🔊'}
                  </button>
                </div>
              </div>
            ))
        )}
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button style={styles.btnDanger} onClick={async () => {
          await fetch(`${SERVER_URL}/rooms/${roomId}`, { method: 'DELETE' })
          roomRef.current?.disconnect()
          navigate('/')
        }}>
          End Session
        </button>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: 600, margin: '40px auto', padding: '0 20px', fontFamily: 'system-ui, sans-serif' },
  title: { fontSize: 28, margin: '0 0 4px' },
  sub: { color: '#666', margin: '0 0 16px', fontSize: 14 },
  joinBox: { background: '#eff6ff', borderRadius: 12, padding: 20, marginBottom: 16, border: '2px solid #bfdbfe' },
  codeDisplay: { fontSize: 36, fontWeight: 800, letterSpacing: 8, color: '#2563eb', margin: '8px 0 16px', fontFamily: 'monospace' },
  card: { background: '#f8f8f8', borderRadius: 12, padding: 20, marginBottom: 16 },
  statusRow: { display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #eee', fontSize: 14 },
  trackRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' },
  trackInfo: { display: 'flex', alignItems: 'center', gap: 8 },
  trackControls: { display: 'flex', alignItems: 'center', gap: 8 },
  posTag: { background: '#2563eb', color: '#fff', borderRadius: 4, padding: '2px 8px', fontSize: 12, fontWeight: 700 },
  btnPrimary: { padding: '10px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, cursor: 'pointer', fontWeight: 600 },
  btnSmall: { padding: '6px 12px', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer' },
  btnMuted: { padding: '6px 12px', background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer' },
  btnDanger: { padding: '10px 20px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, cursor: 'pointer' },
  errorText: { color: '#dc2626', fontSize: 13, marginTop: 8 },
}
