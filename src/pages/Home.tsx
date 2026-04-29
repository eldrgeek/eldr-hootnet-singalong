import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SERVER_URL } from '../config'

export default function Home() {
  const navigate = useNavigate()
  const [joinCode, setJoinCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function createRoom() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${SERVER_URL}/rooms`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create room')
      navigate(`/control/${data.roomId}?new=1&code=${data.joinCode}`)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function joinRoom() {
    if (!joinCode.trim()) return
    setLoading(true)
    setError('')
    try {
      const code = joinCode.trim().toUpperCase()
      const res = await fetch(`${SERVER_URL}/rooms/code/${code}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Room not found')
      navigate(`/play/${data.roomId}`)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function joinAudience() {
    if (!joinCode.trim()) return
    setLoading(true)
    setError('')
    try {
      const code = joinCode.trim().toUpperCase()
      const res = await fetch(`${SERVER_URL}/rooms/code/${code}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Room not found')
      navigate(`/audience/${data.roomId}`)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🎵 Hootnet Singalong</h1>
      <p style={styles.sub}>Live ensemble mix-minus sessions</p>

      <div style={styles.card}>
        <h2>Start a Session</h2>
        <p style={styles.hint}>Creates a new room. You'll be the control room.</p>
        <button style={styles.btnPrimary} onClick={createRoom} disabled={loading}>
          {loading ? 'Creating…' : 'Create Room'}
        </button>
      </div>

      <div style={styles.card}>
        <h2>Join a Session</h2>
        <input
          style={styles.input}
          placeholder="Enter room code (e.g. A3F9C2)"
          value={joinCode}
          onChange={e => setJoinCode(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === 'Enter' && joinRoom()}
          maxLength={6}
        />
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button style={styles.btnPrimary} onClick={joinRoom} disabled={loading || !joinCode}>
            Join as Performer
          </button>
          <button style={styles.btnSecondary} onClick={joinAudience} disabled={loading || !joinCode}>
            Join as Audience
          </button>
        </div>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      <p style={{ color: '#666', fontSize: 13, marginTop: 32 }}>
        Server: <code>{SERVER_URL}</code>
      </p>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 480,
    margin: '40px auto',
    padding: '0 20px',
    fontFamily: 'system-ui, sans-serif',
  },
  title: { fontSize: 32, margin: '0 0 4px' },
  sub: { color: '#666', margin: '0 0 32px' },
  card: {
    background: '#f8f8f8',
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
  },
  hint: { color: '#888', fontSize: 13, margin: '4px 0 16px' },
  input: {
    width: '100%',
    padding: '10px 12px',
    fontSize: 18,
    letterSpacing: 4,
    border: '2px solid #ddd',
    borderRadius: 8,
    boxSizing: 'border-box',
    textTransform: 'uppercase',
  },
  btnPrimary: {
    padding: '10px 20px',
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 15,
    cursor: 'pointer',
    fontWeight: 600,
  },
  btnSecondary: {
    padding: '10px 20px',
    background: '#e5e7eb',
    color: '#374151',
    border: 'none',
    borderRadius: 8,
    fontSize: 15,
    cursor: 'pointer',
  },
  error: { color: '#dc2626', background: '#fef2f2', padding: '10px 16px', borderRadius: 8 },
}
