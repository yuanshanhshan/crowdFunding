import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    bscTestnet: {
      url: "https://bsc-testnet.bnbchain.org",
      chainId: 97,
      accounts: [
        process.env.TESTNET_PRIVATE_KEY || "",
      ],
    },
  },

  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
