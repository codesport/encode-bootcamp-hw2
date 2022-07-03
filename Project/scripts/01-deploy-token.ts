import { ethers } from "ethers";
import "dotenv/config";
import * as tokenJson from "../artifacts/contracts/Token.sol/MyToken.json";

// yarn ts-node scripts/01-deploy-token.ts



const EXPOSED_KEY = "8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f";


async function main() {

//STEP 1: Connect Wallet
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? EXPOSED_KEY);
  console.log(`Using address ${wallet.address}`);

  const provider = ethers.providers.getDefaultProvider("ropsten");
  const signer = wallet.connect(provider);

  const balanceBN = await signer.getBalance();
  const balance = Number(ethers.utils.formatEther(balanceBN));
  console.log(`Wallet balance ${balance}`);
  if (balance < 0.01) {
    throw new Error("Not enough ether");
  }

//STEP 2:  Arg Check 

// if (process.argv.length < 4) throw new Error("missing delegate");
// const delegate = process.argv[3];


//STEP 3: Deploy Token Contract

  const tokenFactory = new ethers.ContractFactory(
    tokenJson.abi,
    tokenJson.bytecode,
    signer
  );


  const tokenContract = await tokenFactory.deploy();
  await tokenContract.deployed();
  console.log("Awaiting confirmations");
  console.log("Token Contract Address: " + tokenContract.address);
  

//STEP 4: Delegate Voting Tokens to my Frens ;-)




}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
