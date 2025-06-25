import {
  callReadOnlyFunction,
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  uintCV,
  stringAsciiCV,
  listCV,
  principalCV,
  ClarityValue,
  cvToString,
  ClarityType,
} from '@stacks/transactions';
import { StacksTestnet, StacksMainnet } from '@stacks/network';
import { userSession } from './auth';

// Contract configuration
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
export const CONTRACT_NAME = 'tokenvote';

// Network configuration
const network = process.env.NEXT_PUBLIC_NETWORK === 'mainnet' 
  ? new StacksMainnet() 
  : new StacksTestnet();

export interface Poll {
  id: number;
  creator: string;
  question: string;
  options: string[];
  startBlock: number;
  endBlock: number;
  votesCast: number;
  isActive: boolean;
}

export interface PollResults {
  pollId: number;
  question: string;
  options: string[];
  totalVotes: number;
  results: number[];
}

// Read-only function calls
export async function getPoll(pollId: number): Promise<Poll | null> {
  try {
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-poll',
      functionArgs: [uintCV(pollId)],
      network,
      senderAddress: CONTRACT_ADDRESS,
    });
    // Use ClarityType.OptionalSome and ClarityType.Tuple for type-safe checks

    if (result.type === ClarityType.OptionalSome && result.value.type === ClarityType.Tuple) {
      const pollData = result.value.data;
      return {
        id: pollId,
        creator: cvToString(pollData.creator),
        question: cvToString(pollData.question),
        options: (pollData.options.type === ClarityType.List
          ? pollData.options.list.map((opt: any) => cvToString(opt))
          : []),
        startBlock: parseInt(cvToString(pollData['start-block'])),
        endBlock: parseInt(cvToString(pollData['end-block'])),
        votesCast: parseInt(cvToString(pollData['votes-cast'])),
        isActive: pollData['is-active'].type === ClarityType.BoolTrue,
      };
    }
    return null;
    return null;
  } catch (error) {
    console.error('Error fetching poll:', error);
    return null;
  }
}

export async function getPollResults(pollId: number): Promise<PollResults | null> {
  try {
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-poll-results',
      functionArgs: [uintCV(pollId)],
      network,
      senderAddress: CONTRACT_ADDRESS,
    });

    if (result.type === ClarityType.ResponseOk && result.value.type === ClarityType.Tuple) {
      const resultsData = result.value.data;
      return {
        pollId: parseInt(cvToString(resultsData['poll-id'])),
        question: cvToString(resultsData.question),
        options: resultsData.options.type === ClarityType.List
          ? resultsData.options.list.map((opt: any) => cvToString(opt))
          : [],
        totalVotes: parseInt(cvToString(resultsData['total-votes'])),
        results: resultsData.results.type === ClarityType.List
          ? resultsData.results.list.map((count: any) => parseInt(cvToString(count)))
          : [],
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching poll results:', error);
    return null;
  }
}

export async function getUserVote(pollId: number, voterAddress: string): Promise<number | null> {
  try {
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-user-vote',
      functionArgs: [uintCV(pollId), principalCV(voterAddress)],
      network,
      senderAddress: CONTRACT_ADDRESS,
    });

    if (result.type === ClarityType.OptionalSome) {
      return parseInt(cvToString(result.value));
    }
    return null;
  } catch (error) {
    console.error('Error fetching user vote:', error);
    return null;
  }
}

export async function getPollCount(): Promise<number> {
  try {
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-poll-count',
      functionArgs: [],
      network,
      senderAddress: CONTRACT_ADDRESS,
    });

    if (result.type === ClarityType.UInt) {
      return parseInt(cvToString(result));
    }
    return 0;
  } catch (error) {
    console.error('Error fetching poll count:', error);
    return 0;
  }
}

export async function isPollActive(pollId: number): Promise<boolean> {
  try {
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'is-poll-active',
      functionArgs: [uintCV(pollId)],
      network,
      senderAddress: CONTRACT_ADDRESS,
    });

    return result.type === ClarityType.BoolTrue;
  } catch (error) {
    console.error('Error checking poll status:', error);
    return false;
  }
}

// Transaction functions
export async function createPoll(
  question: string,
  options: string[],
  startBlock: number,
  endBlock: number
): Promise<string> {
  if (!userSession.isUserSignedIn()) {
    throw new Error('User not signed in');
  }

  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'create-poll',
    functionArgs: [
      stringAsciiCV(question),
      listCV(options.map(opt => stringAsciiCV(opt))),
      uintCV(startBlock),
      uintCV(endBlock),
    ],
    senderKey: userSession.loadUserData().profile.stxAddress.testnet,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
  };

  const transaction = await makeContractCall(txOptions);
  const broadcastResponse = await broadcastTransaction(transaction, network);

  if (broadcastResponse.error) {
    throw new Error(broadcastResponse.error);
  }

  return broadcastResponse.txid;
}

export async function votePoll(pollId: number, optionIndex: number): Promise<string> {
  if (!userSession.isUserSignedIn()) {
    throw new Error('User not signed in');
  }

  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'vote',
    functionArgs: [
      uintCV(pollId),
      uintCV(optionIndex),
    ],
    senderKey: userSession.loadUserData().profile.stxAddress.testnet,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
  };

  const transaction = await makeContractCall(txOptions);
  const broadcastResponse = await broadcastTransaction(transaction, network);

  if (broadcastResponse.error) {
    throw new Error(broadcastResponse.error);
  }

  return broadcastResponse.txid;
}

export async function closePoll(pollId: number): Promise<string> {
  if (!userSession.isUserSignedIn()) {
    throw new Error('User not signed in');
  }

  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'close-poll',
    functionArgs: [uintCV(pollId)],
    senderKey: userSession.loadUserData().profile.stxAddress.testnet,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
  };

  const transaction = await makeContractCall(txOptions);
  const broadcastResponse = await broadcastTransaction(transaction, network);

  if (broadcastResponse.error) {
    throw new Error(broadcastResponse.error);
  }

  return broadcastResponse.txid;
}
