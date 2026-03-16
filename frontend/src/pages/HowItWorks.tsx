import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Wallet,
  Search,
  ShoppingCart,
  Ticket,
  Shield,
  RefreshCw,
  ArrowRight,
  CheckCircle,
} from 'lucide-react'

export default function HowItWorks() {
  const steps = [
    {
      icon: Wallet,
      title: 'Connect Your Wallet',
      description: 'Use MetaMask or any EVM-compatible wallet to connect to Polkadot Hub testnet. Your wallet address is your identity — no email, no password, no account creation.',
    },
    {
      icon: Search,
      title: 'Browse Events',
      description: 'Events are listed with transparent, on-chain pricing. Each event displays its resale cap — the maximum markup any reseller can charge — enforced at the protocol level.',
    },
    {
      icon: ShoppingCart,
      title: 'Purchase Tickets',
      description: 'Tickets are minted as ERC-1155 tokens directly to your wallet. The DucketV2 smart contract handles the entire flow on-chain: no backend, no database, no custodians.',
    },
    {
      icon: Ticket,
      title: 'Own Your Tickets',
      description: 'Your ticket is an NFT you fully control. Transfer it, resell it within the cap, or hold it. No one — not even the organizer — can revoke or freeze your ticket.',
    },
  ]

  const features = [
    {
      icon: Shield,
      title: 'Protocol-Level Anti-Scalping',
      description: 'The DucketV2 smart contract enforces a resale price ceiling. Any attempt to list above the cap is rejected by the contract. There is no backend to bypass — the rule is the code.',
    },
    {
      icon: RefreshCw,
      title: 'First NFT Ticketing dApp on Polkadot Hub',
      description: 'Ducket is the first fully on-chain ticketing application deployed on Polkadot Hub testnet, using the Solidity smart contract stack to bring ERC-1155 ticketing to Polkadot.',
    },
    {
      icon: CheckCircle,
      title: 'Community Membership Gates',
      description: 'Token-gate exclusive events for NFT or token holders. The contract checks on-chain balances to determine eligibility, making membership verifiable and trustless.',
    },
    {
      icon: Shield,
      title: 'XCM-Ready Cross-Chain Verification',
      description: 'Ticket holders can emit on-chain verification events that serve as cross-chain attestation points. The contract is architected for XCM integration — enabling parachains to verify ticket ownership without trusting our contract directly.',
    },
  ]

  return (
    <main className="container py-16">
      {/* Header */}
      <div className="text-center mb-16">
        <span className="inline-block px-4 py-1.5 rounded-full bg-[#F5F0FF] text-[#3D2870] text-sm font-medium mb-4">
          Getting Started
        </span>
        <h1 className="text-4xl md:text-5xl font-bold text-[#1a1625] mb-4">
          How Ducket Works
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Fair ticketing enforced by smart contracts on Polkadot Hub. No middlemen, no scalpers.
        </p>
      </div>

      {/* Steps */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {steps.map((step, index) => (
          <Card key={index} className="border-[#E8E3F5] hover:border-[#3D2870]/30 transition-all">
            <CardContent className="pt-6">
              <div className="w-12 h-12 rounded-xl bg-[#3D2870] flex items-center justify-center mb-4">
                <step.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-medium text-[#3D2870] mb-2">Step {index + 1}</div>
              <h3 className="text-lg font-semibold text-[#1a1625] mb-2">{step.title}</h3>
              <p className="text-sm text-gray-600">{step.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Features */}
      <div className="bg-[#F8F4FF] rounded-2xl p-8 md:p-12 mb-16">
        <h2 className="text-2xl md:text-3xl font-bold text-[#1a1625] mb-8 text-center">
          Why Ducket on Polkadot Hub?
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="w-14 h-14 rounded-full bg-[#3D2870] flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-[#1a1625] mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#1a1625] mb-4">
          Ready to Get Started?
        </h2>
        <p className="text-gray-600 mb-6">
          Browse upcoming events and experience fair ticketing.
        </p>
        <Button size="lg" className="bg-[#3D2870] hover:bg-[#6B5B95]" asChild>
          <Link to="/">
            Browse Events
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </Button>
      </div>
    </main>
  )
}
