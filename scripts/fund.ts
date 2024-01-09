import { ethers, getNamedAccounts } from "hardhat";
import { FundMe } from "../typechain-types";

async function fund() {
  const { deployer } = await getNamedAccounts();
  const contract: FundMe = await ethers.getContract("FundMe", deployer);

  const contractAddress = await contract.getAddress();

  console.log("Funding contract at address: ", contractAddress);

  const tx = await contract.fund({
    value: ethers.parseEther("0.1"),
  });

  await tx.wait();

  console.log("Funded 0.1 ETH to contract");
}

fund()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
