import {
  makeContractDeploy,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  getAddressFromPrivateKey,
  TransactionVersion,
} from '@stacks/transactions';
import { StacksTestnet } from '@stacks/network';
import * as fs from 'fs';

async function testDeploy() {
  const PRIVATE_KEY = '9369011f7232ba28f8c3b49525c57e652bedf5c374772cdca2fa86b582572ce001';
  const network = new StacksTestnet();
  
  console.log('🚀 Starting deployment...');
  
  const senderAddress = getAddressFromPrivateKey(PRIVATE_KEY, TransactionVersion.Testnet);
  console.log('📍 Deployer address:', senderAddress);
  
  try {
    // Read the contract source
    const contractSource = fs.readFileSync('./contracts/TokenVote.clar', 'utf8');
    console.log('📜 Contract source loaded, length:', contractSource.length);
    
    // Create deployment transaction
    const deployTx = await makeContractDeploy({
      contractName: 'tokenvote',
      codeBody: contractSource,
      senderKey: PRIVATE_KEY,
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      fee: 5000,
    });
    
    console.log('📝 Transaction created, broadcasting...');
    
    const response = await broadcastTransaction(deployTx, network);
    
    console.log('📡 Response received:', response);
    
    if (typeof response === 'string') {
      // Response is a transaction ID
      console.log('✅ Contract deployed successfully!');
      console.log('🆔 Transaction ID:', response);
      console.log('📋 Contract Address:', `${senderAddress}.tokenvote`);
      console.log('🔍 Explorer:', `https://explorer.stacks.co/txid/${response}?chain=testnet`);
    } else if (response.error) {
      console.error('❌ Deployment failed:', response.error);
      console.error('Reason:', response.reason);
    } else {
      console.log('✅ Contract deployed successfully!');
      console.log('🆔 Transaction ID:', response.txid || response);
      console.log('📋 Contract Address:', `${senderAddress}.tokenvote`);
      console.log('🔍 Explorer:', `https://explorer.stacks.co/txid/${response.txid || response}?chain=testnet`);
    }
  } catch (error) {
    console.error('💥 Error during deployment:', error.message);
    console.error('Full error:', error);
    if (error.response) {
      console.error('Response error:', error.response.data);
    }
  }
}

testDeploy();
