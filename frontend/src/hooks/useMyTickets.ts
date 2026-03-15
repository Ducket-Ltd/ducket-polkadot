import { useMemo } from 'react'
import { useReadContracts, useAccount } from 'wagmi'
import { CONTRACT_ADDRESS, DUCKET_ABI } from '@/lib/contract'
import { ALL_TIER_TOKEN_IDS, TOKEN_ID_TO_EVENT_ID, EVENT_METADATA } from '@/data/eventMetadata'

export interface OwnedTier {
  tokenId: number
  tierName: string
  description: string
  quantity: number
}

export interface OwnedTicketGroup {
  eventId: number
  eventName: string
  eventImageUrl: string
  tiers: OwnedTier[]
}

export function useMyTickets() {
  const { address } = useAccount()

  const contracts = ALL_TIER_TOKEN_IDS.map((tokenId) => ({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: DUCKET_ABI,
    functionName: 'balanceOf' as const,
    args: [address!, BigInt(tokenId)] as const,
  }))

  const { data, isLoading, refetch } = useReadContracts({
    contracts,
    query: { enabled: !!address },
  })

  const ownedByEvent = useMemo<OwnedTicketGroup[]>(() => {
    if (!data || !address) return []

    // eventId → OwnedTicketGroup (using Map to preserve insertion order)
    const grouped = new Map<number, OwnedTicketGroup>()

    ALL_TIER_TOKEN_IDS.forEach((tokenId, idx) => {
      const entry = data[idx]
      if (entry.status !== 'success') return

      const balance = entry.result as bigint
      if (balance <= 0n) return

      const eventId = TOKEN_ID_TO_EVENT_ID[tokenId]
      const meta = EVENT_METADATA[eventId]
      if (!meta) return

      const tierMeta = meta.tiers[tokenId]
      if (!tierMeta) return

      if (!grouped.has(eventId)) {
        grouped.set(eventId, {
          eventId,
          eventName: meta.name,
          eventImageUrl: meta.imageUrl,
          tiers: [],
        })
      }

      grouped.get(eventId)!.tiers.push({
        tokenId,
        tierName: tierMeta.name,
        description: tierMeta.description,
        quantity: Number(balance),
      })
    })

    return Array.from(grouped.values())
  }, [data, address])

  return { ownedByEvent, isLoading, refetch }
}
