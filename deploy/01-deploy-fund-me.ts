import { network } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { priceFeedAddressMapper } from "../helpers/priceFeedAddressMapper";

import { DeployFunction } from "hardhat-deploy/types";
import { developmentChains } from "../helpers/developmetChains";

const HARDHAT_CHAIN_ID = 31337;

const deployFundMeContract: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { getNamedAccounts, deployments } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  const chainId = hre.network.config.chainId || HARDHAT_CHAIN_ID;

  let priceFeedAddress: string;
  let blockConfirmation: number;

  if (chainId === HARDHAT_CHAIN_ID) {
    const mockedPriceFeed = await deployments.get("MockV3Aggregator");
    priceFeedAddress = mockedPriceFeed.address;
    blockConfirmation = 1;
  } else {
    priceFeedAddress = priceFeedAddressMapper[chainId].priceFeedAddress;
    blockConfirmation = 6;
  }

  log("Deploying FundMe contract...");
  const contract = await deploy("FundMe", {
    from: deployer,
    args: [priceFeedAddress],
    log: true,
    waitConfirmations: blockConfirmation,
  });
  log("Done! Deployed FundMe contract.");
  log("------------------------------------");

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log("Verifying FundMe contract...");
    try {
      await hre.run("verify:verify", {
        address: contract.address,
        constructorArguments: [priceFeedAddress],
      });
      log("Done! Verified FundMe contract.");
    } catch (error) {
      log("Failed to verify FundMe contract.");
      log(
        "The contract might already be verified. See the error message in details"
      );
      log(error);
    }

    log("------------------------------------");
  }
};

export default deployFundMeContract;
deployFundMeContract.tags = ["all", "fund-me"];
