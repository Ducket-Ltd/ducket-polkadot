import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Calendar,
  MapPin,
  Users,
  ArrowLeft,
  Ticket,
  Shield,
  RefreshCw,
  Loader2,
  CheckCircle,
  AlertCircle,
  Info,
} from 'lucide-react'
import { useEventData } from '@/hooks/useEventData'
import { formatDateTime, formatPAS, formatUSDC } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { WalletConnect } from '@/components/WalletConnect'
import { usePurchaseTicket, type PaymentMethod } from '@/hooks/usePurchaseTicket'

export default function Event() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isConnected } = useAccount()
  const [selectedTier, setSelectedTier] = useState<number | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('DOT')

  const { events, isLoading } = useEventData()

  const eventId = Number(id)
  const event = !isNaN(eventId) ? events.find(e => e.eventId === eventId) : undefined

  const selectedTierData = event?.tiers.find(t => t.tokenId === selectedTier)
  const selectedTierRemaining = selectedTierData
    ? Number(selectedTierData.maxSupply - selectedTierData.minted)
    : 0

  const purchase = usePurchaseTicket(selectedTier, quantity, paymentMethod, selectedTierData)

  // Reset hook and payment method when selected tier changes
  useEffect(() => {
    purchase.reset()
    setPaymentMethod('DOT')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTier])

  // Navigate to /my-tickets after success
  useEffect(() => {
    if (purchase.isSuccess) {
      const timer = setTimeout(() => navigate('/my-tickets'), 2000)
      return () => clearTimeout(timer)
    }
  }, [purchase.isSuccess, navigate])

  if (isLoading) {
    return (
      <div className="container py-16 flex flex-col items-center justify-center text-gray-500">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-[#3D2870]" />
        <p className="text-lg">Loading event...</p>
      </div>
    )
  }

  if (!event && !isLoading) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-2xl font-bold mb-4 text-[#1a1625]">Event Not Found</h1>
        <Link to="/">
          <Button className="bg-[#3D2870] hover:bg-[#6B5B95]">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
        </Link>
      </div>
    )
  }

  // At this point event is guaranteed to be defined (isLoading is false and event exists)
  if (!event) return null

  return (
    <main className="container py-8">
      {/* Back button */}
      <Link
        to="/"
        className="inline-flex items-center text-sm text-gray-600 hover:text-[#3D2870] mb-6 transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Events
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Event Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero Image */}
          <div className="relative aspect-[16/9] rounded-xl overflow-hidden">
            <img
              src={event.imageUrl}
              alt={event.name}
              className="object-cover w-full h-full"
            />
            <div className="absolute top-4 left-4">
              <Badge className="text-sm bg-[#3D2870]">{event.category}</Badge>
            </div>
          </div>

          {/* Event Details */}
          <div>
            <h1 className="text-3xl font-bold mb-4 text-[#1a1625]">{event.name}</h1>

            <div className="flex flex-wrap gap-4 text-gray-600 mb-6">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-[#3D2870]" />
                {formatDateTime(event.eventDate)}
              </div>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-[#3D2870]" />
                {event.venue}, {event.city}
              </div>
            </div>

            <p className="text-gray-600 leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* Event Rules */}
          <Card className="border-[#E8E3F5]">
            <CardHeader>
              <CardTitle className="text-lg flex items-center text-[#1a1625]">
                <Shield className="h-5 w-5 mr-2 text-[#3D2870]" />
                Ticket Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <RefreshCw className="h-5 w-5 text-[#3D2870] mt-0.5" />
                <div>
                  <p className="font-medium text-[#1a1625]">Resale</p>
                  <p className="text-sm text-gray-600">
                    {event.resaleEnabled
                      ? `Allowed up to ${event.maxResalePercentage}% of original price`
                      : 'Not allowed for this event'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-[#3D2870] mt-0.5" />
                <div>
                  <p className="font-medium text-[#1a1625]">Transfer</p>
                  <p className="text-sm text-gray-600">
                    {event.transferEnabled
                      ? 'Free transfers allowed'
                      : 'Tickets are non-transferable'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ticket Selection */}
        <div className="space-y-4">
          <Card className="sticky top-24 border-[#E8E3F5]">
            <CardHeader>
              <CardTitle className="flex items-center text-[#1a1625]">
                <Ticket className="h-5 w-5 mr-2 text-[#3D2870]" />
                Select Tickets
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {event.tiers.map((tier) => {
                const remaining = Number(tier.maxSupply - tier.minted)
                const soldOut = tier.minted >= tier.maxSupply

                return (
                  <div
                    key={tier.tokenId}
                    className={`p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                      selectedTier === tier.tokenId
                        ? 'border-[#3D2870] bg-[#F5F0FF]'
                        : 'border-[#E8E3F5] hover:border-[#6B5B95]'
                    } ${soldOut ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => !soldOut && setSelectedTier(tier.tokenId)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-[#1a1625]">{tier.tierName}</h4>
                        <p className="text-sm text-gray-600">
                          {tier.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-[#3D2870]">{formatPAS(tier.price)}</span>
                        <p className="text-xs text-gray-400">{formatUSDC(tier.stablePrice)}</p>
                        <p className="text-xs text-gray-500">
                          {soldOut ? 'Sold out' : `${remaining} left`}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}

              <Separator className="bg-[#E8E3F5]" />

              {/* Quantity selector */}
              {selectedTier !== null && selectedTierData && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#1a1625]">Quantity</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-[#E8E3F5] hover:bg-[#F5F0FF] hover:text-[#3D2870]"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center text-[#1a1625]">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-[#E8E3F5] hover:bg-[#F5F0FF] hover:text-[#3D2870]"
                      onClick={() =>
                        setQuantity(
                          Math.min(4, quantity + 1, selectedTierRemaining)
                        )
                      }
                      disabled={
                        quantity >= 4 || quantity >= selectedTierRemaining
                      }
                    >
                      +
                    </Button>
                  </div>
                </div>
              )}

              {/* Payment Method Selector */}
              {selectedTier !== null && selectedTierData && (
                <div className="space-y-2">
                  <span className="text-sm font-medium text-[#1a1625]">Pay with</span>
                  <div className="flex gap-2">
                    {(['DOT', 'USDC'] as const).map((method) => (
                      <button
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        disabled={method === 'USDC' && selectedTierData.stablePrice === 0n}
                        className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                          paymentMethod === method
                            ? 'border-[#3D2870] bg-[#3D2870] text-white'
                            : 'border-[#E8E3F5] text-[#1a1625] hover:border-[#6B5B95]'
                        } disabled:opacity-40 disabled:cursor-not-allowed`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Total */}
              {selectedTierData && (
                <div className="flex items-center justify-between py-2">
                  <span className="font-semibold text-[#1a1625]">Total</span>
                  <span className="text-xl font-bold text-[#3D2870]">
                    {paymentMethod === 'DOT'
                      ? formatPAS(selectedTierData.price * BigInt(quantity))
                      : formatUSDC(selectedTierData.stablePrice * BigInt(quantity))}
                  </span>
                </div>
              )}

              {/* Fee breakdown */}
              {selectedTierData && (
                <div className="flex items-center justify-between text-xs text-gray-500 -mt-1 pb-1">
                  <span className="flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Platform fee (2.5%)
                  </span>
                  <span>
                    {paymentMethod === 'DOT'
                      ? formatPAS((selectedTierData.price * BigInt(quantity) * 250n) / 10000n)
                      : formatUSDC((selectedTierData.stablePrice * BigInt(quantity) * 250n) / 10000n)}
                  </span>
                </div>
              )}

              {/* Purchase button */}
              {isConnected ? (
                <Button
                  className="w-full bg-[#3D2870] hover:bg-[#6B5B95]"
                  size="lg"
                  disabled={selectedTier === null || purchase.isPending || purchase.isSuccess}
                  onClick={() => purchase.execute()}
                >
                  {purchase.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Confirming...
                    </>
                  ) : purchase.isSuccess ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Purchase Complete!
                    </>
                  ) : (
                    'Purchase Tickets'
                  )}
                </Button>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-3">
                    Connect your wallet to purchase tickets
                  </p>
                  <div className="w-full">
                    <WalletConnect />
                  </div>
                </div>
              )}

              {/* Purchase Step Indicator */}
              {purchase.step !== 'idle' && purchase.step !== 'error' && (
                <div className="p-3 rounded-lg border border-[#E8E3F5] bg-[#F5F0FF]">
                  <p className="text-sm font-semibold text-[#1a1625]">{purchase.stepLabel}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {purchase.step === 'approving' || purchase.step === 'purchasing'
                      ? 'Confirm in your wallet...'
                      : purchase.step === 'approve-confirming' || purchase.step === 'purchase-confirming'
                      ? 'Waiting for confirmation...'
                      : purchase.step === 'success'
                      ? 'Transaction confirmed!'
                      : ''}
                  </p>
                </div>
              )}

              {/* Error Display */}
              {purchase.step === 'error' && (
                <div className="p-3 rounded-lg border border-red-200 bg-red-50">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <p className="text-sm font-semibold text-red-700">Transaction Failed</p>
                  </div>
                  <p className="text-xs text-red-600 mt-1">{purchase.errorMessage}</p>
                  <button
                    onClick={() => purchase.reset()}
                    className="text-xs text-red-700 underline mt-2"
                  >
                    Try again
                  </button>
                </div>
              )}

              <div className="flex items-center justify-center gap-1.5 text-xs text-[#3D2870] bg-[#F5F0FF] rounded-lg py-2 px-3 mt-2">
                <Shield className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Verified on Polkadot — tickets are on-chain NFTs</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
