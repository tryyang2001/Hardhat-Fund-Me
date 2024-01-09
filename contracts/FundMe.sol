// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./EthPriceConverter.sol";

/**
    * @title FundMe
    * @dev This contract is used to fund the contract with ETH
    * @author tryyang2001
    * @notice You can use this contract for only the most basic simulation
    * @dev All function calls are currently implemented without side effects
 */
contract FundMe {
    // library declaration
    using EthPriceConverter for AggregatorV3Interface;

    // constants
    uint256 public constant MIN_FUND_IN_USD = 50;

    // variables
    // (funder => amount in wei)
    mapping(address => uint256) private addressToAmountFunded;
    address[] private funders;
    address private immutable owner;
    AggregatorV3Interface private immutable priceFeed;
    address private immutable priceFeedAddress;

    constructor(address _priceFeed) {
        owner = msg.sender;
        priceFeed = AggregatorV3Interface(_priceFeed);
        priceFeedAddress = _priceFeed;
    }

    function fund() public payable {
        require(EthPriceConverter.convertToUSD(msg.value, priceFeed) >= MIN_FUND_IN_USD, "The transaction amount is too low");

        // successful transaction
        addressToAmountFunded[msg.sender] += msg.value;
        funders.push(msg.sender);
    }

    function withdraw() public restrictToOwner {
        // use call for reliable transaction
        (bool success, ) = payable(msg.sender).call{value: address(this).balance}("");
        require(success, "Failed to withdraw funds from the contract");

        // reset the mapping
        for (uint256 i = 0; i < funders.length; i++) {
            addressToAmountFunded[funders[i]] = 0;
        }
    }

    // getter
    function getPriceFeedAddress() public view returns(address) {
        return priceFeedAddress;
    }

    function getPriceFeedVersion() public view returns(uint256) {
        return priceFeed.version();
    }

    function getOwner() public view returns(address) {
        return owner;
    }

    function getFunder(uint256 index) public view returns(address) {
        return funders[index];
    }

    function getAmountFunded(address funder) public view returns(uint256) {
        return addressToAmountFunded[funder];
    }

    modifier restrictToOwner() {
        require(msg.sender == owner, "You are not the owner of the contract");
        _;
    }

}