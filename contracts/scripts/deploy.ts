import { ethers } from "hardhat";

// Mock event data matching frontend/src/lib/mockData.ts
const MOCK_EVENTS = [
  {
    name: "Digital Art Gallery Opening",
    eventDate: Math.floor(new Date("2026-05-15T19:00:00+08:00").getTime() / 1000),
    maxResalePercentage: 130,
    maxTicketsPerWallet: 4,
    totalSupply: 200,
    resaleEnabled: true,
    transferEnabled: true,
    tiers: [
      { name: "Gallery Entry", seatPrefix: "GA-", price: "0.25", stablePrice: "25", maxSupply: 150 },
      { name: "Collector's Preview", seatPrefix: "CP-", price: "0.75", stablePrice: "75", maxSupply: 50 },
    ],
  },
  {
    name: "APAC Startup Summit",
    eventDate: Math.floor(new Date("2026-05-28T10:00:00+08:00").getTime() / 1000),
    maxResalePercentage: 115,
    maxTicketsPerWallet: 4,
    totalSupply: 500,
    resaleEnabled: true,
    transferEnabled: true,
    tiers: [
      { name: "Attendee Pass", seatPrefix: "ATT-", price: "0.4", stablePrice: "40", maxSupply: 400 },
      { name: "Investor Circle", seatPrefix: "INV-", price: "1.5", stablePrice: "150", maxSupply: 100 },
    ],
  },
  {
    name: "Polkadot Tech Conference 2026",
    eventDate: Math.floor(new Date("2026-06-20T10:00:00+08:00").getTime() / 1000),
    maxResalePercentage: 150,
    maxTicketsPerWallet: 4,
    totalSupply: 120,
    resaleEnabled: true,
    transferEnabled: true,
    tiers: [
      { name: "General Admission", seatPrefix: "GA-", price: "0.5", stablePrice: "50", maxSupply: 100 },
      { name: "VIP Pass", seatPrefix: "VIP-", price: "2.0", stablePrice: "200", maxSupply: 20 },
    ],
  },
  {
    name: "Blockchain Music Festival",
    eventDate: Math.floor(new Date("2026-06-27T19:00:00+08:00").getTime() / 1000),
    maxResalePercentage: 120,
    maxTicketsPerWallet: 4,
    totalSupply: 900,
    resaleEnabled: true,
    transferEnabled: true,
    tiers: [
      { name: "Standard Entry", seatPrefix: "STD-", price: "0.8", stablePrice: "80", maxSupply: 700 },
      { name: "Premium VIP", seatPrefix: "PVIP-", price: "2.0", stablePrice: "200", maxSupply: 200 },
    ],
  },
  {
    name: "Web3 Gaming Expo",
    eventDate: Math.floor(new Date("2026-06-30T09:00:00+08:00").getTime() / 1000),
    maxResalePercentage: 150,
    maxTicketsPerWallet: 4,
    totalSupply: 400,
    resaleEnabled: true,
    transferEnabled: false,
    tiers: [
      { name: "Gamer Pass", seatPrefix: "GP-", price: "0.3", stablePrice: "30", maxSupply: 300 },
      { name: "Pro Gamer VIP", seatPrefix: "PGV-", price: "1.0", stablePrice: "100", maxSupply: 100 },
    ],
  },
  {
    name: "Stand-Up Comedy Night",
    eventDate: Math.floor(new Date("2026-07-10T20:00:00+08:00").getTime() / 1000),
    maxResalePercentage: 110,
    maxTicketsPerWallet: 4,
    totalSupply: 250,
    resaleEnabled: true,
    transferEnabled: true,
    tiers: [
      { name: "General Seating", seatPrefix: "GEN-", price: "0.2", stablePrice: "20", maxSupply: 200 },
      { name: "Front Row", seatPrefix: "FR-", price: "0.5", stablePrice: "50", maxSupply: 50 },
    ],
  },
];

async function main() {
  const platformWallet = process.env.PLATFORM_WALLET;

  if (!platformWallet) {
    throw new Error("PLATFORM_WALLET not set in environment variables");
  }

  console.log("=".repeat(60));
  console.log("Deploying MockUSDC + DucketTickets to Polkadot Hub TestNet...");
  console.log("=".repeat(60));
  console.log("Platform wallet:", platformWallet);

  // 1. Deploy MockUSDC first
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const mockUsdc = await MockUSDC.deploy();
  await mockUsdc.waitForDeployment();
  const mockUsdcAddress = await mockUsdc.getAddress();
  console.log("\nMockUSDC deployed:", mockUsdcAddress);

  // 2. Deploy DucketTickets
  const DucketTickets = await ethers.getContractFactory("DucketTickets");
  const ducketTickets = await DucketTickets.deploy(platformWallet);

  await ducketTickets.waitForDeployment();

  const contractAddress = await ducketTickets.getAddress();
  console.log("DucketTickets deployed:", contractAddress);

  // 3. Set MockUSDC as the payment token
  const setTokenTx = await ducketTickets.setPaymentToken(mockUsdcAddress);
  await setTokenTx.wait();
  console.log("Payment token set to MockUSDC:", mockUsdcAddress);

  // Seed mock events
  console.log("\n" + "=".repeat(60));
  console.log("Seeding mock events...");
  console.log("=".repeat(60));

  let tokenIdCounter = 0;

  for (let i = 0; i < MOCK_EVENTS.length; i++) {
    const event = MOCK_EVENTS[i];
    console.log(`\nCreating Event ${i + 1}: ${event.name}`);

    // Create event
    const createEventTx = await ducketTickets.createEvent(
      event.name,
      event.eventDate,
      event.maxResalePercentage,
      event.maxTicketsPerWallet,
      event.totalSupply,
      event.resaleEnabled,
      event.transferEnabled
    );
    await createEventTx.wait();

    const eventId = i; // Events are 0-indexed in the contract
    console.log(`   Event ID: ${eventId}`);

    // Create ticket tiers for this event
    for (let j = 0; j < event.tiers.length; j++) {
      const tier = event.tiers[j];
      const priceInWei = ethers.parseEther(tier.price);
      const stablePriceUnits = ethers.parseUnits(tier.stablePrice, 6);

      const createTierTx = await ducketTickets.createTicketTier(
        eventId,
        tier.name,
        tier.seatPrefix,
        priceInWei,
        stablePriceUnits,
        tier.maxSupply
      );
      await createTierTx.wait();

      console.log(`   Tier ${j + 1}: ${tier.name} (Token ID: ${tokenIdCounter}, Price: ${tier.price} DOT / $${tier.stablePrice} USDC, Supply: ${tier.maxSupply})`);
      tokenIdCounter++;
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("Seeding complete!");
  console.log("=".repeat(60));
  console.log(`\nCreated ${MOCK_EVENTS.length} events with ${tokenIdCounter} ticket tiers total`);

  console.log("\nNext steps:");
  console.log("1. Update frontend .env with VITE_CONTRACT_ADDRESS=" + contractAddress);
  console.log("2. Update frontend .env with VITE_MOCK_USDC_ADDRESS=" + mockUsdcAddress);
  console.log("3. Update contracts .env with CONTRACT_ADDRESS=" + contractAddress);
  console.log("4. Update contracts .env with MOCK_USDC_ADDRESS=" + mockUsdcAddress);
  console.log("5. Deploy frontend to Vercel");
  console.log("\nMockUSDC address:     " + mockUsdcAddress);
  console.log("DucketTickets address: " + contractAddress);
  console.log("\n" + "=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
