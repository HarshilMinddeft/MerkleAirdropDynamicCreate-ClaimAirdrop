require("@nomiclabs/hardhat-waffle");

/** @type import('hardhat/config').HardhatUserConfig */
const bscscanApiKey = "6TVZGWC1BCNNMJ4UGWIZP1VR2AIBMFR825";
// const SEPOLIA_PRIVATE_KEY =
//   "757174aa1db90055355225c655fe56c00e42bef3acc0f6b20dd4de147d238c22";

module.exports = {
  solidity: "0.8.19",
  networks: {
    testnet: {
      url: "https://data-seed-prebsc-1-s1.bnbchain.org:8545",
      chainId: 97,
      gasPrice: 10000000000,
      accounts: {
        mnemonic: `pride year nut venue fatal trouble possible gown tent dream gorilla ridge`,
      },
    },
  },
  etherscan: {
    //bsc api key from bscScan
    apiKey: bscscanApiKey,
  },
  paths: {
    artifacts: "./client/src/artifacts",
  },
};
