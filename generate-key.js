import { generateWallet } from '@stacks/wallet-sdk';
import { getAddressFromPrivateKey, TransactionVersion } from '@stacks/transactions';

// Generate a new wallet for development
console.log('🔑 Generating new Stacks wallet for development...\n');

const wallet = generateWallet({
  secretKey: crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, ''),
});

const privateKey = wallet.accounts[0].stxPrivateKey;
const address = getAddressFromPrivateKey(privateKey, TransactionVersion.Testnet);

console.log('✅ New Development Wallet Generated:');
console.log('Private Key:', privateKey);
console.log('Testnet Address:', address);
console.log('\n⚠️  IMPORTANT:');
console.log('- Save this private key securely');
console.log('- Use ONLY for development/testing');
console.log('- Get testnet STX from: https://explorer.stacks.co/sandbox/faucet');
console.log('- Add this private key to your .env file');
