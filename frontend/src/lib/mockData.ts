// Mock event data for demo purposes
// These will match events created on-chain via seed script

export interface MockEvent {
  id: string
  onChainEventId?: number
  name: string
  description: string
  date: Date
  venue: string
  city: string
  country: string
  imageUrl: string
  category: string
  organizer: string
  ticketTiers: MockTicketTier[]
  maxResalePercentage: number
  resaleEnabled: boolean
  transferEnabled: boolean
  maxTicketsPerWallet?: number
}

export interface MockTicketTier {
  id: string
  tokenId: number
  onChainTierId?: number
  name: string
  price: number // in DOT
  maxSupply: number
  sold: number
  description: string
}

export const MOCK_EVENTS: MockEvent[] = [
  // ===== MAY 2026 =====
  {
    id: '1',
    onChainEventId: 1,
    name: 'Digital Art Gallery Opening',
    description: 'Experience the intersection of art and technology at this exclusive gallery opening featuring NFT artists from around the world. Witness digital masterpieces displayed on cutting-edge screens.',
    date: new Date('2026-05-15T19:00:00+08:00'),
    venue: 'National Gallery Singapore',
    city: 'Singapore',
    country: 'Singapore',
    imageUrl: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800&q=80',
    category: 'Art',
    organizer: '0x0000000000000000000000000000000000000000',
    maxResalePercentage: 130,
    resaleEnabled: true,
    transferEnabled: true,
    maxTicketsPerWallet: 4,
    ticketTiers: [
      {
        id: '1-entry',
        tokenId: 0,
        onChainTierId: 1,
        name: 'Gallery Entry',
        price: 0.25,
        maxSupply: 150,
        sold: 0,
        description: 'General admission to all gallery floors',
      },
      {
        id: '1-collector',
        tokenId: 1,
        onChainTierId: 2,
        name: "Collector's Preview",
        price: 0.75,
        maxSupply: 50,
        sold: 0,
        description: 'Early access, champagne reception, meet the artists',
      },
    ],
  },
  {
    id: '2',
    onChainEventId: 2,
    name: 'APAC Startup Summit',
    description: 'Connect with the brightest minds in the APAC startup ecosystem. Pitch competitions, investor panels, and networking sessions with founders who have scaled to unicorn status.',
    date: new Date('2026-05-28T10:00:00+08:00'),
    venue: 'One Raffles Place',
    city: 'Singapore',
    country: 'Singapore',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
    category: 'Business',
    organizer: '0x0000000000000000000000000000000000000000',
    maxResalePercentage: 115,
    resaleEnabled: true,
    transferEnabled: true,
    maxTicketsPerWallet: 4,
    ticketTiers: [
      {
        id: '2-attendee',
        tokenId: 2,
        onChainTierId: 3,
        name: 'Attendee Pass',
        price: 0.4,
        maxSupply: 400,
        sold: 0,
        description: 'Access to all talks and exhibition area',
      },
      {
        id: '2-investor',
        tokenId: 3,
        onChainTierId: 4,
        name: 'Investor Circle',
        price: 1.5,
        maxSupply: 100,
        sold: 0,
        description: 'Exclusive investor lounge, deal flow sessions',
      },
    ],
  },

  // ===== JUNE 2026 =====
  {
    id: '3',
    onChainEventId: 3,
    name: 'Polkadot Tech Conference 2026',
    description: 'The premier blockchain conference in Southeast Asia. Join industry leaders, innovators, and developers for a day of cutting-edge talks, workshops, and networking opportunities focused on Web3 and the Polkadot ecosystem.',
    date: new Date('2026-06-20T10:00:00+08:00'),
    venue: 'Marina Bay Sands Expo',
    city: 'Singapore',
    country: 'Singapore',
    imageUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80',
    category: 'Conference',
    organizer: '0x0000000000000000000000000000000000000000',
    maxResalePercentage: 150,
    resaleEnabled: true,
    transferEnabled: true,
    maxTicketsPerWallet: 4,
    ticketTiers: [
      {
        id: '3-ga',
        tokenId: 4,
        onChainTierId: 5,
        name: 'General Admission',
        price: 0.5,
        maxSupply: 100,
        sold: 0,
        description: 'Access to all main stage talks and exhibition area',
      },
      {
        id: '3-vip',
        tokenId: 5,
        onChainTierId: 6,
        name: 'VIP Pass',
        price: 2.0,
        maxSupply: 20,
        sold: 0,
        description: 'Priority seating, exclusive networking lounge, speaker meet & greet',
      },
    ],
  },
  {
    id: '4',
    onChainEventId: 4,
    name: 'Blockchain Music Festival',
    description: 'An immersive music experience where blockchain meets beats. Featuring international DJs, live performances, and NFT art installations. Your ticket is your collectible.',
    date: new Date('2026-06-27T19:00:00+08:00'),
    venue: 'Sentosa Beach',
    city: 'Singapore',
    country: 'Singapore',
    imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80',
    category: 'Music',
    organizer: '0x0000000000000000000000000000000000000000',
    maxResalePercentage: 120,
    resaleEnabled: true,
    transferEnabled: true,
    maxTicketsPerWallet: 4,
    ticketTiers: [
      {
        id: '4-std',
        tokenId: 6,
        onChainTierId: 7,
        name: 'Standard Entry',
        price: 0.8,
        maxSupply: 700,
        sold: 0,
        description: 'General admission to all stages',
      },
      {
        id: '4-pvip',
        tokenId: 7,
        onChainTierId: 8,
        name: 'Premium VIP',
        price: 2.0,
        maxSupply: 200,
        sold: 0,
        description: 'VIP viewing areas, complimentary drinks, artist meet & greet',
      },
    ],
  },
  {
    id: '5',
    onChainEventId: 5,
    name: 'Web3 Gaming Expo',
    description: 'The ultimate gathering for Web3 gamers and developers. Play-to-earn demos, esports tournaments, exclusive game reveals, and hands-on experiences with the future of gaming.',
    date: new Date('2026-06-30T09:00:00+08:00'),
    venue: 'Suntec Convention Centre',
    city: 'Singapore',
    country: 'Singapore',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80',
    category: 'Gaming',
    organizer: '0x0000000000000000000000000000000000000000',
    maxResalePercentage: 150,
    resaleEnabled: true,
    transferEnabled: false,
    maxTicketsPerWallet: 4,
    ticketTiers: [
      {
        id: '5-gp',
        tokenId: 8,
        onChainTierId: 9,
        name: 'Gamer Pass',
        price: 0.3,
        maxSupply: 300,
        sold: 0,
        description: 'Access to expo floor, demo stations, and public tournaments',
      },
      {
        id: '5-pro',
        tokenId: 9,
        onChainTierId: 10,
        name: 'Pro Gamer VIP',
        price: 1.0,
        maxSupply: 100,
        sold: 0,
        description: 'All access including pro tournaments, exclusive swag, and developer sessions',
      },
    ],
  },

  // ===== JULY 2026 =====
  {
    id: '6',
    onChainEventId: 6,
    name: 'Stand-Up Comedy Night',
    description: "Laugh until you cry with Asia's top comedians. An evening of stand-up comedy featuring rising stars and established names from the regional comedy circuit.",
    date: new Date('2026-07-10T20:00:00+08:00'),
    venue: 'Capitol Theatre',
    city: 'Singapore',
    country: 'Singapore',
    imageUrl: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=800&q=80',
    category: 'Entertainment',
    organizer: '0x0000000000000000000000000000000000000000',
    maxResalePercentage: 110,
    resaleEnabled: true,
    transferEnabled: true,
    maxTicketsPerWallet: 4,
    ticketTiers: [
      {
        id: '6-gen',
        tokenId: 10,
        onChainTierId: 11,
        name: 'General Seating',
        price: 0.2,
        maxSupply: 200,
        sold: 0,
        description: 'Standard theatre seating',
      },
      {
        id: '6-front',
        tokenId: 11,
        onChainTierId: 12,
        name: 'Front Row',
        price: 0.5,
        maxSupply: 50,
        sold: 0,
        description: 'Premium front row seats, prepare to be picked on!',
      },
    ],
  },
]

// Helper function to get event by ID
export function getEventById(id: string): MockEvent | undefined {
  return MOCK_EVENTS.find(event => event.id === id)
}

// Helper to format DOT price
export function formatDOTPrice(amount: number): string {
  return `${amount.toFixed(2)} DOT`
}

// Helper to check if event is sold out
export function isEventSoldOut(event: MockEvent): boolean {
  return event.ticketTiers.every(tier => tier.sold >= tier.maxSupply)
}

// Helper to get tickets remaining for a tier
export function getTicketsRemaining(tier: MockTicketTier): number {
  return tier.maxSupply - tier.sold
}

// Mock resale listings
export interface MockResaleListing {
  id: string
  eventId: string
  tierId: string
  ticketId: number
  seatId: string
  originalPrice: number
  listingPrice: number
  seller: string
  listedAt: Date
}

// Resale listings - populated from on-chain data when tickets are listed for resale
// In production, this would be fetched from the contract's resaleListings mapping
export const MOCK_RESALE_LISTINGS: MockResaleListing[] = []

// Helper to get resale listings for an event
export function getResaleListingsForEvent(eventId: string): MockResaleListing[] {
  return MOCK_RESALE_LISTINGS.filter((listing) => listing.eventId === eventId)
}
