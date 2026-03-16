import { Link } from 'react-router-dom'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, MapPin, ArrowRight, CheckCircle, Shield, DollarSign, Blocks, Loader2 } from 'lucide-react'
import { useEventData } from '@/hooks/useEventData'
import { formatDate, formatPAS } from '@/lib/utils'

export default function Home() {
  const { events, isLoading, isError } = useEventData()

  return (
    <main>
      {/* Hero Section */}
      <section
        className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center overflow-hidden hero-gradient"
      >
        {/* Medal shine overlays */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 animate-shine" />
          <div className="absolute w-96 h-96 -top-48 -left-48 animate-float" />
        </div>

        <div className="relative z-10 container mx-auto px-4 py-16 text-center">
          {/* Launch badge */}
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/80 backdrop-blur border border-[#6B5B95] mb-8">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F5C842] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F5C842]"></span>
            </span>
            <span className="text-sm font-medium text-[#3D2870]">
              Live on Polkadot Hub
            </span>
          </div>

          {/* Main headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 max-w-4xl mx-auto leading-tight text-[#1a1625]">
            Blockchain-Powered Ticketing on{' '}
            <span className="gradient-text">
              Polkadot Hub
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            DucketV2 smart contracts enforce fair pricing at the protocol level.
            Scalping is impossible. Counterfeits don't exist. Your wallet holds your ticket.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button
              size="lg"
              className="text-lg px-8 py-6 bg-[#3D2870] hover:bg-[#6B5B95] shadow-lg"
              asChild
            >
              <a href="#events">
                Browse Events on Polkadot Hub
                <ArrowRight className="ml-2 w-5 h-5" />
              </a>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6 border-[#F5C842] text-[#1a1625] hover:bg-[#F5C842]"
              asChild
            >
              <Link to="/resale">
                Resale Marketplace
              </Link>
            </Button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>ERC-1155 NFT Tickets</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>On-Chain Resale Cap — Scalping Is Impossible</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Non-Custodial — Your Wallet, Your Tickets</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Deployed on Polkadot Hub Testnet</span>
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#F5F0FF] text-[#3D2870] text-sm font-medium mb-4">
              Upcoming Events
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Find Your Next Experience
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Browse events with anti-scalping protection and fair resale prices.
            </p>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-500">
              <Loader2 className="w-10 h-10 animate-spin mb-4 text-[#3D2870]" />
              <p className="text-lg">Loading events...</p>
            </div>
          ) : isError ? (
            <div className="text-center py-16 text-red-600">
              <p className="text-lg font-medium">Failed to load events. Please check your connection and try again.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              {events.map((event) => {
                const soldOut = event.tiers.every(t => t.minted >= t.maxSupply)
                const lowestPrice = event.tiers.reduce(
                  (min, t) => t.price < min ? t.price : min,
                  event.tiers[0]?.price ?? 0n
                )

                return (
                  <Link key={event.eventId} to={`/event/${event.eventId}`}>
                    <Card className="overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 border-[#E8E3F5] hover:border-[#3D2870]/30">
                      <div className="relative aspect-[16/9] overflow-hidden">
                        <img
                          src={event.imageUrl}
                          alt={event.name}
                          className="object-cover w-full h-full"
                        />
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-[#3D2870]">{event.category}</Badge>
                        </div>
                        {soldOut && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <Badge variant="destructive" className="text-lg px-4 py-2">
                              Sold Out
                            </Badge>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg mb-2 line-clamp-1 text-[#1a1625]">
                          {event.name}
                        </h3>
                        <div className="flex items-center text-sm text-gray-600 mb-1">
                          <Calendar className="h-4 w-4 mr-2 text-[#3D2870]" />
                          {formatDate(event.eventDate)}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2 text-[#3D2870]" />
                          {event.city}, {event.country}
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 pt-0 flex items-center justify-between">
                        <div className="text-sm">
                          <span className="text-gray-500">From </span>
                          <span className="font-semibold text-[#3D2870]">{formatPAS(lowestPrice)}</span>
                        </div>
                        {event.resaleEnabled && (
                          <Badge variant="secondary" className="text-xs bg-[#F5F0FF] text-[#3D2870]">
                            Resale OK
                          </Badge>
                        )}
                      </CardFooter>
                    </Card>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-[#F8F4FF]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-white text-[#3D2870] text-sm font-medium mb-4">
              Blockchain-Powered
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Ticketing, Reimagined
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Smart contracts enforce fair pricing. Your wallet holds your tickets. No middlemen, no scalpers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              {
                icon: Shield,
                title: 'XCM-Ready Verification',
                description: 'Every ticket is an NFT on Polkadot Hub with on-chain verification events. Architected for cross-chain attestation via XCM — other parachains can verify ownership trustlessly.',
              },
              {
                icon: DollarSign,
                title: 'Price-Capped Resale',
                description: 'Resale limits enforced by smart contracts, not policies. Scalping is mathematically impossible.',
              },
              {
                icon: Blocks,
                title: 'Your Wallet, Your Tickets',
                description: 'Non-custodial ownership. Your tickets live in your wallet, only you control them.',
              },
              {
                icon: Blocks,
                title: 'Built on Polkadot Hub',
                description: 'EVM-compatible smart contracts on Polkadot Hub. Connect with MetaMask, pay with USDC, and benefit from Polkadot\'s shared security model.',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group p-8 rounded-2xl bg-white border border-[#E8E3F5] hover:border-[#3D2870]/30 hover:shadow-xl hover:shadow-[#3D2870]/5 transition-all duration-300"
              >
                <div className="w-14 h-14 mb-6 rounded-xl bg-[#3D2870] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
