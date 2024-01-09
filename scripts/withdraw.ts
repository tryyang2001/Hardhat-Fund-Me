import { ethers, getNamedAccounts } from "hardhat";
import { FundMe } from "../typechain-types";

async function withdraw() {
  const { deployer } = await getNamedAccounts();
  const contract: FundMe = await ethers.getContract("FundMe", deployer);
  const contractAddress = await contract.getAddress();
  console.log("Withdrawing from contract: ", contractAddress);
  const tx = await contract.withdraw();
  await tx.wait();
  console.log("Withdrawn from contract");
}

withdraw()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
