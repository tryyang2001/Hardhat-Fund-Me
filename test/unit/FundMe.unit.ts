import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import { FundMe, MockV3Aggregator } from "../../typechain-types";
import { expect } from "chai";
import { developmentChains } from "../../helpers/developmetChains";

developmentChains.includes(network.name) &&
  describe("FundMe", () => {
    let contract: FundMe;
    let deployer: string;
    let mockedPriceFeed: MockV3Aggregator;
    beforeEach("setup", async () => {
      // deploy FundMe contract on hardhat network
      deployer = (await getNamedAccounts()).deployer;
      await deployments.fixture(["all"]);
      contract = await ethers.getContract("FundMe", deployer);

      mockedPriceFeed = await ethers.getContract("MockV3Aggregator", deployer);
    });

    describe("constructor", () => {
      it("should initialize the price feed with the correct address", async () => {
        const priceFeedAddress = await contract.getPriceFeedAddress();
        expect(priceFeedAddress).to.equal(await mockedPriceFeed.getAddress());
      });
    });

    describe("fund", () => {
      it("should log the funder and the amount funded", async () => {
        await contract.fund({
          value: ethers.parseEther("1"),
        });
        const funderAddress = deployer;

        expect(await contract.getFunder(0)).to.equal(funderAddress);
        expect(await contract.getAmountFunded(funderAddress)).to.equal(
          ethers.parseEther("1")
        );
      });

      it("should block funding if the amount funded is less than $50", async () => {
        await expect(contract.fund()).to.be.revertedWith(
          "The transaction amount is too low"
        );
      });
    });

    describe("withdraw", () => {
      beforeEach(async () => {
        await contract.fund({
          value: ethers.parseEther("3"),
        });
      });

      it("should withdraw the correct amount of funds and reset all funds", async () => {
        // Arrange
        const contractAddress = await contract.getAddress();
        const initialBalance = await ethers.provider.getBalance(deployer);
        const initialContractBalance = await ethers.provider.getBalance(
          contractAddress
        );

        // Act
        const transactionResponse = await contract.withdraw();
        const transactionReceipt = await transactionResponse.wait();

        // Assert
        expect(transactionReceipt).is.not.null;

        const { gasUsed, gasPrice } = transactionReceipt!;
        const gasCost = gasUsed * gasPrice;

        expect(await ethers.provider.getBalance(contractAddress)).to.equal(0);

        const currentBalance = await ethers.provider.getBalance(deployer);

        // current balance = initial balance + initial balance from contract (after receiving funds) - gas cost (the cost used for withdraw)
        expect(currentBalance + gasCost).to.equal(
          initialBalance + initialContractBalance
        );
      });

      it("support multiple withdraws", async () => {
        // Arrange
        const contractAddress = await contract.getAddress();
        const initialBalance = await ethers.provider.getBalance(deployer);
        const initialContractBalance = await ethers.provider.getBalance(
          contractAddress
        );

        // Act
        const transactionResponse = await contract.withdraw(); //withdraw 3 ETH
        const transactionReceipt = await transactionResponse.wait();
        const { gasUsed, gasPrice } = transactionReceipt!;

        let gasCost = gasUsed * gasPrice;

        // Assume there is a new funding
        const accounts = await ethers.getSigners();
        await contract.connect(accounts[1]).fund({
          value: ethers.parseEther("2"),
        });

        const contractBalanceAfterSecondFund = await ethers.provider.getBalance(
          contractAddress
        );

        // withdraw again
        const transactionResponse2 = await contract.withdraw(); //withdraw 2 ETH
        const transactionReceipt2 = await transactionResponse2.wait();
        const { gasUsed: gasUsed2, gasPrice: gasPrice2 } = transactionReceipt2!;
        gasCost += gasUsed2 * gasPrice2;

        // Assert
        expect(await ethers.provider.getBalance(contractAddress)).to.equal(0);

        const currentBalance = await ethers.provider.getBalance(deployer);

        expect(currentBalance).to.equal(
          initialBalance +
            initialContractBalance +
            contractBalanceAfterSecondFund -
            gasCost
        );
      });
    });
  });
