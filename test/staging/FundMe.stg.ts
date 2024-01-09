import { ethers, getNamedAccounts, network } from "hardhat";
import { FundMe, MockV3Aggregator } from "../../typechain-types";
import { developmentChains } from "../../helpers/developmetChains";
import { expect } from "chai";

developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", () => {
      let contract: FundMe;
      let deployer: string;

      beforeEach(async () => {
        // directly get the address of the contract
        deployer = (await getNamedAccounts()).deployer;
        contract = await ethers.getContract("FundMe", deployer);
      });

      it("allow anyone to fund", async () => {
        const accounts = await ethers.getSigners();

        const tx = await contract.fund({
          value: ethers.parseEther("0.1"),
        });

        await tx.wait();

        expect(accounts[0].address).to.equal(deployer);
        const transaction = await contract.withdraw();
        await transaction.wait();

        const contractBalance = await ethers.provider.getBalance(
          await contract.getAddress()
        );

        expect(contractBalance).to.equal(0);
      });
    });
