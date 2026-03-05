import { Link } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MOCK_EVENTS } from '@/lib/mockData'
import { formatDate, formatDOT } from '@/lib/utils'
import { Calendar, MapPin, Ticket, Wallet, Tag } from 'lucide-react'
import { WalletConnect } from '@/components/WalletConnect'

// Owned tickets - populated when user purchases tickets on-chain
// In production, this would be fetched from the contract using getUserTicketsForEvent
const ownedTickets: {
  ticketId: number
  eventId: string
  tierId: string
  seatId: string
  purchasePrice: number
  purchaseDate: Date
}[] = []

export default function MyTickets() {
  const { isConnected } = useAccount()

  if (!isConnected) {
    return (
      <main className="container py-16">
        <div className="text-center">
          <Wallet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4 text-[#1a1625]">Connect Your Wallet</h1>
          <p className="text-gray-600 mb-6">
            Connect your wallet to view your tickets
          </p>
          <WalletConnect />
        </div>
      </main>
    )
  }

  return (
    <main className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-[#1a1625]">My Tickets</h1>
        <p className="text-gray-600">
          NFT tickets owned by your connected wallet
        </p>
      </div>

      {ownedTickets.length === 0 ? (
        <Card className="border-[#E8E3F5]">
          <CardContent className="py-16 text-center">
            <Ticket className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2 text-[#1a1625]">No Tickets Yet</h2>
            <p className="text-gray-600 mb-6">
              You haven't purchased any tickets yet
            </p>
            <Link to="/">
              <Button className="bg-[#3D2870] hover:bg-[#6B5B95]">Browse Events</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {ownedTickets.map((ticket) => {
            const event = MOCK_EVENTS.find(e => e.id === ticket.eventId)
            if (!event) return null

            const tier = event.ticketTiers.find(t => t.id === ticket.tierId)

            return (
              <Card key={ticket.ticketId} className="overflow-hidden border-[#E8E3F5] hover:border-[#3D2870]/30 transition-all">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-48 aspect-video md:aspect-square">
                    <img
                      src={event.imageUrl}
                      alt={event.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="flex-1 p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-semibold mb-2 text-[#1a1625]">{event.name}</h3>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-[#3D2870]" />
                            <span>{formatDate(event.date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-[#3D2870]" />
                            <span>{event.venue}, {event.city}</span>
                          </div>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <Badge className="bg-[#3D2870]">{tier?.name}</Badge>
                          <Badge variant="outline" className="border-[#3D2870] text-[#3D2870]">{ticket.seatId}</Badge>
                        </div>
                      </div>
                      <div className="flex flex-col gap-3 md:text-right">
                        <div>
                          <div className="text-sm text-gray-500">Purchased for</div>
                          <div className="font-semibold text-[#3D2870]">{formatDOT(ticket.purchasePrice)}</div>
                        </div>
                        {event.resaleEnabled && (
                          <Button variant="outline" className="border-[#3D2870] text-[#3D2870] hover:bg-[#F5F0FF]">
                            <Tag className="h-4 w-4 mr-2" />
                            List for Resale
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* How to List */}
      <Card className="mt-8 border-[#E8E3F5]">
        <CardContent className="py-6">
          <h3 className="font-semibold mb-4 text-[#1a1625]">How to List for Resale</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <div className="text-lg font-bold text-[#3D2870] mb-1">1</div>
              <p className="text-sm text-gray-600">
                Click "List for Resale" on any ticket you own
              </p>
            </div>
            <div>
              <div className="text-lg font-bold text-[#3D2870] mb-1">2</div>
              <p className="text-sm text-gray-600">
                Set your price (within the event's resale cap)
              </p>
            </div>
            <div>
              <div className="text-lg font-bold text-[#3D2870] mb-1">3</div>
              <p className="text-sm text-gray-600">
                Receive payment directly when someone buys
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
