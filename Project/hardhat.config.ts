import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle"; //plugin to build hard hast tests
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";

dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

const RINKEBY_RPC_URL = process.env.RINKEBY_RPC_URL
const ROPSTEN_RPC_URL = process.env.ROPSTEN_RPC_URL
const KOVAN_RPC_URL = process.env.KOVAN_RPC_URL
const HARMONY_RPC_URL = process.env.HARMONY_RPC_URL
const MUMBAI_RPC_URL  = process.env.MUMBAI_RPC_URL
const CHAINBLOCK_PRIVATE_KEY = process.env.CHAINBLOCK_PRIVATE_KEY
const CODESPORT_PRIVATE_KEY = process.env.CODESPORT_PRIVATE_KEY
const PRIVATE_KEY = process.env.PRIVATE_KEY

/**
 * @type import('hardhat/config').HardhatUserConfig
 * 
 * How to set-up: https://hardhat.org/config/#networks-configuration
 * 
 * To run and deploy script: npx hardhat run scripts/deploy-script.js --network matic
 * 
 * How to build hardhat tasks: https://hardhat.org/guides/create-task.html
 */

 const config: HardhatUserConfig = {

  
  defaultNetwork: "hardhat",//change to 'hardhat' to test
  networks: {
    hardhat: {
    },
    mumbai: {//comment this out to test
      url: "https://rpc-mumbai.maticvigil.com",
      accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
    },
    rinkeby: {//comment this out to test
      url: RINKEBY_RPC_URL || "",
      accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
    },    
    meter: {//seriously these guys are real idiots
      url: "https://rpctest.meter.io",
      accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
    },    
    ropsten: {
      url: ROPSTEN_RPC_URL || "",
      accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
   },
    harmony: {
      url: HARMONY_RPC_URL || "",
      accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
    },        
   kovan: {
    url: KOVAN_RPC_URL || "",
    accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
 }       
  },
  solidity: {
    version: "0.8.12",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./tests", //STUPID change
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 20000
  },
//NEW
  gasReporter: {
    enabled:true,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },  
}
export default config;