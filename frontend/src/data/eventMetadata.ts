// Static metadata for all 6 seeded on-chain events.
// Keys are on-chain eventIds (1–6). Events not in this map are hidden from the UI.

export interface EventMeta {
  name: string
  description: string
  imageUrl: string
  venue: string
  city: string
  country: string
  category: string
  /** tier keys are tokenIds (0–11) */
  tiers: Record<number, { name: string; description: string }>
}

export const EVENT_METADATA: Record<number, EventMeta> = {
  1: {
    name: 'Digital Art Gallery Opening',
    description:
      'Experience the intersection of art and technology at this exclusive gallery opening featuring NFT artists from around the world. Witness digital masterpieces displayed on cutting-edge screens.',
    imageUrl: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800&q=80',
    venue: 'National Gallery Singapore',
    city: 'Singapore',
    country: 'Singapore',
    category: 'Art',
    tiers: {
      0: { name: 'Gallery Entry', description: 'General admission to all gallery floors' },
      1: { name: "Collector's Preview", description: 'Early access, champagne reception, meet the artists' },
    },
  },
  2: {
    name: 'APAC Startup Summit',
    description:
      'Connect with the brightest minds in the APAC startup ecosystem. Pitch competitions, investor panels, and networking sessions with founders who have scaled to unicorn status.',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
    venue: 'One Raffles Place',
    city: 'Singapore',
    country: 'Singapore',
    category: 'Business',
    tiers: {
      2: { name: 'Attendee Pass', description: 'Access to all talks and exhibition area' },
      3: { name: 'Investor Circle', description: 'Exclusive investor lounge, deal flow sessions' },
    },
  },
  3: {
    name: 'Polkadot Tech Conference 2026',
    description:
      'The premier blockchain conference in Southeast Asia. Join industry leaders, innovators, and developers for a day of cutting-edge talks, workshops, and networking opportunities focused on Web3 and the Polkadot ecosystem.',
    imageUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80',
    venue: 'Marina Bay Sands Expo',
    city: 'Singapore',
    country: 'Singapore',
    category: 'Conference',
    tiers: {
      4: { name: 'General Admission', description: 'Access to all main stage talks and exhibition area' },
      5: { name: 'VIP Pass', description: 'Priority seating, exclusive networking lounge, speaker meet & greet' },
    },
  },
  4: {
    name: 'Blockchain Music Festival',
    description:
      'An immersive music experience where blockchain meets beats. Featuring international DJs, live performances, and NFT art installations. Your ticket is your collectible.',
    imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80',
    venue: 'Sentosa Beach',
    city: 'Singapore',
    country: 'Singapore',
    category: 'Music',
    tiers: {
      6: { name: 'Standard Entry', description: 'General admission to all stages' },
      7: { name: 'Premium VIP', description: 'VIP viewing areas, complimentary drinks, artist meet & greet' },
    },
  },
  5: {
    name: 'Web3 Gaming Expo',
    description:
      'The ultimate gathering for Web3 gamers and developers. Play-to-earn demos, esports tournaments, exclusive game reveals, and hands-on experiences with the future of gaming.',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80',
    venue: 'Suntec Convention Centre',
    city: 'Singapore',
    country: 'Singapore',
    category: 'Gaming',
    tiers: {
      8: { name: 'Gamer Pass', description: 'Access to expo floor, demo stations, and public tournaments' },
      9: {
        name: 'Pro Gamer VIP',
        description: 'All access including pro tournaments, exclusive swag, and developer sessions',
      },
    },
  },
  6: {
    name: 'Stand-Up Comedy Night',
    description:
      "Laugh until you cry with Asia's top comedians. An evening of stand-up comedy featuring rising stars and established names from the regional comedy circuit.",
    imageUrl: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=800&q=80',
    venue: 'Capitol Theatre',
    city: 'Singapore',
    country: 'Singapore',
    category: 'Entertainment',
    tiers: {
      10: { name: 'General Seating', description: 'Standard theatre seating' },
      11: { name: 'Front Row', description: 'Premium front row seats, prepare to be picked on!' },
    },
  },
}

/** All 12 known tier tokenIds across all events */
export const ALL_TIER_TOKEN_IDS: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]

/** Reverse map: tokenId → eventId */
export const TOKEN_ID_TO_EVENT_ID: Record<number, number> = {
  0: 1,
  1: 1,
  2: 2,
  3: 2,
  4: 3,
  5: 3,
  6: 4,
  7: 4,
  8: 5,
  9: 5,
  10: 6,
  11: 6,
}
