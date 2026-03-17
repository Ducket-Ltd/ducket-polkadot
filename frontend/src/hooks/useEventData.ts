import { useMemo, useState, useEffect } from 'react'
import { useReadContracts } from 'wagmi'
import { CONTRACT_ADDRESS, DUCKET_ABI } from '@/lib/contract'
import { EVENT_METADATA } from '@/data/eventMetadata'

export interface MergedTier {
  tokenId: number
  tierName: string
  description: string
  price: bigint       // DOT price in wei (18 decimals)
  stablePrice: bigint // USDC price (6 decimals)
  maxSupply: bigint
  minted: bigint
  exists: boolean
}

export interface MergedEvent {
  eventId: number
  // On-chain
  eventDate: Date
  maxResalePercentage: number
  totalSupply: bigint
  maxTicketsPerWallet: bigint
  resaleEnabled: boolean
  transferEnabled: boolean
  organizer: string
  // Metadata
  name: string
  description: string
  imageUrl: string
  venue: string
  city: string
  country: string
  category: string
  // Merged tiers
  tiers: MergedTier[]
}

export function useEventData() {
  const eventIds = Object.keys(EVENT_METADATA).map(Number) // [1, 2, 3, 4, 5, 6]

  // Build ordered list of all tokenIds per event (in eventId order)
  const allTokenIds: number[] = eventIds.flatMap((eventId) =>
    Object.keys(EVENT_METADATA[eventId].tiers).map(Number)
  )

  // 6 getEvent calls + 12 getTicketTier calls = 18 total
  const contracts = [
    ...eventIds.map((eventId) => ({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: DUCKET_ABI,
      functionName: 'getEvent' as const,
      args: [BigInt(eventId)] as const,
    })),
    ...allTokenIds.map((tokenId) => ({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: DUCKET_ABI,
      functionName: 'getTicketTier' as const,
      args: [BigInt(tokenId)] as const,
    })),
  ]

  const { data, isLoading, isError, refetch } = useReadContracts({ contracts })

  const [isTimedOut, setIsTimedOut] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      setIsTimedOut(false)
      return
    }
    const timer = setTimeout(() => setIsTimedOut(true), 8000)
    return () => clearTimeout(timer)
  }, [isLoading])

  const events = useMemo<MergedEvent[]>(() => {
    if (!data) return []

    const eventResults = data.slice(0, eventIds.length)
    const tierResults = data.slice(eventIds.length)

    // Build a tokenId → tier result index map
    const tidToIdx: Record<number, number> = {}
    allTokenIds.forEach((tokenId, idx) => {
      tidToIdx[tokenId] = idx
    })

    const merged: MergedEvent[] = []

    for (let i = 0; i < eventIds.length; i++) {
      const eventId = eventIds[i]
      const eventEntry = eventResults[i]
      if (eventEntry.status !== 'success') continue

      const onChainEvent = eventEntry.result as {
        eventName: string
        eventDate: bigint
        organizer: string
        maxResalePercentage: number
        totalSupply: bigint
        maxTicketsPerWallet: bigint
        resaleEnabled: boolean
        transferEnabled: boolean
        exists: boolean
      }

      if (!onChainEvent.exists) continue

      const meta = EVENT_METADATA[eventId]
      const tierTokenIds = Object.keys(meta.tiers).map(Number)

      const tiers: MergedTier[] = []
      for (const tokenId of tierTokenIds) {
        const tierIdx = tidToIdx[tokenId]
        if (tierIdx === undefined) continue
        const tierEntry = tierResults[tierIdx]
        if (tierEntry.status !== 'success') continue

        const onChainTier = tierEntry.result as {
          eventId: bigint
          tierName: string
          seatPrefix: string
          price: bigint
          stablePrice: bigint
          maxSupply: bigint
          minted: bigint
          exists: boolean
        }

        tiers.push({
          tokenId,
          tierName: onChainTier.tierName,
          description: meta.tiers[tokenId].description,
          price: onChainTier.price,
          stablePrice: onChainTier.stablePrice,
          maxSupply: onChainTier.maxSupply,
          minted: onChainTier.minted,
          exists: onChainTier.exists,
        })
      }

      merged.push({
        eventId,
        eventDate: new Date(Number(onChainEvent.eventDate) * 1000),
        maxResalePercentage: onChainEvent.maxResalePercentage,
        totalSupply: onChainEvent.totalSupply,
        maxTicketsPerWallet: onChainEvent.maxTicketsPerWallet,
        resaleEnabled: onChainEvent.resaleEnabled,
        transferEnabled: onChainEvent.transferEnabled,
        organizer: onChainEvent.organizer,
        name: meta.name,
        description: meta.description,
        imageUrl: meta.imageUrl,
        venue: meta.venue,
        city: meta.city,
        country: meta.country,
        category: meta.category,
        tiers,
      })
    }

    return merged
  }, [data, eventIds, allTokenIds])

  return { events, isLoading, isError, isTimedOut, refetch }
}
