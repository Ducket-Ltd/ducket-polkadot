import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { useAccount } from 'wagmi'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, TrendingUp, Shield, Loader2, RefreshCw } from 'lucide-react'
import { formatUSDC, truncateAddress } from '@/lib/utils'
import { WalletConnect } from '@/components/WalletConnect'
import { COPY } from '@/constants/copy'
import { useResaleListings, type ActiveListing } from '@/hooks/useResaleListings'
import { useResalePurchase } from '@/hooks/useResalePurchase'
import { EVENT_METADATA } from '@/data/eventMetadata'

export default function Resale() {
  const { isConnected } = useAccount()
  const { listings, isLoading, refetch } = useResaleListings()
  const { stepLabel, isPending, errorMessage, isSuccess, buy, reset } = useResalePurchase()
  const [selectedListing, setSelectedListing] = useState<ActiveListing | null>(null)

  // Handle success: refresh listings and reset purchase state after 2 seconds
  useEffect(() => {
    if (!isSuccess) return

    refetch()
    const timer = setTimeout(() => {
      setSelectedListing(null)
      reset()
    }, 2000)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess])

  const handleBuy = (listing: ActiveListing) => {
    if (!isConnected) return
    setSelectedListing(listing)
    buy(listing)
  }

  return (
    <main className="container py-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-foreground">{COPY.RESALE_PAGE.PAGE_TITLE}</h1>
          <p className="text-gray-600">
            {COPY.RESALE_PAGE.PAGE_SUBTITLE}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refetch}
          disabled={isLoading}
          className="border-border text-primary hover:bg-secondary"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Info Banner */}
      <Card className="mb-8 border-border bg-secondary">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{COPY.RESALE_PAGE.PRICE_PROTECTION_LABEL}</p>
              <p className="text-sm text-gray-600">
                {COPY.RESALE_PAGE.PRICE_PROTECTION_SUBTITLE}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-gray-600">Loading resale listings...</span>
        </div>
      ) : listings.length === 0 ? (
        /* Empty State */
        <Card className="border-border">
          <CardContent className="py-16 text-center">
            <p className="text-gray-600 mb-4">No tickets currently listed for resale.</p>
            <Link to="/">
              <Button className="bg-primary hover:bg-primary-light">Browse Events</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        /* Listing Grid */
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing, index) => {
            const eventMeta = EVENT_METADATA[listing.eventId]
            const isSelectedListing =
              selectedListing?.tokenId === listing.tokenId &&
              selectedListing?.ticketNumber === listing.ticketNumber

            // Compute markup percentage relative to maxResalePrice face value
            // maxResalePrice = stablePrice * maxResalePercentage / 100, so stablePrice = maxResalePrice * 100 / maxResalePercentage
            // Simpler: just show price vs maxResalePrice ratio
            const markup = listing.maxResalePrice > 0n
              ? Number((listing.price * 100n) / listing.maxResalePrice) - 100
              : 0

            return (
              <motion.div
                key={`${listing.tokenId}-${listing.ticketNumber}`}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut', delay: index * 0.07 }}
                viewport={{ once: true }}
              >
              <Card
                className="overflow-hidden border-border hover:border-primary/30 transition-all"
              >
                {/* Event Image */}
                <div className="relative aspect-[16/9]">
                  {eventMeta?.imageUrl && (
                    <img
                      src={eventMeta.imageUrl}
                      alt={listing.eventName}
                      className="object-cover w-full h-full"
                    />
                  )}
                  {/* Tier Badge */}
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-primary">{listing.tierName}</Badge>
                  </div>
                  {/* Price Cap Badge (DEMO-07) */}
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-amber-500 text-white text-xs">
                      Max: {formatUSDC(listing.maxResalePrice)}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-1 text-foreground">
                    {listing.eventName}
                  </h3>

                  <div className="space-y-1 text-sm text-gray-600 mb-4">
                    {eventMeta?.venue && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-primary" />
                        {eventMeta.venue}, {eventMeta.city}
                      </div>
                    )}
                    <div className="flex items-center text-xs">
                      <span className="text-gray-400">Token #{listing.tokenId} · Ticket #{listing.ticketNumber}</span>
                    </div>
                    <div className="flex items-center text-xs">
                      <span className="text-gray-400">Seller: {truncateAddress(listing.seller)}</span>
                    </div>
                  </div>

                  {/* Price + Markup */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-primary">
                        {listing.isStablecoin ? formatUSDC(listing.price) : `${listing.price.toString()} wei`}
                      </span>
                      <Badge
                        className={
                          markup <= 0
                            ? 'bg-green-500 text-white'
                            : markup <= 20
                            ? 'bg-amber-500 text-white'
                            : 'bg-orange-500 text-white'
                        }
                      >
                        {markup <= 0 ? 'Face Value' : `+${markup}%`}
                      </Badge>
                    </div>
                    {/* Price Cap Detail (DEMO-07) */}
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Price cap: {formatUSDC(listing.maxResalePrice)}
                    </div>
                  </div>

                  {/* Buy Button / Error */}
                  {isSelectedListing && errorMessage && (
                    <p className="text-xs text-red-500 mb-2 break-words">{errorMessage}</p>
                  )}
                  {isSelectedListing && isSuccess && (
                    <p className="text-xs text-green-600 mb-2 font-semibold">Purchase successful!</p>
                  )}

                  {isConnected ? (
                    <Button
                      className="w-full bg-primary hover:bg-primary-light disabled:opacity-50"
                      onClick={() => handleBuy(listing)}
                      disabled={isPending && !isSelectedListing || isSuccess}
                    >
                      {isSelectedListing && isPending ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {stepLabel}
                        </span>
                      ) : isSelectedListing && isSuccess ? (
                        'Purchased!'
                      ) : (
                        'Buy Now'
                      )}
                    </Button>
                  ) : (
                    <WalletConnect />
                  )}
                </CardContent>
              </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* How It Works */}
      <Card className="mt-8 border-border">
        <CardContent className="py-6">
          <h3 className="font-semibold mb-4 text-foreground">{COPY.RESALE_PAGE.HOW_IT_WORKS_TITLE}</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <div className="text-lg font-bold text-primary mb-1">1</div>
              <p className="text-sm text-gray-600">
                Seller lists a ticket. If the price is above the cap, the contract rejects it.
              </p>
            </div>
            <div>
              <div className="text-lg font-bold text-primary mb-1">2</div>
              <p className="text-sm text-gray-600">
                You approve USDC in your wallet. No account, no credit card.
              </p>
            </div>
            <div>
              <div className="text-lg font-bold text-primary mb-1">3</div>
              <p className="text-sm text-gray-600">
                Ticket lands in your wallet, seller gets paid. One transaction.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
