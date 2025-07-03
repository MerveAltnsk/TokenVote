const { makeContractDeploy, broadcastTransaction, AnchorMode, PostConditionMode, createStacksPrivateKey } = require('@stacks/transactions');
const { StacksTestnet } = require('@stacks/network');
const fs = require('fs');

require('dotenv').config();

async function deployContract() {
  try {
    console.log('🚀 Starting TokenVote deployment...');
    
    // Handle the private key
    let privateKeyHex = process.env.PRIVATE_KEY;
    if (privateKeyHex.length > 64) {
      privateKeyHex = privateKeyHex.substring(0, 64);
    }
    
    console.log('🔑 Private key length:', privateKeyHex.length);
    
    // Create the private key object
    const privateKey = createStacksPrivateKey(privateKeyHex);
    const network = new StacksTestnet();
    
    // Load the contract source
    const contractSource = fs.readFileSync('contracts/TokenVote.clar', 'utf8');
    console.log('📜 Contract source loaded, length:', contractSource.length);
    
    // Create the deployment transaction
    const deployTx = await makeContractDeploy({
      contractName: 'tokenvote',
      codeBody: contractSource,
      senderKey: privateKey,
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      fee: 50000, // Higher fee for better chances
    });
    
    console.log('📝 Transaction created, broadcasting...');
    
    // Broadcast the transaction with timeout
    const response = await Promise.race([
      broadcastTransaction(deployTx, network),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 30000))
    ]);
    
    console.log('📡 Response:', response);
    
    if (typeof response === 'string') {
      // Success - got transaction ID
      console.log('✅ Contract deployed successfully!');
      console.log('🆔 Transaction ID:', response);
      console.log('📋 Contract Address: ST32GSWZ2A1QB5XX0J0KBM21QGBB72ZEYQMBXR8QW.tokenvote');
      console.log('🔍 Explorer: https://explorer.stacks.co/txid/' + response + '?chain=testnet');
    } else if (response.error) {
      console.error('❌ Deployment failed:', response.error);
      console.error('Reason:', response.reason);
    } else {
      console.log('✅ Contract deployed successfully!');
      console.log('🆔 Transaction ID:', response.txid || response);
      console.log('📋 Contract Address: ST32GSWZ2A1QB5XX0J0KBM21QGBB72ZEYQMBXR8QW.tokenvote');
      console.log('🔍 Explorer: https://explorer.stacks.co/txid/' + (response.txid || response) + '?chain=testnet');
    }
    
  } catch (error) {
    console.error('💥 Error during deployment:');
    console.error('Message:', error.message);
    if (error.message !== 'Timeout') {
      console.error('Stack:', error.stack);
    }
  }
}

deployContract();
