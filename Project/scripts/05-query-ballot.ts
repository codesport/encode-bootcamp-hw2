import { ethers } from "ethers";
import "dotenv/config";
import * as ballotJson from "../artifacts/contracts/CustomBallot.sol/CustomBallot.json";
// eslint-disable-next-line node/no-missing-import
// TypeScript
import { CustomBallot } from "../typechain";


// yarn ts-node scripts/05-query-ballots.ts 0xBalllotAddress 

//Ballot Contract Address: 0xFD00178690757B3A8Da935F932b6Fd1804f38264

const EXPOSED_KEY = "8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f";

const main = async () => {
  const wallet =
    process.env.MNEMONIC && process.env.MNEMONIC.length > 0
      ? ethers.Wallet.fromMnemonic(process.env.MNEMONIC)
      : new ethers.Wallet(process.env.PRIVATE_KEY ?? EXPOSED_KEY);

  const provider = ethers.providers.getDefaultProvider("ropsten");
  const signer = wallet.connect(provider);


    // TODO:  Add event queries
    // TODO: create ballots from snapshots, interact with the ballots and inspect result



}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
