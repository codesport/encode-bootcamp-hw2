import { ethers } from "ethers";
import "dotenv/config";
import * as tokenjson from "../artifacts/contracts/Token.sol/MyToken.json";
// eslint-disable-next-line node/no-missing-import
import { MyToken } from "../typechain";


// yarn ts-node scripts/02-self-delegate-vote.ts 0xTokenAddress 0xWalletAddress


//Token Contract Address:  0x8FF0e8bf8332784A7B718706666321A1ee2722fC

const EXPOSED_KEY = "8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f";

const main = async () => {
  const wallet =
    process.env.MNEMONIC && process.env.MNEMONIC.length > 0
      ? ethers.Wallet.fromMnemonic(process.env.MNEMONIC)
      : new ethers.Wallet(process.env.PRIVATE_KEY ?? EXPOSED_KEY);

  const provider = ethers.providers.getDefaultProvider("ropsten");
  const signer = wallet.connect(provider);



  if (process.argv.length < 3) {
    throw new Error("missing token address as arg");
  }
  const tokenAddress = process.argv[2]

  if (process.argv.length < 4){
     throw new Error("missing delegate address as arg");
  }
  const delegate = process.argv[3];

  console.log(
    `Attaching ballot contract interface to address ${tokenAddress}`
  );


  const tokenContract = new ethers.Contract(
    tokenAddress,
    tokenjson.abi,
    signer
  ) as MyToken;

  
  try {
    console.log(`${signer.address} is delegating vote to ${delegate}`);
    const tx = await tokenContract.delegate(delegate);
    console.log("Waiting for confirmation");
    await tx.wait();
    console.log(`Delegate Transaction Completed. Hash: ${tx.hash}`);
  } catch (e: any) {
    console.log(e);
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
