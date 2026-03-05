import { Routes, Route } from 'react-router-dom'
import { Header } from './components/Header'
import { DemoBanner } from './components/DemoBanner'
import Home from './pages/Home'
import Event from './pages/Event'
import MyTickets from './pages/MyTickets'
import Resale from './pages/Resale'
import HowItWorks from './pages/HowItWorks'

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <DemoBanner />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/event/:id" element={<Event />} />
        <Route path="/my-tickets" element={<MyTickets />} />
        <Route path="/resale" element={<Resale />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
      </Routes>
    </div>
  )
}

export default App
