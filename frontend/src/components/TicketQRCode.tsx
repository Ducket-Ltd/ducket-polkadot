import { QRCodeSVG } from 'qrcode.react'
import { useAccount } from 'wagmi'
import { CONTRACT_ADDRESS } from '@/lib/contract'

interface TicketQRCodeProps {
  tokenId: number
  size?: number
}

export function TicketQRCode({ tokenId, size = 128 }: TicketQRCodeProps) {
  const { address } = useAccount()

  if (!address) {
    return <div style={{ width: size, height: size }} className="bg-gray-100 rounded" />
  }

  const payload = JSON.stringify({
    tokenId,
    owner: address,
    contract: CONTRACT_ADDRESS,
  })

  return (
    <div className="bg-white p-1 rounded" style={{ display: 'inline-block' }}>
      <QRCodeSVG value={payload} size={size} className="rounded" />
    </div>
  )
}
