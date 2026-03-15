import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Button } from '@/components/ui/button'
import { shortenAddress } from '@/lib/utils'
import { Wallet, LogOut, ChevronDown } from 'lucide-react'

export function WalletConnect() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F5F0FF] text-[#3D2870]">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-sm font-medium">{shortenAddress(address)}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => disconnect()}
          className="border-[#E8E3F5] hover:bg-[#F5F0FF] hover:text-[#3D2870]"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  const firstConnector = connectors[0]

  return (
    <Button
      onClick={() => firstConnector && connect({ connector: firstConnector })}
      disabled={isPending || !firstConnector}
      className="bg-[#3D2870] hover:bg-[#6B5B95] gap-2"
    >
      <Wallet className="h-4 w-4" />
      {!firstConnector ? 'No Wallet Found' : isPending ? 'Connecting...' : 'Connect Wallet'}
      <ChevronDown className="h-4 w-4" />
    </Button>
  )
}
