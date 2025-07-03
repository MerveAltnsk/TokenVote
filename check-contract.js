const https = require('https');
require('dotenv').config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;

// Get the address from the private key
const { getAddressFromPrivateKey, TransactionVersion } = require('@stacks/transactions');

const senderAddress = getAddressFromPrivateKey(PRIVATE_KEY, TransactionVersion.Testnet);
console.log('📍 Deployer address:', senderAddress);

// Check if the contract is already deployed
const contractAddress = `${senderAddress}.tokenvote`;
console.log('🔍 Checking if contract exists:', contractAddress);

const url = `https://api.testnet.hiro.so/v2/contracts/source/${contractAddress}`;

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ Contract already exists!');
      console.log('📋 Contract Address:', contractAddress);
      console.log('🔍 Explorer:', `https://explorer.stacks.co/address/${contractAddress}?chain=testnet`);
    } else if (res.statusCode === 404) {
      console.log('❌ Contract not found. It needs to be deployed.');
    } else {
      console.log('❓ Unexpected response:', res.statusCode);
      console.log('Response:', data);
    }
  });
}).on('error', (error) => {
  console.error('❌ Error checking contract:', error);
});
