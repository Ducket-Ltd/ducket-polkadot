import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useAccount } from 'wagmi'
import { WalletConnect } from './WalletConnect'

const navLinks = [
  { label: 'Events', to: '/' },
  { label: 'Resale', to: '/resale' },
  { label: 'How It Works', to: '/how-it-works' },
]

export function Header() {
  const { isConnected } = useAccount()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <img src="/images/logo.png" alt="Ducket" className="h-10" />
              <span className="hidden sm:inline-block rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-primary">
                on Polkadot
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="text-sm font-medium text-gray-700 transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
              {isConnected && (
                <Link
                  to="/my-tickets"
                  className="text-sm font-medium text-gray-700 transition-colors hover:text-primary"
                >
                  My Tickets
                </Link>
              )}
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-4">
              <WalletConnect />
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-4 md:hidden">
              <WalletConnect />
              <button
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6 text-gray-700" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-700" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-lg transition-all duration-300 ${
            isMobileMenuOpen
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 -translate-y-4 pointer-events-none'
          }`}
        >
          <div className="container mx-auto px-4 py-6 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 text-gray-700 font-medium hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {isConnected && (
              <Link
                to="/my-tickets"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 text-gray-700 font-medium hover:text-primary transition-colors"
              >
                My Tickets
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Spacer to prevent content from going under fixed nav */}
      <div className="h-20" />
    </>
  )
}
