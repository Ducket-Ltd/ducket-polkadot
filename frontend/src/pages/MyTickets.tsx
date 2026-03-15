import { Link } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useMyTickets } from '@/hooks/useMyTickets'
import { Ticket, Wallet, RefreshCw, Loader2 } from 'lucide-react'
import { WalletConnect } from '@/components/WalletConnect'

export default function MyTickets() {
  const { isConnected } = useAccount()
  const { ownedByEvent, isLoading, refetch } = useMyTickets()

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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-[#1a1625]">My Tickets</h1>
          <p className="text-gray-600">
            NFT tickets owned by your connected wallet
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="border-[#E8E3F5] hover:bg-[#F5F0FF] hover:text-[#3D2870]">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-500">
          <Loader2 className="w-10 h-10 animate-spin mb-4 text-[#3D2870]" />
          <p className="text-lg">Loading your tickets...</p>
        </div>
      ) : ownedByEvent.length === 0 ? (
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
          {ownedByEvent.map((group) => (
            <Card key={group.eventId} className="overflow-hidden border-[#E8E3F5] hover:border-[#3D2870]/30 transition-all">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-48 aspect-video md:aspect-square">
                  <img
                    src={group.eventImageUrl}
                    alt={group.eventName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="flex-1 p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-3 text-[#1a1625]">{group.eventName}</h3>
                      <div className="flex flex-wrap gap-2">
                        {group.tiers.map((tier) => (
                          <Badge key={tier.tokenId} className="bg-[#3D2870]">
                            {tier.quantity}x {tier.tierName}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 md:text-right">
                      <Link to={`/event/${group.eventId}`}>
                        <Button variant="outline" size="sm" className="border-[#3D2870] text-[#3D2870] hover:bg-[#F5F0FF]">
                          View Event
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      )}
    </main>
  )
}
