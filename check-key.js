require('dotenv').config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;

console.log('🔍 Private key analysis:');
console.log('Length:', PRIVATE_KEY ? PRIVATE_KEY.length : 'N/A');
console.log('First 10 chars:', PRIVATE_KEY ? PRIVATE_KEY.substring(0, 10) : 'N/A');
console.log('Last 10 chars:', PRIVATE_KEY ? PRIVATE_KEY.substring(-10) : 'N/A');
console.log('Is hex?', /^[0-9a-fA-F]+$/.test(PRIVATE_KEY));

// Try to create an address
try {
  const { getAddressFromPrivateKey, TransactionVersion } = require('@stacks/transactions');
  const address = getAddressFromPrivateKey(PRIVATE_KEY, TransactionVersion.Testnet);
  console.log('✅ Address generated:', address);
} catch (error) {
  console.error('❌ Error generating address:', error.message);
}
