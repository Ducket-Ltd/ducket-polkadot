import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, MapPin, ArrowRight, CheckCircle, Shield, DollarSign, Blocks, Wallet, Loader2, RefreshCw } from 'lucide-react'
import { useEventData } from '@/hooks/useEventData'
import { formatDate, formatPAS } from '@/lib/utils'
import { COPY } from '@/constants/copy'

export default function Home() {
  const { events, isLoading, isError, isTimedOut, refetch } = useEventData()

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
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/80 backdrop-blur border border-primary-light mb-8">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            <span className="text-sm font-medium text-primary">
              Live on Polkadot Hub Testnet
            </span>
          </div>

          {/* Main headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 max-w-4xl mx-auto leading-tight text-foreground">
            {COPY.HOME.HERO_HEADLINE}
            <br />
            <span className="gradient-text">
              {COPY.HOME.HERO_HEADLINE_HIGHLIGHT}
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            {COPY.HOME.HERO_SUBHEADLINE}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button
              size="lg"
              className="text-lg px-8 py-6 bg-primary hover:bg-primary-light shadow-lg"
              asChild
            >
              <a href="#events">
                {COPY.HOME.CTA_BROWSE}
                <ArrowRight className="ml-2 w-5 h-5" />
              </a>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6 border-accent text-foreground hover:bg-accent"
              asChild
            >
              <Link to="/resale">
                {COPY.HOME.CTA_RESALE}
              </Link>
            </Button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Resale capped at 150%</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Polkadot Hub Testnet</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span>XCM-ready</span>
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <motion.section
        id="events"
        className="py-24 bg-white"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-secondary text-primary text-sm font-medium mb-4">
              {COPY.HOME.EVENTS_SECTION_LABEL}
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              {COPY.HOME.EVENTS_SECTION_TITLE}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {COPY.HOME.EVENTS_SECTION_SUBTITLE}
            </p>
          </div>

          {isLoading && !isTimedOut ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-500">
              <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
              <p className="text-lg">Loading events...</p>
            </div>
          ) : isTimedOut ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-500">
              <p className="text-lg mb-4">Events are taking longer than expected.</p>
              <Button variant="outline" onClick={() => refetch()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </div>
          ) : isError ? (
            <div className="text-center py-16 text-red-600">
              <p className="text-lg font-medium">Failed to load events. Please check your connection and try again.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              {events.map((event, index) => {
                const soldOut = event.tiers.every(t => t.minted >= t.maxSupply)
                const lowestPrice = event.tiers.reduce(
                  (min, t) => t.price < min ? t.price : min,
                  event.tiers[0]?.price ?? 0n
                )

                return (
                  <motion.div
                    key={event.eventId}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: 'easeOut', delay: index * 0.07 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -4 }}
                  >
                  <Link to={`/event/${event.eventId}`}>
                    <Card className="overflow-hidden transition-all hover:shadow-xl border-border hover:border-primary/30">
                      <div className="relative aspect-[16/9] overflow-hidden">
                        <img
                          src={event.imageUrl}
                          alt={event.name}
                          className="object-cover w-full h-full"
                        />
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-primary">{event.category}</Badge>
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
                        <h3 className="font-semibold text-lg mb-2 line-clamp-1 text-foreground">
                          {event.name}
                        </h3>
                        <div className="flex items-center text-sm text-gray-600 mb-1">
                          <Calendar className="h-4 w-4 mr-2 text-primary" />
                          {formatDate(event.eventDate)}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2 text-primary" />
                          {event.city}, {event.country}
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 pt-0 flex items-center justify-between">
                        <div className="text-sm">
                          <span className="text-gray-500">From </span>
                          <span className="font-semibold text-primary">{formatPAS(lowestPrice)}</span>
                        </div>
                        {event.resaleEnabled && (
                          <Badge variant="secondary" className="text-xs bg-secondary text-primary">
                            Resale OK
                          </Badge>
                        )}
                      </CardFooter>
                    </Card>
                  </Link>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        id="features"
        className="py-24 bg-secondary"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-white text-primary text-sm font-medium mb-4">
              The Difference
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Why this matters
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Ticketmaster can change their rules. We can't change ours — they're in the contract.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              {
                icon: Shield,
                title: 'Cross-chain ready',
                description: 'Tickets emit on-chain verification events. Built for XCM so other parachains can check your ticket without calling our API.',
              },
              {
                icon: DollarSign,
                title: 'Resale cap = code',
                description: 'Each event sets a max resale price. The contract rejects anything above it. No admin override, no "dynamic pricing."',
              },
              {
                icon: Wallet,
                title: 'You hold the ticket',
                description: 'Tickets go straight to your wallet. We don\'t custody anything. Transfer, resell, or hold — your call.',
              },
              {
                icon: Blocks,
                title: 'Polkadot Hub',
                description: 'EVM contracts on Polkadot Hub testnet. MetaMask, USDC, and Polkadot\'s shared security. Nothing exotic.',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="group p-6 rounded-lg bg-white border border-border hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut', delay: index * 0.07 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
              >
                <div className="w-14 h-14 mb-6 rounded-lg bg-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
    </main>
  )
}
