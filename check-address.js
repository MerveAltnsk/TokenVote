import { getAddressFromPrivateKey, TransactionVersion } from '@stacks/transactions';
import { readFileSync } from 'fs';

// Load private key from .env file
const envContent = readFileSync('.env', 'utf8');
const privateKey = envContent.split('PRIVATE_KEY=')[1].split('\n')[0];

try {
  // Generate testnet address
  const testnetAddress = getAddressFromPrivateKey(
    privateKey,
    TransactionVersion.Testnet
  );
  
  console.log('🔑 Private Key:', privateKey);
  console.log('📍 Testnet Address:', testnetAddress);
  console.log('✅ This is the address you should use in the faucet');
  
} catch (error) {
  console.error('❌ Error generating address:', error);
}
