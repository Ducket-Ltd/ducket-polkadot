import { ethers } from "hardhat";

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  const vercelUrl = process.env.VERCEL_URL;

  if (!contractAddress) {
    throw new Error("CONTRACT_ADDRESS not set in environment variables");
  }

  if (!vercelUrl) {
    throw new Error("VERCEL_URL not set in environment variables (e.g., https://ducket-polkadot.vercel.app)");
  }

  console.log("Setting metadata URIs on DucketTickets...");
  console.log("Contract address:", contractAddress);
  console.log("Vercel URL:", vercelUrl);

  const DucketTickets = await ethers.getContractFactory("DucketTickets");
  const ducketTickets = DucketTickets.attach(contractAddress);

  // Set base URI for token metadata
  // Token metadata will be served at: {baseURI}{tokenId}
  // e.g., https://ducket-polkadot.vercel.app/metadata/0
  const baseURI = `${vercelUrl}/metadata/`;
  console.log("\nSetting base URI:", baseURI);
  const setURITx = await ducketTickets.setURI(baseURI);
  await setURITx.wait();
  console.log("Base URI set successfully!");

  // Set contract-level metadata URI
  // This is used by OpenSea and other marketplaces for collection info
  const contractURI = `${vercelUrl}/metadata/contract`;
  console.log("\nSetting contract URI:", contractURI);
  const setContractURITx = await ducketTickets.setContractURI(contractURI);
  await setContractURITx.wait();
  console.log("Contract URI set successfully!");

  console.log("\nMetadata configuration complete!");
  console.log("Token metadata URL pattern:", `${baseURI}{tokenId}`);
  console.log("Contract metadata URL:", contractURI);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
