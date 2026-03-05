export interface TicketTier {
  id: number
  tokenId: number
  name: string
  price: number // in DOT
  maxSupply: number
  minted: number
}

export interface MockEvent {
  id: number
  title: string
  description: string
  date: string
  venue: string
  city: string
  imageUrl: string
  maxResalePercentage: number
  tiers: TicketTier[]
}

export const mockEvents: MockEvent[] = [
  {
    id: 0,
    title: 'Neon Nights Festival',
    description: 'The ultimate EDM experience featuring world-class DJs and stunning visual productions. Dance the night away under the stars at Marina Bay Sands.',
    date: '2025-04-01T20:00:00',
    venue: 'Marina Bay Sands',
    city: 'Singapore',
    imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800',
    maxResalePercentage: 150,
    tiers: [
      {
        id: 0,
        tokenId: 0,
        name: 'General Admission',
        price: 0.5,
        maxSupply: 500,
        minted: 0,
      },
      {
        id: 1,
        tokenId: 1,
        name: 'VIP',
        price: 1.5,
        maxSupply: 100,
        minted: 0,
      },
    ],
  },
  {
    id: 1,
    title: 'Jazz in the Park',
    description: 'An evening of smooth jazz under the stars. Enjoy world-renowned jazz musicians in the beautiful setting of Victoria Park.',
    date: '2025-04-08T19:00:00',
    venue: 'Victoria Park',
    city: 'Hong Kong',
    imageUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800',
    maxResalePercentage: 120,
    tiers: [
      {
        id: 2,
        tokenId: 2,
        name: 'General Admission',
        price: 0.3,
        maxSupply: 300,
        minted: 0,
      },
      {
        id: 3,
        tokenId: 3,
        name: 'VIP',
        price: 0.8,
        maxSupply: 50,
        minted: 0,
      },
    ],
  },
  {
    id: 2,
    title: 'Ducket Dev Conf',
    description: 'A Web3 developer conference exploring the future of decentralized ticketing. Learn from industry experts and connect with builders.',
    date: '2025-04-15T09:00:00',
    venue: 'BITEC',
    city: 'Bangkok',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    maxResalePercentage: 110,
    tiers: [
      {
        id: 4,
        tokenId: 4,
        name: 'General Admission',
        price: 0.2,
        maxSupply: 200,
        minted: 0,
      },
      {
        id: 5,
        tokenId: 5,
        name: 'VIP',
        price: 0.5,
        maxSupply: 30,
        minted: 0,
      },
    ],
  },
]

export const getEventById = (id: number): MockEvent | undefined => {
  return mockEvents.find(event => event.id === id)
}
