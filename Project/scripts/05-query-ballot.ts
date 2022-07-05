import { ethers } from "ethers";
import "dotenv/config";
import * as ballotJson from "../artifacts/contracts/CustomBallot.sol/CustomBallot.json";
import { CustomBallot } from "../typechain";


// yarn ts-node scripts/05-query-ballot.ts 0xBalllotAddress 

//Ballot Contract Address: 0xFD00178690757B3A8Da935F932b6Fd1804f38264

//NEW Ballot Contract Address: 0x0fF32019bf03528451b41CbA75206Ca8CF6D8D52

const EXPOSED_KEY = "8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f";

const convertBytes32ToString = ( input: {name: string, voteCount: any}) =>{
	return ethers.utils.parseBytes32String(input.name)
}


const main = async () => {

	//1. Connect Wallet
	const wallet =
	process.env.MNEMONIC && process.env.MNEMONIC.length > 0
		? ethers.Wallet.fromMnemonic(process.env.MNEMONIC)
		: new ethers.Wallet(process.env.PRIVATE_KEY ?? EXPOSED_KEY);

	const provider = ethers.providers.getDefaultProvider("ropsten");
	const signer = wallet.connect(provider);


	//2. Read CLI Arguments
	if (process.argv.length < 3) throw new Error("missing ballot address as arg");
	const ballotAddress = process.argv[2];


	//3. Create Contract Instance/Instantiate Contract
	const ballotContract = new ethers.Contract(
		ballotAddress,
		ballotJson.abi,
		signer
	) as CustomBallot;

	
	//4. Manually Query Public Vatiables
	/**
	 * Hack to access Solidity array without a getter
	 * 
	 * 1. Public solidity arrays cannot be directly accessed on client if not explicity 
	 *     returned with a getter function
	 * 
	 * 2. Therefore must resort to this while loop hack to access it
	 * 
	 * 3. Takeaway:  Add getter functions to your solidity arrays
	 */
	 let i: number = 0
	 let proposalArrOfObj: any[] =[] //https://learnxinyminutes.com/docs/typescript/
	 let tempObject: {name: string, voteCount: any}
 
	while (true) {
		try {
			tempObject = await ballotContract.proposals(i);
			
			if (tempObject) {
				//console.log("Proposal Inside Loop", proposalArrOfObj);
				proposalArrOfObj.push({
					name: ethers.utils.parseBytes32String(tempObject.name), 
					votesReceived: ethers.utils.formatEther(tempObject.voteCount) 
					})
				i++
			}
		} catch (e) {
			break;
		}	
	}
	//Sorting and Array of JS Objects by a Specific Key: https://stackoverflow.com/a/979289/946957
	proposalArrOfObj.sort((a, b) => parseFloat(b.votesReceived) - parseFloat(a.votesReceived));
	console.log("QUERY 1. Historical Snapshot of Proposal Status Sorted in Descending Order:",  proposalArrOfObj)
	console.log("QUERY 2. Historical Winning Proposal: " + ethers.utils.parseBytes32String(await ballotContract.winnerName()))



	//5. Event Filters using contract object: https://docs.ethers.io/v4/api-contract.html#contract-event-filters
	let filter1 = ballotContract.filters.Voted(null) //null tells us to "filter" on any wallet address. Add specific address if needed
	let filter1Data: any[] =[] // iterative
	
	ballotContract.on(filter1, (voter, proposal, weight, proposalVotes, event) => {

		const name = async () =>{
			let proposalFilterObj = await ballotContract.proposals( +proposal )
			//let filter1Data: any[] =[]	//always single array
		
			filter1Data.push({
				voterAddress: voter, 
				proposalNumber: +proposal,
				ProposalName: convertBytes32ToString(proposalFilterObj),
				votesAllocated: +weight, 
				totalVotesReceived: +proposalVotes, 
				blockNumber: event.blockNumber
			})
			console.log('QUERY 3. Event Filters using contract object:')
			console.log(filter1Data)
			//console.log(convertBytes32ToString(proposalFilterObj))
			console.log("QUERY 3b. Winning Proposal: " + ethers.utils.parseBytes32String(await ballotContract.winnerName()))
		}
		name()
	
	})

	//6. Setup Event Listeners: https://docs.ethers.io/v4/api-contract.html#contract-event-filters
	ballotContract.on("Voted", (voter, proposal, weight, proposalVotes, event) => {
		console.log('QUERY 4. This is an Event Listner:')
		// Called when anyone changes the value
		console.log( `Event Listener for QUERY 4: ${voter}, vote on proposal id  ${proposal}` );
		// See Event Emitter below for all properties on Event
		console.log("Event Listener for QUERY 4: Block Number " + event.blockNumber);
		// 4115004
	});	

	/**
	 *  If Getter function were provide, access solidity array with a map
	 * can only iterate arrays on blockchain that has an explicit getter function
	 */
    // const proposalArrayOfStructsObj = await ballotContract.proposals()
    // const proposalStatusArrayOfObj = proposalArrayOfStructsObj.map (singleItem => (
    //     {
    //         proposalName: singleItem.name,
    //         voteCount:    singleItem.voteCount

    //     }
    // ))


    // proposalStatusArrayOfObj.map( singleItem, index =>
    //   console.log( `Proposal ${index} Name: ${convertStringArrayToBytes32(singleItem.proposalName)}` )
    //   console.log( `Proposal ${index} Vote Count: ${singleItem.voteCount}` )

    // )

}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});

	//6. Event filters using provider
	// let filter2 = {
	// 	address: ballotAddress ,
	// 	topics: [	
	// 		// the name of the event, parnetheses containing the data type of each event, no spaces
	// 		ethers.utils.id("Voted(address,unit256,uint256,uint256)")
	// 	]
	// }
	// provider.on(filter2, (voter, proposal, weight, proposalVotes,event) => {
	// 	// do whatever you want here
	// 	// I'm pretty sure this returns a promise, so don't forget to resolve it
	// 	console.log('6. Event filters using provider:')
	// 	let filter2Data: any[] =[]

	// 	filter2Data.push({
	// 		voterAddress: voter, 
	// 		proposalVotedOn: proposal,//ethers.utils.parseBytes32String(proposalFilterObj), 
	// 		votesAllocated: weight, 
	// 		totalVotesReceived: proposalVotes 
	// 	})


	// 	console.log('6. Event filters using provider:')
	// 	console.log(filter2Data)

	// })