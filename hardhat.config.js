require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
const PRIVATE_KEY = ""
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 500, // Adjust the number of runs as per your requirements
      },
    },
  },
  networks: {
    fantom: {
      url: `https://rpc.ankr.com/fantom`,
      accounts: [PRIVATE_KEY]
    }
  }

};