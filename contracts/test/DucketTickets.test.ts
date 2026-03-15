import { expect } from "chai";
import { ethers } from "hardhat";
import { DucketTickets, TestERC20 } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("DucketTickets — Stablecoin Payment Tests", function () {
  let ducketTickets: DucketTickets;
  let testToken: TestERC20;

  let admin: HardhatEthersSigner;
  let organizer: HardhatEthersSigner;
  let buyer: HardhatEthersSigner;
  let buyer2: HardhatEthersSigner;
  let platformWallet: HardhatEthersSigner;

  // Ticket tier constants
  const NATIVE_PRICE = ethers.parseEther("0.25"); // 0.25 DOT
  const STABLE_PRICE = 25_000_000n; // $25 USDC (6 decimals)
  const MAX_SUPPLY = 100n;
  const MAX_PER_WALLET = 5n;

  let eventId: bigint;
  let tokenId: bigint;

  beforeEach(async function () {
    [admin, organizer, buyer, buyer2, platformWallet] = await ethers.getSigners();

    // Deploy TestERC20 (6-decimal mock stablecoin)
    const TestERC20Factory = await ethers.getContractFactory("TestERC20");
    testToken = (await TestERC20Factory.deploy()) as TestERC20;
    await testToken.waitForDeployment();

    // Deploy DucketTickets
    const DucketTicketsFactory = await ethers.getContractFactory("DucketTickets");
    ducketTickets = (await DucketTicketsFactory.deploy(platformWallet.address)) as DucketTickets;
    await ducketTickets.waitForDeployment();

    // Set payment token (admin action)
    await ducketTickets.connect(admin).setPaymentToken(await testToken.getAddress());

    // Create an event as organizer
    const futureDate = Math.floor(Date.now() / 1000) + 86400 * 30; // 30 days
    const createEventTx = await ducketTickets.connect(organizer).createEvent(
      "Test Concert",
      futureDate,
      150,           // maxResalePercentage: 150% of original price
      MAX_PER_WALLET, // maxTicketsPerWallet
      500n,          // totalSupply
      true,          // resaleEnabled
      true           // transferEnabled
    );
    const createEventReceipt = await createEventTx.wait();

    // Extract eventId from EventCreated log
    const eventCreatedLog = createEventReceipt!.logs.find((log) => {
      try {
        return ducketTickets.interface.parseLog(log as any)?.name === "EventCreated";
      } catch {
        return false;
      }
    });
    const parsedEventLog = ducketTickets.interface.parseLog(eventCreatedLog as any);
    eventId = parsedEventLog!.args[0] as bigint;

    // Create a ticket tier with both native and stable prices
    const createTierTx = await ducketTickets.connect(organizer).createTicketTier(
      eventId,
      "General Admission",
      "GA-",
      NATIVE_PRICE,
      STABLE_PRICE,
      MAX_SUPPLY
    );
    const createTierReceipt = await createTierTx.wait();

    // Extract tokenId from TicketTierCreated log
    const tierCreatedLog = createTierReceipt!.logs.find((log) => {
      try {
        return ducketTickets.interface.parseLog(log as any)?.name === "TicketTierCreated";
      } catch {
        return false;
      }
    });
    const parsedTierLog = ducketTickets.interface.parseLog(tierCreatedLog as any);
    tokenId = parsedTierLog!.args[0] as bigint;

    // Transfer test tokens to buyer and approve DucketTickets
    const contractAddress = await ducketTickets.getAddress();
    await testToken.connect(admin).transfer(buyer.address, 1_000_000_000n); // 1000 USDC
    await testToken.connect(admin).transfer(buyer2.address, 1_000_000_000n); // 1000 USDC
    await testToken.connect(buyer).approve(contractAddress, ethers.MaxUint256);
    await testToken.connect(buyer2).approve(contractAddress, ethers.MaxUint256);
  });

  // ─── CONT-03: stablePrice in TicketTier ────────────────────────────────────

  describe("CONT-03: TicketTier stablePrice field", function () {
    it("createTicketTier stores stablePrice; getTicketTier returns it", async function () {
      const tier = await ducketTickets.getTicketTier(tokenId);
      expect(tier.stablePrice).to.equal(STABLE_PRICE);
      expect(tier.price).to.equal(NATIVE_PRICE);
    });

    it("stablePrice is distinct from native price", async function () {
      const tier = await ducketTickets.getTicketTier(tokenId);
      expect(tier.stablePrice).to.not.equal(tier.price);
    });
  });

  // ─── CONT-02: mintTicketWithToken ──────────────────────────────────────────

  describe("CONT-02: mintTicketWithToken", function () {
    it("transfers USDC from buyer, mints ERC1155 ticket", async function () {
      const contractAddress = await ducketTickets.getAddress();
      const buyerBalanceBefore = await testToken.balanceOf(buyer.address);

      await ducketTickets.connect(buyer).mintTicketWithToken(tokenId, buyer.address, 1n);

      const buyerBalanceAfter = await testToken.balanceOf(buyer.address);
      expect(buyerBalanceBefore - buyerBalanceAfter).to.equal(STABLE_PRICE);

      // Buyer should now own 1 ticket
      const ticketBalance = await ducketTickets.balanceOf(buyer.address, tokenId);
      expect(ticketBalance).to.equal(1n);
    });

    it("distributes platform fee to platformWallet and remainder to organizer", async function () {
      const contractAddress = await ducketTickets.getAddress();
      const platformBalBefore = await testToken.balanceOf(platformWallet.address);
      const organizerBalBefore = await testToken.balanceOf(organizer.address);

      await ducketTickets.connect(buyer).mintTicketWithToken(tokenId, buyer.address, 1n);

      const platformBalAfter = await testToken.balanceOf(platformWallet.address);
      const organizerBalAfter = await testToken.balanceOf(organizer.address);

      const platformFee = 250n; // 2.5%
      const expectedFee = (STABLE_PRICE * platformFee) / 10000n;
      const expectedOrganizerAmount = STABLE_PRICE - expectedFee;

      expect(platformBalAfter - platformBalBefore).to.equal(expectedFee);
      expect(organizerBalAfter - organizerBalBefore).to.equal(expectedOrganizerAmount);
    });

    it("reverts if msg.value > 0 (non-payable rejects ETH)", async function () {
      await expect(
        ducketTickets.connect(buyer).mintTicketWithToken(tokenId, buyer.address, 1n, {
          value: ethers.parseEther("0.1"),
        })
      ).to.be.reverted;
    });

    it("reverts if USDC not approved (insufficient allowance)", async function () {
      // buyer2 has tokens but no approval
      await testToken.connect(buyer2).approve(await ducketTickets.getAddress(), 0n);

      await expect(
        ducketTickets.connect(buyer2).mintTicketWithToken(tokenId, buyer2.address, 1n)
      ).to.be.reverted;
    });

    it("has no MINTER_ROLE gate — any account can call with payment", async function () {
      // buyer has no MINTER_ROLE — should succeed because payment is the gate
      const MINTER_ROLE = await ducketTickets.MINTER_ROLE();
      expect(await ducketTickets.hasRole(MINTER_ROLE, buyer.address)).to.be.false;

      // Should succeed without role
      await expect(
        ducketTickets.connect(buyer).mintTicketWithToken(tokenId, buyer.address, 1n)
      ).to.not.be.reverted;
    });

    it("respects maxTicketsPerWallet limit", async function () {
      // MAX_PER_WALLET is 5, try to buy 6
      await expect(
        ducketTickets.connect(buyer).mintTicketWithToken(tokenId, buyer.address, 6n)
      ).to.be.revertedWith("Wallet limit exceeded");
    });
  });

  // ─── CONT-04: buyResaleTicketWithToken ────────────────────────────────────

  describe("CONT-04: buyResaleTicketWithToken", function () {
    let ticketNumber: bigint;

    beforeEach(async function () {
      // Buyer mints a ticket first
      await ducketTickets.connect(buyer).mintTicketWithToken(tokenId, buyer.address, 1n);
      ticketNumber = 0n; // first minted ticket is index 0

      // Buyer approves DucketTickets to transfer the ERC1155 ticket
      await ducketTickets
        .connect(buyer)
        .setApprovalForAll(await ducketTickets.getAddress(), true);

      // List the ticket for resale at stablePrice (within 150% cap)
      const resalePrice = STABLE_PRICE; // same as original — within cap
      await ducketTickets
        .connect(buyer)
        .listForResale(tokenId, ticketNumber, resalePrice, true);
    });

    it("listForResale with isStablecoin=true creates a stablecoin-denominated listing", async function () {
      const listing = await ducketTickets.getResaleListing(tokenId, ticketNumber);
      expect(listing.active).to.be.true;
      expect(listing.isStablecoin).to.be.true;
      expect(listing.price).to.equal(STABLE_PRICE);
    });

    it("transfers USDC from buyer, ticket from seller, distributes fee", async function () {
      const buyer2BalBefore = await testToken.balanceOf(buyer2.address);
      const sellerBalBefore = await testToken.balanceOf(buyer.address);
      const platformBalBefore = await testToken.balanceOf(platformWallet.address);

      await ducketTickets.connect(buyer2).buyResaleTicketWithToken(tokenId, ticketNumber);

      const buyer2BalAfter = await testToken.balanceOf(buyer2.address);
      const sellerBalAfter = await testToken.balanceOf(buyer.address);
      const platformBalAfter = await testToken.balanceOf(platformWallet.address);

      const platformFee = 250n;
      const expectedFee = (STABLE_PRICE * platformFee) / 10000n;
      const expectedSellerAmount = STABLE_PRICE - expectedFee;

      // buyer2 spent stablePrice
      expect(buyer2BalBefore - buyer2BalAfter).to.equal(STABLE_PRICE);
      // seller received amount minus fee
      expect(sellerBalAfter - sellerBalBefore).to.equal(expectedSellerAmount);
      // platform received fee
      expect(platformBalAfter - platformBalBefore).to.equal(expectedFee);

      // buyer2 now owns the ticket
      const buyer2TicketBal = await ducketTickets.balanceOf(buyer2.address, tokenId);
      expect(buyer2TicketBal).to.equal(1n);
    });

    it("reverts if listing is not a stablecoin listing", async function () {
      // Create a native-currency listing on a fresh ticket
      // First give admin MINTER_ROLE to mint via mintTicket
      const MINTER_ROLE = await ducketTickets.MINTER_ROLE();
      await ducketTickets.connect(admin).grantRole(MINTER_ROLE, organizer.address);

      await ducketTickets.connect(organizer).mintTicket(
        tokenId,
        buyer.address,
        1n,
        { value: NATIVE_PRICE }
      );
      const nativeTicketNumber = 1n; // second minted ticket

      await ducketTickets
        .connect(buyer)
        .listForResale(tokenId, nativeTicketNumber, NATIVE_PRICE, false);

      // Should revert because listing is not stablecoin
      await expect(
        ducketTickets.connect(buyer2).buyResaleTicketWithToken(tokenId, nativeTicketNumber)
      ).to.be.revertedWith("Listing is not a stablecoin listing");
    });

    it("enforces resale price cap via listForResale (stablecoin)", async function () {
      // Try to list above 150% of stable purchase price
      // Buyer already listed at ticketNumber 0; create a new setup
      // Mint another ticket and try to list above cap
      await testToken.connect(admin).transfer(buyer.address, 1_000_000_000n);
      await ducketTickets.connect(buyer).mintTicketWithToken(tokenId, buyer.address, 1n);
      const secondTicketNumber = 1n;

      const overCapPrice = STABLE_PRICE * 2n; // 200% of original — exceeds 150% cap
      await expect(
        ducketTickets
          .connect(buyer)
          .listForResale(tokenId, secondTicketNumber, overCapPrice, true)
      ).to.be.revertedWith("Price exceeds resale cap");
    });
  });

  // ─── CONT-05: Dual payment paths ──────────────────────────────────────────

  describe("CONT-05: Dual payment paths — native DOT and stablecoin coexist", function () {
    it("mintTicket (native DOT) still works with MINTER_ROLE after contract changes", async function () {
      const MINTER_ROLE = await ducketTickets.MINTER_ROLE();
      // admin already has MINTER_ROLE from deploy

      await expect(
        ducketTickets.connect(admin).mintTicket(tokenId, buyer.address, 1n, {
          value: NATIVE_PRICE,
        })
      ).to.not.be.reverted;

      const ticketBalance = await ducketTickets.balanceOf(buyer.address, tokenId);
      expect(ticketBalance).to.equal(1n);
    });

    it("both payment paths work on the same contract — stablecoin and native mints coexist", async function () {
      // Native mint via admin (MINTER_ROLE)
      await ducketTickets.connect(admin).mintTicket(tokenId, buyer.address, 1n, {
        value: NATIVE_PRICE,
      });

      // Stablecoin mint via buyer (no role required)
      await ducketTickets.connect(buyer).mintTicketWithToken(tokenId, buyer.address, 1n);

      // Buyer should own 2 tickets total (one from each path)
      const ticketBalance = await ducketTickets.balanceOf(buyer.address, tokenId);
      expect(ticketBalance).to.equal(2n);
    });
  });

  // ─── setPaymentToken ───────────────────────────────────────────────────────

  describe("setPaymentToken admin function", function () {
    it("allows admin to set payment token address", async function () {
      const newToken = await (await ethers.getContractFactory("TestERC20")).deploy();
      await newToken.waitForDeployment();

      await ducketTickets.connect(admin).setPaymentToken(await newToken.getAddress());
      expect(await ducketTickets.paymentToken()).to.equal(await newToken.getAddress());
    });

    it("reverts if non-admin tries to set payment token", async function () {
      await expect(
        ducketTickets.connect(buyer).setPaymentToken(await testToken.getAddress())
      ).to.be.reverted;
    });

    it("reverts if zero address is provided", async function () {
      await expect(
        ducketTickets.connect(admin).setPaymentToken(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid token address");
    });
  });
});
