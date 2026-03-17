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
import { COPY } from '@/constants/copy'

export default function HowItWorks() {
  const steps = [
    {
      icon: Wallet,
      title: 'Connect Your Wallet',
      description: 'Use MetaMask or any EVM-compatible wallet. Your wallet address is your identity — no email, no password, no account creation.',
    },
    {
      icon: Search,
      title: 'Browse Events',
      description: 'Events list transparent, on-chain pricing. Each event shows its resale cap — the maximum any reseller can charge — enforced by the contract.',
    },
    {
      icon: ShoppingCart,
      title: 'Buy a Ticket',
      description: 'Tickets are minted as ERC-1155 tokens directly to your wallet. The smart contract handles the full flow on-chain — no backend, no database.',
    },
    {
      icon: Ticket,
      title: 'Own Your Ticket',
      description: 'Your ticket lives in your wallet. Transfer it, resell it within the cap, or hold it. No one can revoke or freeze it.',
    },
  ]

  const features = [
    {
      icon: Shield,
      title: 'Resale Capped by Contract',
      description: 'Each event sets a resale ceiling. Any listing above that cap is rejected at the contract level. There is no backend to bypass — the rule is the code.',
    },
    {
      icon: RefreshCw,
      title: 'On-Chain Ticketing on Polkadot Hub',
      description: 'Ducket is a fully on-chain ticketing application deployed on Polkadot Hub testnet, using EVM-compatible smart contracts for ERC-1155 ticket issuance.',
    },
    {
      icon: CheckCircle,
      title: 'Community Membership Gates',
      description: 'Token-gate exclusive events for token holders. The contract checks on-chain balances to determine eligibility — membership is verifiable by anyone.',
    },
    {
      icon: Shield,
      title: 'XCM-Ready Cross-Chain Verification',
      description: 'Ticket holders can emit on-chain verification events. The contract is architected for XCM integration — parachains can verify ticket ownership without trusting our contract directly.',
    },
  ]

  return (
    <main className="container py-16">
      {/* Header */}
      <div className="text-center mb-16">
        <span className="inline-block px-4 py-1.5 rounded-full bg-secondary text-primary text-sm font-medium mb-4">
          Getting Started
        </span>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          {COPY.HOW_IT_WORKS_PAGE.PAGE_TITLE}
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {COPY.HOW_IT_WORKS_PAGE.PAGE_SUBTITLE}
        </p>
      </div>

      {/* Steps */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {steps.map((step, index) => (
          <Card key={index} className="border-border hover:border-primary/30 transition-all">
            <CardContent className="pt-6">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-4">
                <step.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-medium text-primary mb-2">Step {index + 1}</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-gray-600">{step.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Features */}
      <div className="bg-secondary rounded-lg p-8 md:p-10 mb-16">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">
          {COPY.HOW_IT_WORKS_PAGE.FEATURES_SECTION_TITLE}
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Ready to Get Started?
        </h2>
        <p className="text-gray-600 mb-6">
          Browse upcoming events and experience fair ticketing.
        </p>
        <Button size="lg" className="bg-primary hover:bg-primary-light" asChild>
          <Link to="/">
            Browse Events
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </Button>
      </div>
    </main>
  )
}
