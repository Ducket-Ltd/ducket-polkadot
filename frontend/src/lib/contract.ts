// Contract address - update after deployment
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000'

// MockUSDC contract address
export const MOCK_USDC_ADDRESS = import.meta.env.VITE_MOCK_USDC_ADDRESS || '0x0000000000000000000000000000000000000000'

// ABI matching DucketTickets V1 with stablecoin extensions
// Struct fields based on actual contract:
//   Event: eventName, eventDate, organizer, maxResalePercentage, totalSupply,
//          maxTicketsPerWallet, resaleEnabled, transferEnabled, exists
//   TicketTier: eventId, tierName, seatPrefix, price, stablePrice, maxSupply, minted, exists
//   ResaleListing: seller, price, active, isStablecoin
export const DUCKET_ABI = [
  // ---- Mappings (public getters) ----
  {
    inputs: [{ name: 'eventId', type: 'uint256' }],
    name: 'events',
    outputs: [
      { name: 'eventName', type: 'string' },
      { name: 'eventDate', type: 'uint256' },
      { name: 'organizer', type: 'address' },
      { name: 'maxResalePercentage', type: 'uint16' },
      { name: 'totalSupply', type: 'uint256' },
      { name: 'maxTicketsPerWallet', type: 'uint256' },
      { name: 'resaleEnabled', type: 'bool' },
      { name: 'transferEnabled', type: 'bool' },
      { name: 'exists', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'ticketTiers',
    outputs: [
      { name: 'eventId', type: 'uint256' },
      { name: 'tierName', type: 'string' },
      { name: 'seatPrefix', type: 'string' },
      { name: 'price', type: 'uint256' },
      { name: 'stablePrice', type: 'uint256' },
      { name: 'maxSupply', type: 'uint256' },
      { name: 'minted', type: 'uint256' },
      { name: 'exists', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'ticketNumber', type: 'uint256' },
    ],
    name: 'resaleListings',
    outputs: [
      { name: 'seller', type: 'address' },
      { name: 'price', type: 'uint256' },
      { name: 'active', type: 'bool' },
      { name: 'isStablecoin', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  // ---- View functions ----
  {
    inputs: [{ name: 'eventId', type: 'uint256' }],
    name: 'getEvent',
    outputs: [
      {
        components: [
          { name: 'eventName', type: 'string' },
          { name: 'eventDate', type: 'uint256' },
          { name: 'organizer', type: 'address' },
          { name: 'maxResalePercentage', type: 'uint16' },
          { name: 'totalSupply', type: 'uint256' },
          { name: 'maxTicketsPerWallet', type: 'uint256' },
          { name: 'resaleEnabled', type: 'bool' },
          { name: 'transferEnabled', type: 'bool' },
          { name: 'exists', type: 'bool' },
        ],
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'getTicketTier',
    outputs: [
      {
        components: [
          { name: 'eventId', type: 'uint256' },
          { name: 'tierName', type: 'string' },
          { name: 'seatPrefix', type: 'string' },
          { name: 'price', type: 'uint256' },
          { name: 'stablePrice', type: 'uint256' },
          { name: 'maxSupply', type: 'uint256' },
          { name: 'minted', type: 'uint256' },
          { name: 'exists', type: 'bool' },
        ],
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'ticketNumber', type: 'uint256' },
    ],
    name: 'getResaleListing',
    outputs: [
      {
        components: [
          { name: 'seller', type: 'address' },
          { name: 'price', type: 'uint256' },
          { name: 'active', type: 'bool' },
          { name: 'isStablecoin', type: 'bool' },
        ],
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'paymentToken',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'platformFee',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'platformWallet',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'account', type: 'address' },
      { name: 'id', type: 'uint256' },
    ],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  // ---- Write functions ----
  {
    inputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'to', type: 'address' },
      { name: 'quantity', type: 'uint256' },
    ],
    name: 'mintTicket',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'to', type: 'address' },
      { name: 'quantity', type: 'uint256' },
    ],
    name: 'mintTicketWithToken',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'ticketNumber', type: 'uint256' },
    ],
    name: 'buyResaleTicket',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'ticketNumber', type: 'uint256' },
    ],
    name: 'buyResaleTicketWithToken',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'ticketNumber', type: 'uint256' },
      { name: 'price', type: 'uint256' },
      { name: 'isStablecoin', type: 'bool' },
    ],
    name: 'listForResale',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'ticketNumber', type: 'uint256' },
    ],
    name: 'cancelResaleListing',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

// Minimal ERC-20 ABI for MockUSDC
export const MOCK_USDC_ABI = [
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'amount', type: 'uint256' }],
    name: 'faucet',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const
