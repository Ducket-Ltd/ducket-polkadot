import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
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
import { useOptimisticMintStore } from '@/stores/optimisticMints'
import { useXcmVerification } from '@/hooks/useXcmVerification'
import { useResaleListings } from '@/hooks/useResaleListings'
import { TicketQRCode } from '@/components/TicketQRCode'
import { TOKEN_ID_TO_EVENT_ID } from '@/data/eventMetadata'
import { formatUSDC } from '@/lib/utils'
import { COPY } from '@/constants/copy'
import { Ticket, Wallet, RefreshCw, Loader2, Tag, CheckCircle, AlertCircle, ExternalLink, Shield } from 'lucide-react'
import { WalletConnect } from '@/components/WalletConnect'

interface ListingTarget {
  tokenId: number
  eventId: number
  tierName: string
  eventName: string
}

export default function MyTickets() {
  const { isConnected, address } = useAccount()
  const { ownedByEvent, isLoading, refetch } = useMyTickets()
  const { events } = useEventData()

  const [listingTarget, setListingTarget] = useState<ListingTarget | null>(null)
  const [priceInput, setPriceInput] = useState('')
  const [priceError, setPriceError] = useState('')

  const { step, errorMessage, isPending, isSuccess, list, reset } = useListForResale()
  const { listings: resaleListings } = useResaleListings()
  const { mints: optimisticMints, removeMint, clearStale } = useOptimisticMintStore()

  // Set of tokenIds that the current user has listed for resale
  const listedTokenIds = new Set(
    resaleListings
      .filter((l) => l.seller.toLowerCase() === address?.toLowerCase())
      .map((l) => l.tokenId)
  )

  // XCM verification state — persist in localStorage
  const [verifications, setVerifications] = useState<Map<number, string>>(() => {
    try {
      const stored = localStorage.getItem('ducket_verifications')
      if (stored) return new Map(JSON.parse(stored))
    } catch {}
    return new Map()
  })
  const [activeVerifyTokenId, setActiveVerifyTokenId] = useState<number | null>(null)
  const { step: xcmStep, errorMessage: xcmError, isPending: xcmPending, isSuccess: xcmSuccess, txHash: xcmTxHash, verify: xcmVerify, reset: xcmReset } = useXcmVerification()

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

  // Track verification success and store tx hash
  useEffect(() => {
    if (xcmSuccess && xcmTxHash && activeVerifyTokenId !== null) {
      setVerifications(prev => {
        const next = new Map(prev).set(activeVerifyTokenId, xcmTxHash)
        localStorage.setItem('ducket_verifications', JSON.stringify([...next]))
        return next
      })
      const timer = setTimeout(() => {
        setActiveVerifyTokenId(null)
        xcmReset()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [xcmSuccess, xcmTxHash, activeVerifyTokenId, xcmReset])

  // Clear stale optimistic mints (older than 5 min) on mount
  useEffect(() => {
    clearStale()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Reconcile optimistic mints against real chain data
  useEffect(() => {
    optimisticMints.forEach((om) => {
      const group = ownedByEvent.find((g) => g.eventId === om.eventId)
      if (!group) return
      const realTier = group.tiers.find((t) => t.tokenId === om.tokenId)
      if (realTier && realTier.quantity >= om.quantity) {
        removeMint(om.tokenId)
      }
    })
  }, [ownedByEvent, optimisticMints, removeMint])

  const handleVerify = (tokenId: number) => {
    setActiveVerifyTokenId(tokenId)
    xcmReset()
    xcmVerify(tokenId)
  }

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

  // Compute prices from events data
  const getTierPriceInfo = (tokenId: number): { originalPrice: bigint; maxResalePrice: bigint } | null => {
    const eventId = TOKEN_ID_TO_EVENT_ID[tokenId]
    const event = events.find((e) => e.eventId === eventId)
    if (!event) return null
    const tier = event.tiers.find((t) => t.tokenId === tokenId)
    if (!tier) return null
    return {
      originalPrice: tier.stablePrice,
      maxResalePrice: (tier.stablePrice * BigInt(event.maxResalePercentage)) / 100n,
    }
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
    const priceInfo = getTierPriceInfo(listingTarget.tokenId)

    if (priceInfo !== null && priceBigint > priceInfo.maxResalePrice) {
      setPriceError(`Price exceeds max allowed: ${formatUSDC(priceInfo.maxResalePrice)}`)
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
          <h1 className="text-2xl font-bold mb-4 text-foreground">{COPY.MY_TICKETS.CONNECT_PROMPT_TITLE}</h1>
          <p className="text-gray-600 mb-6">
            {COPY.MY_TICKETS.CONNECT_PROMPT_SUBTITLE}
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
          <h1 className="text-3xl font-bold mb-2 text-foreground">{COPY.MY_TICKETS.PAGE_TITLE}</h1>
          <p className="text-gray-600">
            {COPY.MY_TICKETS.PAGE_SUBTITLE}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="border-border hover:bg-secondary hover:text-primary">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-500">
          <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
          <p className="text-lg">Loading your tickets...</p>
        </div>
      ) : ownedByEvent.length === 0 && optimisticMints.length === 0 ? (
        <Card className="border-border">
          <CardContent className="py-16 text-center">
            <Ticket className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2 text-foreground">{COPY.MY_TICKETS.EMPTY_STATE_TITLE}</h2>
            <p className="text-gray-600 mb-6">
              {COPY.MY_TICKETS.EMPTY_STATE_SUBTITLE}
            </p>
            <Link to="/">
              <Button className="bg-primary hover:bg-primary-light">Browse Events</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {/* Optimistic minting cards — shown above confirmed tickets */}
          {optimisticMints.map((om, index) => (
            <motion.div
              key={`optimistic-${om.tokenId}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut', delay: index * 0.07 }}
            >
              <Card className="overflow-hidden border-border opacity-80">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-48 aspect-video md:aspect-square">
                    <img
                      src={om.eventImageUrl}
                      alt={om.eventName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="flex-1 p-6">
                    <h3 className="text-xl font-semibold mb-4 text-foreground">{om.eventName}</h3>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-4 p-3 rounded-lg bg-secondary border border-border animate-pulse">
                        {/* Placeholder for QR area */}
                        <div className="flex-shrink-0 w-24 h-24 rounded bg-gray-200" />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <Badge className="bg-gray-400 text-white">
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              Minting...
                            </Badge>
                            <span className="text-sm text-gray-600">{om.quantity}x {om.tierName}</span>
                          </div>
                          <p className="text-xs text-gray-500">Waiting for on-chain confirmation...</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            </motion.div>
          ))}

          {ownedByEvent.map((group, index) => (
            <motion.div
              key={group.eventId}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut', delay: index * 0.07 }}
              viewport={{ once: true }}
            >
            <Card className="overflow-hidden border-border hover:border-primary/30 transition-all">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-48 aspect-video md:aspect-square">
                  <img
                    src={group.eventImageUrl}
                    alt={group.eventName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="flex-1 p-6">
                  <h3 className="text-xl font-semibold mb-4 text-foreground">{group.eventName}</h3>
                  <div className="flex flex-col gap-4">
                    {group.tiers.map((tier) => (
                      <div
                        key={tier.tokenId}
                        className="flex items-center gap-4 p-3 rounded-lg bg-secondary border border-border"
                      >
                        {/* QR code */}
                        <div className="flex-shrink-0">
                          <TicketQRCode tokenId={tier.tokenId} size={96} />
                        </div>
                        {/* Tier info + action */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <Badge className="bg-primary">
                              {tier.quantity}x {tier.tierName}
                            </Badge>
                            {listedTokenIds.has(tier.tokenId) && (
                              <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-50">
                                <Tag className="h-3 w-3 mr-1" />
                                Listed for Resale
                              </Badge>
                            )}
                            {tier.description && (
                              <span className="text-sm text-gray-600 truncate">{tier.description}</span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-primary text-primary hover:bg-primary hover:text-white transition-colors"
                              onClick={() => openListingModal(tier.tokenId, tier.tierName, group.eventName)}
                              disabled={listedTokenIds.has(tier.tokenId)}
                            >
                              <Tag className="h-3 w-3 mr-1" />
                              {listedTokenIds.has(tier.tokenId) ? 'Already Listed' : 'List for Resale'}
                            </Button>
                            {!verifications.has(tier.tokenId) && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-green-600 text-green-700 hover:bg-green-600 hover:text-white transition-colors"
                                onClick={() => handleVerify(tier.tokenId)}
                                disabled={xcmPending && activeVerifyTokenId === tier.tokenId}
                              >
                                {xcmPending && activeVerifyTokenId === tier.tokenId ? (
                                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                ) : (
                                  <Shield className="h-3 w-3 mr-1" />
                                )}
                                {xcmPending && activeVerifyTokenId === tier.tokenId
                                  ? (xcmStep === 'verifying' ? 'Confirm in wallet...' : 'Confirming...')
                                  : COPY.MY_TICKETS.VERIFY_OWNERSHIP_LABEL}
                              </Button>
                            )}
                          </div>
                          {xcmStep === 'error' && activeVerifyTokenId === tier.tokenId && (
                            <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                              <AlertCircle className="h-3 w-3" />
                              {xcmError}
                            </p>
                          )}
                          {verifications.has(tier.tokenId) && (
                            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded p-2 mt-2">
                              <CheckCircle className="h-4 w-4" />
                              <span>Cross-chain attestation emitted</span>
                              <a
                                href={`https://blockscout-testnet.polkadot.io/tx/${verifications.get(tier.tokenId)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary underline text-xs flex items-center gap-0.5"
                              >
                                View on-chain <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Link to={`/event/${group.eventId}`}>
                      <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-secondary">
                        View Event
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </div>
            </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* List for Resale Modal */}
      <Dialog open={!!listingTarget} onOpenChange={(open) => { if (!open) closeModal() }}>
        <DialogContent className="sm:max-w-md">
          {listingTarget && (() => {
            const priceInfo = getTierPriceInfo(listingTarget.tokenId)
            const parsedPrice = parseFloat(priceInput)
            const liveMarkup = priceInfo && !isNaN(parsedPrice) && parsedPrice > 0
              ? ((parsedPrice * 1_000_000) / Number(priceInfo.originalPrice) * 100 - 100).toFixed(1)
              : null
            return (
              <>
                <DialogHeader>
                  <DialogTitle>List Ticket for Resale</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Event + tier info */}
                  <div>
                    <p className="text-sm text-gray-500">{listingTarget.eventName}</p>
                    <p className="font-medium text-foreground">{listingTarget.tierName}</p>
                  </div>

                  {/* Price info banner */}
                  {priceInfo !== null && (
                    <div className="bg-secondary border border-border rounded-lg p-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Original price</span>
                        <span className="font-semibold text-foreground">{formatUSDC(priceInfo.originalPrice)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Max resale price</span>
                        <span className="font-semibold text-primary">{formatUSDC(priceInfo.maxResalePrice)}</span>
                      </div>
                      {liveMarkup !== null && (
                        <div className="flex justify-between items-center pt-1 border-t border-border">
                          <span className="text-xs text-gray-500">Your markup</span>
                          <Badge className={
                            parseFloat(liveMarkup) <= 0
                              ? 'bg-green-500 text-white'
                              : parseFloat(liveMarkup) <= 20
                              ? 'bg-amber-500 text-white'
                              : 'bg-orange-500 text-white'
                          }>
                            {parseFloat(liveMarkup) <= 0 ? 'At or below face value' : `+${liveMarkup}%`}
                          </Badge>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Price input */}
                  {step !== 'success' && (
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">
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
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      Confirm in wallet...
                    </div>
                  )}
                  {step === 'confirming' && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded p-3">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
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
                        className="flex-1 bg-primary hover:bg-primary-light"
                        onClick={closeModal}
                      >
                        Close
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          className="flex-1 border-border hover:bg-secondary"
                          onClick={closeModal}
                          disabled={isPending}
                        >
                          Cancel
                        </Button>
                        <Button
                          className="flex-1 bg-primary hover:bg-primary-light disabled:opacity-50"
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
