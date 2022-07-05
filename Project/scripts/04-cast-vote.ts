import { ethers } from "ethers";
import "dotenv/config";
import * as ballotJson from "../artifacts/contracts/CustomBallot.sol/CustomBallot.json";
import { CustomBallot } from "../typechain";


// yarn ts-node scripts/04-cast-vote.ts 0xBalllotAddress ProposalNumber VotingPowerAmount

//Ballot Contract Address: 0xFD00178690757B3A8Da935F932b6Fd1804f38264

//NEW Ballot Contract Address: 0x0fF32019bf03528451b41CbA75206Ca8CF6D8D52

const EXPOSED_KEY = "8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f";

const main = async () => {
  const wallet =
    process.env.MNEMONIC && process.env.MNEMONIC.length > 0
      ? ethers.Wallet.fromMnemonic(process.env.MNEMONIC)
      : new ethers.Wallet(process.env.PRIVATE_KEY ?? EXPOSED_KEY);

  const provider = ethers.providers.getDefaultProvider("ropsten");
  const signer = wallet.connect(provider);


  if (process.argv.length < 3) throw new Error("missing ballot address as arg");
  const ballotAddress = process.argv[2];

  if (process.argv.length < 4) throw new Error("missing proposal to vote on");
  const proposal = process.argv[3];

  if (process.argv.length < 5) throw new Error("missing voting power amount");
  const usedVotePower = process.argv[4];

  if (typeof +proposal !== "number") throw new Error("proposal arg has to be a number");


  const ballotContract = new ethers.Contract(
    ballotAddress,
    ballotJson.abi,
    signer
  ) as CustomBallot;

  
    let votingPower = await ballotContract.votingPower()
    console.log("Your Voting Power Before Voting: " + votingPower);


  try {
    const tx = await ballotContract.vote(+proposal, ethers.utils.parseEther(usedVotePower) );
    console.log("Waiting for confirmation");
    await tx.wait();
    console.log(`Vote Transaction Completed. Hash: ${tx.hash}`);
  } catch (e: any) {
    console.log(e);
  }


  const spentVotes = await ballotContract.spentVotePower( signer.address) //Hash Table; Query: mapping(address => uint256) public spentVotePower;
  console.log(`Voting Power used by ${signer.address}  + ${spentVotes}` )

  const votedProposal = await ballotContract.proposals(proposal)
  console.log('Voted Proposal Number: ' + proposal   )
  console.log('Voted Proposal Name: ' + ethers.utils.parseBytes32String(votedProposal.name) )
  console.log('Voted Proposal Total Vote Count: '  + votedProposal.voteCount  )
  
  votingPower = await ballotContract.votingPower()
  console.log("Your Voting Power After Voting: " + votingPower);






}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
