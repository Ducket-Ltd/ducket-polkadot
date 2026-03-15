import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useMyTickets } from '@/hooks/useMyTickets'
import { useEventData } from '@/hooks/useEventData'
import { useListForResale } from '@/hooks/useListForResale'
import { TicketQRCode } from '@/components/TicketQRCode'
import { TOKEN_ID_TO_EVENT_ID } from '@/data/eventMetadata'
import { formatUSDC } from '@/lib/utils'
import { Ticket, Wallet, RefreshCw, Loader2, Tag, CheckCircle, AlertCircle } from 'lucide-react'
import { WalletConnect } from '@/components/WalletConnect'

interface ListingTarget {
  tokenId: number
  eventId: number
  tierName: string
  eventName: string
}

export default function MyTickets() {
  const { isConnected } = useAccount()
  const { ownedByEvent, isLoading, refetch } = useMyTickets()
  const { events } = useEventData()

  const [listingTarget, setListingTarget] = useState<ListingTarget | null>(null)
  const [priceInput, setPriceInput] = useState('')
  const [priceError, setPriceError] = useState('')

  const { step, errorMessage, isPending, isSuccess, list, reset } = useListForResale()

  // Close modal and reset after success (brief delay)
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        setListingTarget(null)
        setPriceInput('')
        setPriceError('')
        reset()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isSuccess, reset])

  // Reset form when modal opens/closes
  const openListingModal = (tokenId: number, tierName: string, eventName: string) => {
    const eventId = TOKEN_ID_TO_EVENT_ID[tokenId]
    setListingTarget({ tokenId, eventId, tierName, eventName })
    setPriceInput('')
    setPriceError('')
    reset()
  }

  const closeModal = () => {
    setListingTarget(null)
    setPriceInput('')
    setPriceError('')
    reset()
  }

  // Compute max resale price from events data
  const getMaxResalePrice = (tokenId: number): bigint | null => {
    const eventId = TOKEN_ID_TO_EVENT_ID[tokenId]
    const event = events.find((e) => e.eventId === eventId)
    if (!event) return null
    const tier = event.tiers.find((t) => t.tokenId === tokenId)
    if (!tier) return null
    return (tier.stablePrice * BigInt(event.maxResalePercentage)) / 100n
  }

  const handleSubmit = () => {
    if (!listingTarget) return
    setPriceError('')

    const parsed = parseFloat(priceInput)
    if (isNaN(parsed) || parsed <= 0) {
      setPriceError('Please enter a valid price greater than 0')
      return
    }

    const priceBigint = BigInt(Math.round(parsed * 1_000_000))
    const maxResalePrice = getMaxResalePrice(listingTarget.tokenId)

    if (maxResalePrice !== null && priceBigint > maxResalePrice) {
      setPriceError(`Price exceeds max allowed: ${formatUSDC(maxResalePrice)}`)
      return
    }

    // ticketNumber=0 for demo, isStablecoin=true (USDC-only)
    list(listingTarget.tokenId, 0, priceBigint, true)
  }

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
                  <h3 className="text-xl font-semibold mb-4 text-[#1a1625]">{group.eventName}</h3>
                  <div className="flex flex-col gap-4">
                    {group.tiers.map((tier) => (
                      <div
                        key={tier.tokenId}
                        className="flex items-center gap-4 p-3 rounded-lg bg-[#F5F0FF] border border-[#E8E3F5]"
                      >
                        {/* QR code */}
                        <div className="flex-shrink-0">
                          <TicketQRCode tokenId={tier.tokenId} size={96} />
                        </div>
                        {/* Tier info + action */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <Badge className="bg-[#3D2870]">
                              {tier.quantity}x {tier.tierName}
                            </Badge>
                            {tier.description && (
                              <span className="text-sm text-gray-600 truncate">{tier.description}</span>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-[#3D2870] text-[#3D2870] hover:bg-[#3D2870] hover:text-white transition-colors"
                            onClick={() => openListingModal(tier.tokenId, tier.tierName, group.eventName)}
                          >
                            <Tag className="h-3 w-3 mr-1" />
                            List for Resale
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Link to={`/event/${group.eventId}`}>
                      <Button variant="outline" size="sm" className="border-[#3D2870] text-[#3D2870] hover:bg-[#F5F0FF]">
                        View Event
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* List for Resale Modal */}
      <Dialog open={!!listingTarget} onOpenChange={(open) => { if (!open) closeModal() }}>
        <DialogContent className="sm:max-w-md">
          {listingTarget && (() => {
            const maxResalePrice = getMaxResalePrice(listingTarget.tokenId)
            return (
              <>
                <DialogHeader>
                  <DialogTitle>List Ticket for Resale</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Event + tier info */}
                  <div>
                    <p className="text-sm text-gray-500">{listingTarget.eventName}</p>
                    <p className="font-medium text-[#1a1625]">{listingTarget.tierName}</p>
                  </div>

                  {/* Max resale price banner */}
                  {maxResalePrice !== null && (
                    <div className="bg-[#F5F0FF] border border-[#E8E3F5] rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-0.5">Max allowed resale price</p>
                      <p className="text-lg font-semibold text-[#3D2870]">
                        {formatUSDC(maxResalePrice)}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Prices above this cap will be rejected by the contract
                      </p>
                    </div>
                  )}

                  {/* Price input */}
                  {step !== 'success' && (
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-[#1a1625]">
                        Listing price (USDC)
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="e.g. 25.00"
                        value={priceInput}
                        onChange={(e) => {
                          setPriceInput(e.target.value)
                          setPriceError('')
                        }}
                        disabled={isPending}
                      />
                      {priceError && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {priceError}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Step status */}
                  {step === 'listing' && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded p-3">
                      <Loader2 className="h-4 w-4 animate-spin text-[#3D2870]" />
                      Confirm in wallet...
                    </div>
                  )}
                  {step === 'confirming' && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded p-3">
                      <Loader2 className="h-4 w-4 animate-spin text-[#3D2870]" />
                      Confirming transaction...
                    </div>
                  )}
                  {step === 'success' && (
                    <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded p-3">
                      <CheckCircle className="h-4 w-4" />
                      Ticket listed successfully!
                    </div>
                  )}
                  {step === 'error' && errorMessage && (
                    <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 rounded p-3">
                      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-2 pt-1">
                    {step === 'success' ? (
                      <Button
                        className="flex-1 bg-[#3D2870] hover:bg-[#6B5B95]"
                        onClick={closeModal}
                      >
                        Close
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          className="flex-1 border-[#E8E3F5] hover:bg-[#F5F0FF]"
                          onClick={closeModal}
                          disabled={isPending}
                        >
                          Cancel
                        </Button>
                        <Button
                          className="flex-1 bg-[#3D2870] hover:bg-[#6B5B95] disabled:opacity-50"
                          onClick={step === 'error' ? () => { reset(); setPriceError('') } : handleSubmit}
                          disabled={isPending}
                        >
                          {isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : step === 'error' ? (
                            'Try Again'
                          ) : (
                            'List for Resale'
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </>
            )
          })()}
        </DialogContent>
      </Dialog>
    </main>
  )
}
