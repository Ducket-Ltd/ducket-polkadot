import { expect } from "chai";
import { ethers } from "hardhat";
import { MockUSDC } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("MockUSDC", function () {
  let mockUSDC: MockUSDC;
  let deployer: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;

  beforeEach(async function () {
    [deployer, user1, user2] = await ethers.getSigners();
    const MockUSDCFactory = await ethers.getContractFactory("MockUSDC");
    mockUSDC = (await MockUSDCFactory.deploy()) as MockUSDC;
    await mockUSDC.waitForDeployment();
  });

  it("deploys without error", async function () {
    expect(await mockUSDC.getAddress()).to.be.properAddress;
  });

  it("decimals() returns 6", async function () {
    expect(await mockUSDC.decimals()).to.equal(6);
  });

  it("deployer balance is 1,000,000 * 10^6 after construction", async function () {
    const expectedBalance = 1_000_000n * 10n ** 6n;
    expect(await mockUSDC.balanceOf(deployer.address)).to.equal(expectedBalance);
  });

  it("name() returns 'USD Coin (Mock)' and symbol() returns 'USDC'", async function () {
    expect(await mockUSDC.name()).to.equal("USD Coin (Mock)");
    expect(await mockUSDC.symbol()).to.equal("USDC");
  });

  it("faucet(1000 * 10^6) mints 1000 USDC to caller", async function () {
    const amount = 1000n * 10n ** 6n;
    await mockUSDC.connect(user1).faucet(amount);
    expect(await mockUSDC.balanceOf(user1.address)).to.equal(amount);
  });

  it("faucet(10001 * 10^6) reverts with 'Max 10,000 USDC per faucet'", async function () {
    const amount = 10_001n * 10n ** 6n;
    await expect(
      mockUSDC.connect(user1).faucet(amount)
    ).to.be.revertedWith("Max 10,000 USDC per faucet");
  });

  it("two different accounts can each call faucet independently", async function () {
    const amount = 5000n * 10n ** 6n;
    await mockUSDC.connect(user1).faucet(amount);
    await mockUSDC.connect(user2).faucet(amount);
    expect(await mockUSDC.balanceOf(user1.address)).to.equal(amount);
    expect(await mockUSDC.balanceOf(user2.address)).to.equal(amount);
  });
});
