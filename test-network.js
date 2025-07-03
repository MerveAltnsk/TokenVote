const { StacksTestnet } = require('@stacks/network');
const { callReadOnlyFunction, uintCV } = require('@stacks/transactions');

async function testConnection() {
  try {
    console.log('Testing connection to Stacks testnet...');
    
    const network = new StacksTestnet();
    
    // Try to call a simple read-only function
    const result = await callReadOnlyFunction({
      contractAddress: 'ST000000000000000000002AMW42H',
      contractName: 'pox',
      functionName: 'get-stacking-minimum',
      functionArgs: [],
      network,
      senderAddress: 'ST32GSWZ2A1QB5XX0J0KBM21QGBB72ZEYQMBXR8QW'
    });
    
    console.log('✅ Network connection successful!');
    console.log('Result:', result);
    
  } catch (error) {
    console.error('❌ Network connection failed:', error.message);
  }
}

testConnection();
