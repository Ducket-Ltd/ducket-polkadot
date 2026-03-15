import { useMemo } from 'react'
import { useReadContracts } from 'wagmi'
import { useEventData } from '@/hooks/useEventData'
import { CONTRACT_ADDRESS, DUCKET_ABI } from '@/lib/contract'
import { ALL_TIER_TOKEN_IDS, TOKEN_ID_TO_EVENT_ID, EVENT_METADATA } from '@/data/eventMetadata'

const SCAN_DEPTH = 10

export interface ActiveListing {
  tokenId: number
  ticketNumber: number
  seller: `0x${string}`
  price: bigint          // USDC 6-decimal if isStablecoin
  isStablecoin: boolean
  eventId: number
  eventName: string
  tierName: string
  maxResalePrice: bigint // stablePrice * maxResalePercentage / 100
}

export function useResaleListings(): {
  listings: ActiveListing[]
  isLoading: boolean
  refetch: () => void
} {
  const { events, isLoading: eventsLoading } = useEventData()

  // Build a map of tokenId -> { stablePrice, tierName } from events data
  const tierDataMap = useMemo(() => {
    const map: Record<number, { stablePrice: bigint; tierName: string; eventMaxResalePercentage: number }> = {}
    for (const event of events) {
      for (const tier of event.tiers) {
        map[tier.tokenId] = {
          stablePrice: tier.stablePrice,
          tierName: tier.tierName,
          eventMaxResalePercentage: event.maxResalePercentage,
        }
      }
    }
    return map
  }, [events])

  // Build the flat contracts array — for each tokenId, scan ticketNumbers 0..min(SCAN_DEPTH, minted)
  // We also build an index map to recover (tokenId, ticketNumber) from flat index
  const { contracts, indexMap } = useMemo(() => {
    const contractsList: {
      address: `0x${string}`
      abi: typeof DUCKET_ABI
      functionName: 'resaleListings'
      args: readonly [bigint, bigint]
    }[] = []
    const indexMapList: Array<{ tokenId: number; ticketNumber: number }> = []

    for (const tokenId of ALL_TIER_TOKEN_IDS) {
      // Fall back to SCAN_DEPTH if we don't have minted data yet
      let scanLimit = SCAN_DEPTH
      if (events.length > 0) {
        const eventId = TOKEN_ID_TO_EVENT_ID[tokenId]
        const event = events.find((e) => e.eventId === eventId)
        const tier = event?.tiers.find((t) => t.tokenId === tokenId)
        if (tier) {
          scanLimit = Math.min(SCAN_DEPTH, Number(tier.minted))
        } else {
          scanLimit = 0
        }
      }

      for (let ticketNumber = 0; ticketNumber < scanLimit; ticketNumber++) {
        contractsList.push({
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: DUCKET_ABI,
          functionName: 'resaleListings',
          args: [BigInt(tokenId), BigInt(ticketNumber)] as const,
        })
        indexMapList.push({ tokenId, ticketNumber })
      }
    }

    return { contracts: contractsList, indexMap: indexMapList }
  }, [events, tierDataMap])

  const { data, isLoading: contractsLoading, refetch } = useReadContracts({
    contracts,
    query: { enabled: events.length > 0 && contracts.length > 0 },
  })

  const listings = useMemo<ActiveListing[]>(() => {
    if (!data) return []

    const acc: ActiveListing[] = []

    for (let i = 0; i < data.length; i++) {
      const entry = data[i]
      if (entry.status !== 'success') continue

      const raw = entry.result as unknown as [
        seller: `0x${string}`,
        price: bigint,
        active: boolean,
        isStablecoin: boolean,
      ]
      const [seller, price, active, isStablecoin] = raw

      if (!active || seller === '0x0000000000000000000000000000000000000000') continue

      const { tokenId, ticketNumber } = indexMap[i]
      const eventId = TOKEN_ID_TO_EVENT_ID[tokenId]
      const eventMeta = EVENT_METADATA[eventId]
      const tierMeta = eventMeta?.tiers[tokenId]
      const tierInfo = tierDataMap[tokenId]

      if (!eventMeta || !tierMeta || !tierInfo) continue

      const maxResalePrice = (tierInfo.stablePrice * BigInt(tierInfo.eventMaxResalePercentage)) / 100n

      acc.push({
        tokenId,
        ticketNumber,
        seller,
        price,
        isStablecoin,
        eventId,
        eventName: eventMeta.name,
        tierName: tierInfo.tierName || tierMeta.name,
        maxResalePrice,
      })
    }

    return acc
  }, [data, indexMap, tierDataMap])

  return {
    listings,
    isLoading: eventsLoading || contractsLoading,
    refetch: () => { refetch() },
  }
}
