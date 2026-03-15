import { useState, useEffect } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { DUCKET_ABI, CONTRACT_ADDRESS } from '@/lib/contract'

export type ListingStep = 'idle' | 'listing' | 'confirming' | 'success' | 'error'

export function useListForResale(): {
  step: ListingStep
  errorMessage: string
  isPending: boolean
  isSuccess: boolean
  list: (tokenId: number, ticketNumber: number, price: bigint, isStablecoin: boolean) => void
  reset: () => void
} {
  const [step, setStep] = useState<ListingStep>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  // Single useWriteContract instance per Phase 3 decision — do NOT create multiple instances
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

  // Track when txHash appears: listing -> confirming
  useEffect(() => {
    if (!txHash) return
    if (step === 'listing') {
      setStep('confirming')
    }
  }, [txHash, step])

  // Track confirmation: confirming -> success
  useEffect(() => {
    if (!isConfirmed) return
    if (step === 'confirming') {
      setStep('success')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConfirmed])

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
    setErrorMessage(msg.length > 120 ? msg.slice(0, 120) + '...' : msg)
  }, [writeError])

  const list = (tokenId: number, ticketNumber: number, price: bigint, isStablecoin: boolean) => {
    // Guard against zero-address (contract not deployed)
    if (CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
      setStep('error')
      setErrorMessage('Contract not deployed. Set VITE_CONTRACT_ADDRESS in .env')
      return
    }

    setStep('listing')
    writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: DUCKET_ABI,
      functionName: 'listForResale',
      args: [BigInt(tokenId), BigInt(ticketNumber), price, isStablecoin],
    })
  }

  const reset = () => {
    setStep('idle')
    setErrorMessage('')
    resetWrite()
  }

  const isPending = isWritePending || step === 'listing' || step === 'confirming'
  const isSuccess = step === 'success'

  return { step, errorMessage, isPending, isSuccess, list, reset }
}
