require('dotenv').config();
const { getAddressFromPrivateKey, TransactionVersion } = require('@stacks/transactions');

// Get the private key and clean it
let privateKey = process.env.PRIVATE_KEY;
console.log('Original length:', privateKey.length);

// Remove any whitespace and ensure it's exactly 64 characters
privateKey = privateKey.trim();
console.log('After trim:', privateKey.length);

// If it's still too long, truncate to 64 characters
if (privateKey.length > 64) {
  privateKey = privateKey.substring(0, 64);
  console.log('After truncation:', privateKey.length);
}

console.log('Final private key:', privateKey);

// Test the address generation
try {
  const address = getAddressFromPrivateKey(privateKey, TransactionVersion.Testnet);
  console.log('✅ Address generated:', address);
  
  // Update the .env file with the correct key
  const fs = require('fs');
  const envContent = `PRIVATE_KEY=${privateKey}\nNETWORK=testnet`;
  fs.writeFileSync('.env', envContent);
  console.log('✅ .env file updated with correct key');
  
} catch (error) {
  console.error('❌ Error:', error.message);
}
