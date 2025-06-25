import {
  makeContractDeploy,
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  getAddressFromPrivateKey,
  TransactionVersion,
} from '@stacks/transactions';
import { StacksTestnet, StacksMainnet } from '@stacks/network';
import * as fs from 'fs';

// Configuration
const NETWORK = process.env.NETWORK || 'testnet';
const PRIVATE_KEY = process.env.PRIVATE_KEY || '';
const CONTRACT_NAME = 'tokenvote';

if (!PRIVATE_KEY) {
  console.error('Please set PRIVATE_KEY environment variable');
  process.exit(1);
}

const network = NETWORK === 'mainnet' ? new StacksMainnet() : new StacksTestnet();
const senderAddress = getAddressFromPrivateKey(
  PRIVATE_KEY,
  NETWORK === 'mainnet' ? TransactionVersion.Mainnet : TransactionVersion.Testnet
);

async function deployContract() {
  try {
    console.log(`Deploying TokenVote contract to ${NETWORK}...`);
    console.log(`Deployer address: ${senderAddress}`);

    // Read the contract source code
    const contractSource = fs.readFileSync('./contracts/TokenVote.clar', 'utf8');

    // Create the deployment transaction
    const deployTx = await makeContractDeploy({
      contractName: CONTRACT_NAME,
      codeBody: contractSource,
      senderKey: PRIVATE_KEY,
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      fee: 10000, // 0.01 STX
    });

    console.log('Broadcasting transaction...');
    const broadcastResponse = await broadcastTransaction(deployTx, network);
    
    if (broadcastResponse.error) {
      console.error('Deployment failed:', broadcastResponse.error);
      console.error('Reason:', broadcastResponse.reason);
      process.exit(1);
    }

    console.log('✅ Contract deployed successfully!');
    console.log('Transaction ID:', broadcastResponse.txid);
    console.log(`Contract Address: ${senderAddress}.${CONTRACT_NAME}`);
    console.log(`Explorer URL: https://explorer.stacks.co/txid/${broadcastResponse.txid}?chain=${NETWORK}`);

    // Save deployment info
    const deploymentInfo = {
      network: NETWORK,
      contractAddress: `${senderAddress}.${CONTRACT_NAME}`,
      transactionId: broadcastResponse.txid,
      deployedAt: new Date().toISOString(),
    };

    if (!fs.existsSync('./deployments')) {
      fs.mkdirSync('./deployments');
    }

    fs.writeFileSync(
      `./deployments/${NETWORK}-deployment.json`,
      JSON.stringify(deploymentInfo, null, 2)
    );

    console.log(`Deployment info saved to ./deployments/${NETWORK}-deployment.json`);

  } catch (error) {
    console.error('Deployment error:', error);
    process.exit(1);
  }
}

// Run deployment
deployContract();
