import { useState, useEffect } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { DUCKET_ABI, CONTRACT_ADDRESS } from '@/lib/contract'

export type VerifyStep = 'idle' | 'verifying' | 'confirming' | 'success' | 'error'

export function useXcmVerification(): {
  step: VerifyStep
  errorMessage: string
  isPending: boolean
  isSuccess: boolean
  txHash: `0x${string}` | undefined
  verify: (tokenId: number) => void
  reset: () => void
} {
  const [step, setStep] = useState<VerifyStep>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined)

  const {
    writeContract,
    data: hash,
    error: writeError,
    isPending: isWritePending,
    reset: resetWrite,
  } = useWriteContract()

  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
    query: { enabled: !!txHash },
  })

  // When hash appears, move to confirming
  useEffect(() => {
    if (!hash) return
    setTxHash(hash)
    setStep('confirming')
  }, [hash])

  // When confirmed, move to success
  useEffect(() => {
    if (!isConfirmed) return
    setStep('success')
  }, [isConfirmed])

  // Handle write errors
  useEffect(() => {
    if (!writeError) return
    setStep('error')
    setErrorMessage(writeError.message?.slice(0, 120) ?? 'Transaction failed')
  }, [writeError])

  const verify = (tokenId: number) => {
    if (CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
      setStep('error')
      setErrorMessage('Contract not deployed')
      return
    }
    setStep('verifying')
    writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: DUCKET_ABI,
      functionName: 'emitXcmVerification',
      args: [BigInt(tokenId)],
      gas: 200_000n,
    })
  }

  const reset = () => {
    setStep('idle')
    setErrorMessage('')
    setTxHash(undefined)
    resetWrite()
  }

  return {
    step,
    errorMessage,
    isPending: isWritePending || step === 'verifying' || step === 'confirming',
    isSuccess: step === 'success',
    txHash,
    verify,
    reset,
  }
}
