import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface OptimisticMint {
  tokenId: number
  quantity: number
  tierName: string
  eventId: number
  eventName: string
  eventImageUrl: string
  createdAt: number
}

interface OptimisticMintStore {
  mints: OptimisticMint[]
  addMint: (mint: OptimisticMint) => void
  removeMint: (tokenId: number) => void
  clearStale: () => void
}

const STALE_THRESHOLD_MS = 5 * 60 * 1000 // 5 minutes

export const useOptimisticMintStore = create<OptimisticMintStore>()(
  persist(
    (set) => ({
      mints: [],

      addMint: (mint) =>
        set((state) => ({
          mints: [
            ...state.mints.filter((m) => m.tokenId !== mint.tokenId),
            mint,
          ],
        })),

      removeMint: (tokenId) =>
        set((state) => ({
          mints: state.mints.filter((m) => m.tokenId !== tokenId),
        })),

      clearStale: () =>
        set((state) => ({
          mints: state.mints.filter(
            (m) => Date.now() - m.createdAt < STALE_THRESHOLD_MS
          ),
        })),
    }),
    {
      name: 'ducket-optimistic-mints',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
)
