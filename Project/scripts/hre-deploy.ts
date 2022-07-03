
//const ethers = require("hardhat")
//const hre = require("hardhat")
import { ethers } from "hardhat"; //for TypeScript we only import. No requires.
import hre from "hardhat";

import { CustomBallot, MyToken } from "../typechain";


let ballotContract: CustomBallot;
let ballotFactory: any;
let tokenFactory: any;
let tokenContract: MyToken

let PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"];
const BASE_VOTE_POWER = "10"
const USED_VOTE_POWER =5

const proposals32Bytes = PROPOSALS.map((item, index) =>  
    hre.ethers.utils.formatBytes32String(item)
);

const main = async () =>{
    
    console.log('32 Byte Proposals: ')
    console.log(proposals32Bytes)
    
    //store ower address and a random address in a constant
    const [owner, user1, user2] = await hre.ethers.getSigners();

    // 01 Deploy Token: compile contract and generate the necessary files (e.g., ABI) in artifacts directory
    tokenFactory = await hre.ethers.getContractFactory("MyToken"); 
    tokenContract = await tokenFactory.deploy() 
    await tokenContract.deployed()


    //02: Voting Power: (1) Mint Number of Tokens Required to Vote (2) Self Delegate Tokens to Obtain Voting Power

    let mintTx = await tokenContract.mint( owner.address, ethers.utils.parseEther(BASE_VOTE_POWER) );
    await mintTx.wait();

    mintTx = await tokenContract.mint( user1.address, ethers.utils.parseEther(BASE_VOTE_POWER) );
    await mintTx.wait();

    mintTx = await tokenContract.mint( user2.address, hre.ethers.utils.parseEther(BASE_VOTE_POWER) );
    await mintTx.wait();

    let selfDelegateTx = await tokenContract.delegate(owner.address)
    await selfDelegateTx.wait();

    selfDelegateTx = await tokenContract.connect(user1).delegate(user1.address)
    await selfDelegateTx.wait();

    selfDelegateTx = await tokenContract.connect(user2).delegate(user2.address)
    await selfDelegateTx.wait(); 

    //03 Deploy Ballot
    ballotFactory = await hre.ethers.getContractFactory("CustomBallot");  // <== use contract name here (not name of file)

    console.log("Deploying Ballot contract");
    console.log("Proposals: ");
   
    PROPOSALS.forEach((element, index) => {
      console.log(`Proposal N. ${index + 1}: ${element}`);
    });

    ballotContract = await ballotFactory.deploy( proposals32Bytes, tokenContract.address)
    await ballotContract.deployed();

    console.log("Token Contract deployed TO:", tokenContract.address); 
    console.log("Ballot Contract deployed TO:", ballotContract.address); 
    console.log("Contract deployed BY: ", owner.address);   


    
    //Check voting power after Minting tokens for owner and users 1 and 2
    console.log('User 1 Voting Power: ' + ethers.utils.formatEther( await tokenContract.getVotes(owner.address ) ) )
    console.log('User 1 Voting Power: ' + ethers.utils.formatEther( await tokenContract.getVotes(user1.address ) ) )
    console.log('User 2 Voting Power: ' + hre.ethers.utils.formatEther(  await tokenContract.getVotes(user2.address ) ) )
  
//Voting Power:                           proposal, used voting power   
  let voteTx = await ballotContract.connect(user1).vote(0, 5);
  await voteTx.wait();

  voteTx = await ballotContract.connect(user2).vote(2, 10);
  await voteTx.wait();

  let votedProposal = await ballotContract.proposals(0)
  console.log('Vote Count for Proposal 0: ' + votedProposal.voteCount )



}


//boiler plate
const runMain = async () => {
    try {
      await main();
      process.exit(0);
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
  };
  
  runMain();
  //npx hardhat run scripts/deploy-RafflePseudo4.js --network rinkeby
  //https://hardhat.org/hardhat-network#running-stand-alone-in-order-to-support-wallets-and-other-software
  //yarn hardhat run scripts/hre-deploy.ts --network localhost
  //yarn hardhat run scripts/hre-deploy.ts --network hardhat