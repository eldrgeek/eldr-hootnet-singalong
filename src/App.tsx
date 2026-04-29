import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Performer from './pages/Performer'
import Audience from './pages/Audience'
import Control from './pages/Control'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/play/:roomId" element={<Performer />} />
      <Route path="/audience/:roomId" element={<Audience />} />
      <Route path="/control/:roomId" element={<Control />} />
    </Routes>
  )
}
