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
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary text-primary">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-sm font-medium">{shortenAddress(address)}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => disconnect()}
          className="border-border hover:bg-secondary hover:text-primary"
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
      className="bg-primary hover:bg-primary-light gap-2"
    >
      <Wallet className="h-4 w-4" />
      {!firstConnector ? 'No Wallet Found' : isPending ? 'Connecting...' : 'Connect Wallet'}
      <ChevronDown className="h-4 w-4" />
    </Button>
  )
}
