import { useState, useRef, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { DUCKET_ABI, MOCK_USDC_ABI, CONTRACT_ADDRESS, MOCK_USDC_ADDRESS } from '@/lib/contract'
import type { ActiveListing } from '@/hooks/useResaleListings'

export type ResalePurchaseStep =
  | 'idle'
  | 'approving'
  | 'approve-confirming'
  | 'purchasing'
  | 'purchase-confirming'
  | 'success'
  | 'error'

export function useResalePurchase(): {
  step: ResalePurchaseStep
  stepLabel: string
  isPending: boolean
  errorMessage: string
  isSuccess: boolean
  buy: (listing: ActiveListing) => void
  reset: () => void
} {
  const { address } = useAccount()
  const [step, setStep] = useState<ResalePurchaseStep>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const listingRef = useRef<ActiveListing | null>(null)

  // Read current USDC allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: MOCK_USDC_ADDRESS as `0x${string}`,
    abi: MOCK_USDC_ABI,
    functionName: 'allowance',
    args: [address as `0x${string}`, CONTRACT_ADDRESS as `0x${string}`],
    query: { enabled: !!address },
  })

  // Single shared writeContract instance (per Phase 3 locked decision)
  const {
    writeContract,
    data: txHash,
    error: writeError,
    isPending: isWritePending,
    reset: resetWrite,
  } = useWriteContract()

  // Wait for transaction confirmation
  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
    query: { enabled: !!txHash },
  })

  const executePurchase = () => {
    const listing = listingRef.current
    if (!listing) return

    setStep('purchasing')
    writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: DUCKET_ABI,
      functionName: 'buyResaleTicketWithToken',
      args: [BigInt(listing.tokenId), BigInt(listing.ticketNumber)],
    })
  }

  // Handle transaction confirmations
  useEffect(() => {
    if (!isConfirmed) return

    if (step === 'approve-confirming') {
      refetchAllowance().then(() => {
        executePurchase()
      })
    } else if (step === 'purchase-confirming') {
      setStep('success')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConfirmed])

  // Track when txHash appears after writeContract calls
  useEffect(() => {
    if (!txHash) return

    if (step === 'approving') {
      setStep('approve-confirming')
    } else if (step === 'purchasing') {
      setStep('purchase-confirming')
    }
  }, [txHash, step])

  // Handle write errors
  useEffect(() => {
    if (!writeError) return

    setStep('error')
    const msg = writeError.message || 'Transaction failed'
    // Detect stale connector (wagmi reconnection bug)
    if (msg.includes('getChainId') && msg.includes('is not a function')) {
      setErrorMessage('Wallet connection stale — please disconnect and reconnect your wallet')
      return
    }
    // Trim to a reasonable length for display
    setErrorMessage(msg.length > 120 ? msg.slice(0, 120) + '...' : msg)
  }, [writeError])

  const buy = (listing: ActiveListing) => {
    if (!address) return

    // Guard against zero-address (contract not deployed)
    if (CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
      setStep('error')
      setErrorMessage('Contract not deployed. Set VITE_CONTRACT_ADDRESS in .env')
      return
    }

    listingRef.current = listing

    if (!listing.isStablecoin) {
      // DOT path — send native value
      setStep('purchasing')
      writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: DUCKET_ABI,
        functionName: 'buyResaleTicket',
        args: [BigInt(listing.tokenId), BigInt(listing.ticketNumber)],
        value: listing.price,
      })
    } else {
      // USDC path — approve+buy
      if (MOCK_USDC_ADDRESS === '0x0000000000000000000000000000000000000000') {
        setStep('error')
        setErrorMessage('USDC contract not deployed. Set VITE_MOCK_USDC_ADDRESS in .env')
        return
      }

      const currentAllowance = allowance ?? 0n
      if (currentAllowance < listing.price) {
        setStep('approving')
        writeContract({
          address: MOCK_USDC_ADDRESS as `0x${string}`,
          abi: MOCK_USDC_ABI,
          functionName: 'approve',
          args: [CONTRACT_ADDRESS as `0x${string}`, listing.price],
        })
      } else {
        // Allowance already sufficient — skip straight to purchase
        setStep('purchasing')
        writeContract({
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: DUCKET_ABI,
          functionName: 'buyResaleTicketWithToken',
          args: [BigInt(listing.tokenId), BigInt(listing.ticketNumber)],
        })
      }
    }
  }

  const reset = () => {
    setStep('idle')
    setErrorMessage('')
    listingRef.current = null
    resetWrite()
  }

  // Compute stepLabel
  let stepLabel: string
  if (step === 'approving' || step === 'approve-confirming') {
    stepLabel = 'Step 1/2: Approve USDC'
  } else if (step === 'purchasing' || step === 'purchase-confirming') {
    const listing = listingRef.current
    stepLabel = listing?.isStablecoin ? 'Step 2/2: Buy Ticket' : 'Buy Ticket'
  } else {
    stepLabel = 'Buy Now'
  }

  const isPending =
    isWritePending ||
    step === 'approving' ||
    step === 'approve-confirming' ||
    step === 'purchasing' ||
    step === 'purchase-confirming'

  const isSuccess = step === 'success'

  return {
    step,
    stepLabel,
    isPending,
    errorMessage,
    isSuccess,
    buy,
    reset,
  }
}
