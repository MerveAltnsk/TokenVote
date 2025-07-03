const { makeContractDeploy, broadcastTransaction, AnchorMode, PostConditionMode } = require('@stacks/transactions');
const { StacksTestnet } = require('@stacks/network');
const fs = require('fs');

// Load environment variables first
require('dotenv').config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const network = new StacksTestnet();

async function deployContract() {
  try {
    console.log('🚀 Starting deployment...');
    console.log('🔑 Using private key:', PRIVATE_KEY ? `${PRIVATE_KEY.substring(0, 8)}...` : 'NOT FOUND');
    
    if (!PRIVATE_KEY) {
      throw new Error('PRIVATE_KEY not found in .env file');
    }
    
    // Load the contract source
    const contractSource = fs.readFileSync('contracts/TokenVote.clar', 'utf8');
    console.log('📜 Contract source loaded, length:', contractSource.length);
    
    // Create the deployment transaction
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
    
    // Try to broadcast the transaction
    const response = await broadcastTransaction(deployTx, network);
    
    console.log('📡 Raw response:', JSON.stringify(response, null, 2));
    
    return response;
    
  } catch (error) {
    console.error('💥 Error during deployment:');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    if (error.response) {
      console.error('Response:', error.response);
    }
    return null;
  }
}

// Load environment variables was moved to the top
// require('dotenv').config();

deployContract().then((result) => {
  if (result) {
    console.log('✅ Deployment completed');
  } else {
    console.log('❌ Deployment failed');
  }
}).catch((error) => {
  console.error('💥 Unhandled error:', error);
});
