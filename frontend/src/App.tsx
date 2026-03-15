import { Routes, Route } from 'react-router-dom'
import { zeroAddress } from 'viem'
import { Header } from './components/Header'
import { DemoBanner } from './components/DemoBanner'
import Home from './pages/Home'
import Event from './pages/Event'
import MyTickets from './pages/MyTickets'
import Resale from './pages/Resale'
import HowItWorks from './pages/HowItWorks'
import { CONTRACT_ADDRESS } from '@/lib/contract'

function App() {
  const isZeroAddress =
    CONTRACT_ADDRESS === zeroAddress ||
    CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000'

  return (
    <div className="min-h-screen bg-background">
      {isZeroAddress && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white text-center py-2 text-sm font-medium">
          WARNING: VITE_CONTRACT_ADDRESS is not set. Contract reads will fail. Update .env and restart.
        </div>
      )}
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
