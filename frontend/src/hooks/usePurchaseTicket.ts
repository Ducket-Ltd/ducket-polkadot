import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { DUCKET_ABI, MOCK_USDC_ABI, CONTRACT_ADDRESS, MOCK_USDC_ADDRESS } from '@/lib/contract'
import type { MergedTier } from '@/hooks/useEventData'

export type PurchaseStep =
  | 'idle'
  | 'approving'
  | 'approve-confirming'
  | 'purchasing'
  | 'purchase-confirming'
  | 'success'
  | 'error'

export type PaymentMethod = 'DOT' | 'USDC'

export function usePurchaseTicket(
  tokenId: number | null,
  quantity: number,
  paymentMethod: PaymentMethod,
  tier: MergedTier | undefined
): {
  step: PurchaseStep
  needsApprove: boolean
  stepLabel: string
  isPending: boolean
  errorMessage: string
  isSuccess: boolean
  execute: () => void
  reset: () => void
} {
  const { address } = useAccount()
  const [step, setStep] = useState<PurchaseStep>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const totalStablePrice = tier ? tier.stablePrice * BigInt(quantity) : 0n

  // Read current USDC allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: MOCK_USDC_ADDRESS as `0x${string}`,
    abi: MOCK_USDC_ABI,
    functionName: 'allowance',
    args: [address as `0x${string}`, CONTRACT_ADDRESS as `0x${string}`],
    query: { enabled: !!address && paymentMethod === 'USDC' },
  })

  const needsApprove =
    paymentMethod === 'USDC' && (!allowance || allowance < totalStablePrice)

  // Single shared writeContract instance
  const { writeContract, data: txHash, error: writeError, isPending: isWritePending, reset: resetWrite } = useWriteContract()

  // Wait for transaction confirmation
  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
    query: { enabled: !!txHash },
  })

  // Execute purchase after allowance is sufficient
  const executePurchase = () => {
    if (!address || tokenId === null || !tier) return

    setStep('purchasing')
    writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: DUCKET_ABI,
      functionName: 'mintTicketWithToken',
      args: [BigInt(tokenId), address as `0x${string}`, BigInt(quantity)],
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
    // Trim to a reasonable length for display
    setErrorMessage(msg.length > 120 ? msg.slice(0, 120) + '...' : msg)
  }, [writeError])

  const execute = () => {
    if (!address || tokenId === null || !tier) return

    if (paymentMethod === 'DOT') {
      setStep('purchasing')
      writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: DUCKET_ABI,
        functionName: 'mintTicket',
        args: [BigInt(tokenId), address as `0x${string}`, BigInt(quantity)],
        value: tier.price * BigInt(quantity),
      })
    } else {
      // USDC path
      if (needsApprove) {
        setStep('approving')
        writeContract({
          address: MOCK_USDC_ADDRESS as `0x${string}`,
          abi: MOCK_USDC_ABI,
          functionName: 'approve',
          args: [CONTRACT_ADDRESS as `0x${string}`, totalStablePrice],
        })
      } else {
        executePurchase()
      }
    }
  }

  const reset = () => {
    setStep('idle')
    setErrorMessage('')
    resetWrite()
  }

  // Compute stepLabel
  let stepLabel: string
  if (paymentMethod === 'DOT') {
    stepLabel = 'Purchase Ticket'
  } else if (
    needsApprove &&
    (step === 'idle' || step === 'approving' || step === 'approve-confirming')
  ) {
    stepLabel = 'Step 1/2: Approve USDC'
  } else if (step === 'purchasing' || step === 'purchase-confirming') {
    stepLabel = 'Step 2/2: Purchase Ticket'
  } else {
    stepLabel = 'Purchase Ticket'
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
    needsApprove,
    stepLabel,
    isPending,
    errorMessage,
    isSuccess,
    execute,
    reset,
  }
}
