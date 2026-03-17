import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
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
      title: 'Connect wallet',
      description: 'MetaMask or any EVM wallet. No email, no password, no sign-up form.',
    },
    {
      icon: Search,
      title: 'Pick an event',
      description: 'Prices and resale caps are right there on the page. What you see is what the contract enforces.',
    },
    {
      icon: ShoppingCart,
      title: 'Buy',
      description: 'The ticket mints straight to your wallet. One transaction, fully on-chain.',
    },
    {
      icon: Ticket,
      title: 'It\'s yours',
      description: 'Resell it (within the cap), transfer it, or just show up. Nobody can revoke it.',
    },
  ]

  const features = [
    {
      icon: Shield,
      title: 'Resale caps in the code',
      description: 'The organizer sets a max resale price. The contract enforces it. There\'s no admin panel to override it.',
    },
    {
      icon: RefreshCw,
      title: 'Fully on-chain',
      description: 'ERC-1155 tickets on Polkadot Hub testnet. No database, no API dependency. The contract is the backend.',
    },
    {
      icon: CheckCircle,
      title: 'Token-gated events',
      description: 'Organizers can restrict events to specific token holders. The contract checks balances — no honor system.',
    },
    {
      icon: Shield,
      title: 'XCM verification',
      description: 'Tickets emit on-chain attestation events. Other parachains can verify ownership cross-chain without trusting us.',
    },
  ]

  return (
    <main className="container py-16">
      {/* Header */}
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        viewport={{ once: true, amount: 0.2 }}
      >
        <span className="inline-block px-4 py-1.5 rounded-full bg-secondary text-primary text-sm font-medium mb-4">
          Getting Started
        </span>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          {COPY.HOW_IT_WORKS_PAGE.PAGE_TITLE}
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {COPY.HOW_IT_WORKS_PAGE.PAGE_SUBTITLE}
        </p>
      </motion.div>

      {/* Steps */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut', delay: index * 0.07 }}
            viewport={{ once: true }}
          >
          <Card className="border-border hover:border-primary/30 transition-all">
            <CardContent className="pt-6">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-4">
                <step.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-medium text-primary mb-2">Step {index + 1}</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-gray-600">{step.description}</p>
            </CardContent>
          </Card>
          </motion.div>
        ))}
      </div>

      {/* Features */}
      <motion.div
        className="bg-secondary rounded-lg p-8 md:p-10 mb-16"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        viewport={{ once: true, amount: 0.2 }}
      >
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">
          {COPY.HOW_IT_WORKS_PAGE.FEATURES_SECTION_TITLE}
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="text-center"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut', delay: index * 0.07 }}
              viewport={{ once: true }}
            >
              <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        viewport={{ once: true, amount: 0.2 }}
      >
        <h2 className="text-2xl font-bold text-foreground mb-4">
          {COPY.HOW_IT_WORKS_PAGE.CTA_TITLE}
        </h2>
        <p className="text-gray-600 mb-6">
          {COPY.HOW_IT_WORKS_PAGE.CTA_SUBTITLE}
        </p>
        <Button size="lg" className="bg-primary hover:bg-primary-light" asChild>
          <Link to="/">
            Browse Events
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </Button>
      </motion.div>
    </main>
  )
}
