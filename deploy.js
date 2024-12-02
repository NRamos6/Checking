const hre = require("hardhat");

async function main() {
  // Step 1: Deploy the contract
  const Assessment = await hre.ethers.getContractFactory("Assessment");
  const assessment = await Assessment.deploy();
  await assessment.deployed();

  console.log(`VotingSystem contract deployed to: ${assessment.address}`);

  // Optionally: Check if petitions were registered by getting petitions count
  const petitionCount = await assessment.petitionsCount();
  console.log(`Total Petitions registered: ${petitionCount}`);
}

// Run the script
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
