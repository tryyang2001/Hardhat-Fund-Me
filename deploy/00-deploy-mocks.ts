import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const HARDHAT_CHAIN_ID = 31337;

const DECIMALS = 18;
const INITIAL_PRICE = "2000000000000000000000";

const deployMocks: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId || HARDHAT_CHAIN_ID;

  log("Detecting network...");
  if (chainId === HARDHAT_CHAIN_ID) {
    log("Detected Hardhat network - deploying mocks...");
    await deploy("MockV3Aggregator", {
      contract: "MockV3Aggregator",
      from: deployer,
      log: true,
      args: [DECIMALS, INITIAL_PRICE],
    });
    log("Done! Deployed MockV3Aggregator contract.");
  }
  log("------------------------------------");
};

export default deployMocks;
deployMocks.tags = ["all", "mocks"];
