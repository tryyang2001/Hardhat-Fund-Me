// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library EthPriceConverter {
    /**
        * @dev Returns the latest price of ETH -> USD
     */
    function getCurrentPriceTrend(AggregatorV3Interface priceFeed) internal view returns(uint256) {
        (, int256 price,,,) = priceFeed.latestRoundData();
        return uint256(price);
    }

    /**
        * @dev Returns the amount of ETH in USD
     */
    function convertToUSD(uint256 ethAmount, AggregatorV3Interface priceFeed) internal view returns(uint256) {
        uint256 ethPrice = getCurrentPriceTrend(priceFeed);
        uint256 ethAmountInUSD = (ethPrice * ethAmount) / 1000000000000000000;
        return ethAmountInUSD;
    }
}