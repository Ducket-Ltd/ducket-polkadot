import { Link } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, TrendingUp, Shield, Loader2 } from 'lucide-react'
import { MOCK_EVENTS, MOCK_RESALE_LISTINGS } from '@/lib/mockData'
import { formatDate, formatDOT, truncateAddress } from '@/lib/utils'
import { useState } from 'react'
import { WalletConnect } from '@/components/WalletConnect'

export default function Resale() {
  const { isConnected } = useAccount()
  const [isPurchasing, setIsPurchasing] = useState<string | null>(null)

  const handleBuy = async (listingId: string) => {
    if (!isConnected) return

    setIsPurchasing(listingId)

    // Simulate purchase
    setTimeout(() => {
      setIsPurchasing(null)
    }, 2000)
  }

  // Map listings to display format
  const displayListings = MOCK_RESALE_LISTINGS.map((listing) => {
    const event = MOCK_EVENTS.find((e) => e.id === listing.eventId)
    const tier = event?.ticketTiers.find((t) => t.id === listing.tierId)

    return {
      ...listing,
      event,
      tier,
    }
  }).filter((l) => l.event)

  return (
    <main className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-[#1a1625]">Resale Marketplace</h1>
        <p className="text-gray-600">
          Buy tickets from other fans at price-capped rates. All resales are protected by smart contract enforcement.
        </p>
      </div>

      {/* Info Banner */}
      <Card className="mb-8 border-[#E8E3F5] bg-[#F8F4FF]">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#3D2870] flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-[#1a1625]">Price Protection Active</p>
              <p className="text-sm text-gray-600">
                All listings are enforced by smart contracts. Prices cannot exceed the event's resale cap.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Listings */}
      {displayListings.length === 0 ? (
        <Card className="border-[#E8E3F5]">
          <CardContent className="py-16 text-center">
            <p className="text-gray-600 mb-4">No tickets currently listed for resale.</p>
            <Link to="/">
              <Button className="bg-[#3D2870] hover:bg-[#6B5B95]">Browse Events</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {displayListings.map((listing) => {
            const markup = Math.round(((listing.listingPrice - listing.originalPrice) / listing.originalPrice) * 100)

            return (
              <Card
                key={listing.id}
                className="overflow-hidden border-[#E8E3F5] hover:border-[#3D2870]/30 transition-all"
              >
                <div className="relative aspect-[16/9]">
                  <img
                    src={listing.event!.imageUrl}
                    alt={listing.event!.name}
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-[#3D2870]">{listing.tier?.name || 'Unknown'}</Badge>
                  </div>
                  <div className="absolute top-2 right-2">
                    <Badge
                      className={markup === 0 ? 'bg-green-500' : markup <= 20 ? 'bg-amber-500' : 'bg-orange-500'}
                    >
                      {markup === 0 ? 'Face Value' : `+${markup}%`}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-1 text-[#1a1625]">
                    {listing.event!.name}
                  </h3>

                  <div className="space-y-1 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-[#3D2870]" />
                      {formatDate(listing.event!.date)}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-[#3D2870]" />
                      {listing.event!.venue}
                    </div>
                    <div className="flex items-center text-xs">
                      <span className="text-gray-400">Token: #{listing.ticketId}</span>
                      <span className="mx-2 text-gray-300">|</span>
                      <span className="text-gray-400">Seller: {truncateAddress(listing.seller)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xl font-bold text-[#3D2870]">{formatDOT(listing.listingPrice)}</span>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Original: {formatDOT(listing.originalPrice)}
                      </div>
                    </div>
                    {isConnected ? (
                      <Button
                        className="bg-[#3D2870] hover:bg-[#6B5B95]"
                        onClick={() => handleBuy(listing.id)}
                        disabled={isPurchasing === listing.id}
                      >
                        {isPurchasing === listing.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Buy Now'
                        )}
                      </Button>
                    ) : (
                      <WalletConnect />
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* How It Works */}
      <Card className="mt-8 border-[#E8E3F5]">
        <CardContent className="py-6">
          <h3 className="font-semibold mb-4 text-[#1a1625]">How Resale Works</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <div className="text-lg font-bold text-[#3D2870] mb-1">1</div>
              <p className="text-sm text-gray-600">
                Sellers list tickets at prices within the event's resale cap
              </p>
            </div>
            <div>
              <div className="text-lg font-bold text-[#3D2870] mb-1">2</div>
              <p className="text-sm text-gray-600">
                Smart contracts verify the price meets all requirements
              </p>
            </div>
            <div>
              <div className="text-lg font-bold text-[#3D2870] mb-1">3</div>
              <p className="text-sm text-gray-600">
                Ticket transfers instantly to your wallet on purchase
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
