/**
 * Map of price feed addresses by network chain id.
 */
export const priceFeedAddressMapper: {
  [key: number]: {
    name: string;
    priceFeedAddress: string;
  };
} = {
  // Sepolia testnet
  11155111: {
    name: "sepolia",
    priceFeedAddress: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
  },
  // Goerli testnet
  5: {
    name: "goerli",
    priceFeedAddress: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
  },
};
