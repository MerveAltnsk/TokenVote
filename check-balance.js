const { getAddressFromPrivateKey, TransactionVersion } = require('@stacks/transactions');
const fs = require('fs');
const https = require('https');

// Load private key from .env file
const envContent = fs.readFileSync('.env', 'utf8');
const privateKey = envContent.split('PRIVATE_KEY=')[1].split('\n')[0];

try {
  // Generate testnet address
  const testnetAddress = getAddressFromPrivateKey(
    privateKey,
    TransactionVersion.Testnet
  );
  
  console.log('🔑 Private Key:', privateKey.substring(0, 10) + '...');
  console.log('📍 Testnet Address:', testnetAddress);
  
  // Check balance
  const url = `https://api.testnet.hiro.so/extended/v1/address/${testnetAddress}/balances`;
  
  https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      try {
        const balance = JSON.parse(data);
        console.log('💰 Balance:', balance.stx.balance, 'microSTX');
        console.log('💰 Balance:', (balance.stx.balance / 1000000).toFixed(6), 'STX');
      } catch (error) {
        console.error('❌ Error parsing balance:', error);
      }
    });
  }).on('error', (error) => {
    console.error('❌ Error checking balance:', error);
  });
  
} catch (error) {
  console.error('❌ Error generating address:', error);
}
