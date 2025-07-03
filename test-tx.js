const { makeContractDeploy, AnchorMode, PostConditionMode } = require('@stacks/transactions');
const { StacksTestnet } = require('@stacks/network');
const fs = require('fs');

// Load environment variables
require('dotenv').config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const network = new StacksTestnet();

console.log('🚀 Testing deployment setup...');
console.log('🔑 Private key loaded:', PRIVATE_KEY ? 'YES' : 'NO');
console.log('🔑 Private key length:', PRIVATE_KEY ? PRIVATE_KEY.length : 'N/A');

try {
  // Load the contract source
  const contractSource = fs.readFileSync('contracts/TokenVote.clar', 'utf8');
  console.log('📜 Contract source loaded, length:', contractSource.length);
  
  console.log('🔨 Creating deployment transaction...');
  
  // Create the deployment transaction
  const deployTx = makeContractDeploy({
    contractName: 'tokenvote',
    codeBody: contractSource,
    senderKey: PRIVATE_KEY,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
    fee: 5000,
  });
  
  console.log('✅ Transaction created successfully!');
  console.log('📋 Transaction type:', deployTx.payload.payloadType);
  
} catch (error) {
  console.error('❌ Error creating transaction:', error.message);
  console.error('Full error:', error);
}
