const { getAddressFromPrivateKey, TransactionVersion } = require('@stacks/transactions');

const targetAddress = 'ST32GSWZ2A1QB5XX0J0KBM21QGBB72ZEYQMBXR8QW';
const baseKey = '9369011f7232ba28f8c3b49525c57e652bedf5c374772cdca2fa86b582572ce';

// Try different variations
const variations = [
  baseKey + '0',
  baseKey + '00',
  baseKey + '01',
  baseKey + '1',
  baseKey + '11',
  baseKey + 'a',
  baseKey + 'aa',
  baseKey + 'ab',
  baseKey + 'ac',
  baseKey + 'ad',
  baseKey + 'ae',
  baseKey + 'af',
  baseKey + 'b0',
  baseKey + 'b1',
  baseKey + 'b2',
  baseKey + 'b3',
  baseKey + 'b4',
  baseKey + 'b5',
  baseKey + 'b6',
  baseKey + 'b7',
  baseKey + 'b8',
  baseKey + 'b9',
  baseKey + 'ba',
  baseKey + 'bb',
  baseKey + 'bc',
  baseKey + 'bd',
  baseKey + 'be',
  baseKey + 'bf',
  baseKey + 'c0',
  baseKey + 'c1',
  baseKey + 'c2',
  baseKey + 'c3',
  baseKey + 'c4',
  baseKey + 'c5',
  baseKey + 'c6',
  baseKey + 'c7',
  baseKey + 'c8',
  baseKey + 'c9',
  baseKey + 'ca',
  baseKey + 'cb',
  baseKey + 'cc',
  baseKey + 'cd',
  baseKey + 'ce',
  baseKey + 'cf',
  baseKey + 'd0',
  baseKey + 'd1',
  baseKey + 'd2',
  baseKey + 'd3',
  baseKey + 'd4',
  baseKey + 'd5',
  baseKey + 'd6',
  baseKey + 'd7',
  baseKey + 'd8',
  baseKey + 'd9',
  baseKey + 'da',
  baseKey + 'db',
  baseKey + 'dc',
  baseKey + 'dd',
  baseKey + 'de',
  baseKey + 'df',
  baseKey + 'e0',
  baseKey + 'e1',
  baseKey + 'e2',
  baseKey + 'e3',
  baseKey + 'e4',
  baseKey + 'e5',
  baseKey + 'e6',
  baseKey + 'e7',
  baseKey + 'e8',
  baseKey + 'e9',
  baseKey + 'ea',
  baseKey + 'eb',
  baseKey + 'ec',
  baseKey + 'ed',
  baseKey + 'ee',
  baseKey + 'ef',
  baseKey + 'f0',
  baseKey + 'f1',
  baseKey + 'f2',
  baseKey + 'f3',
  baseKey + 'f4',
  baseKey + 'f5',
  baseKey + 'f6',
  baseKey + 'f7',
  baseKey + 'f8',
  baseKey + 'f9',
  baseKey + 'fa',
  baseKey + 'fb',
  baseKey + 'fc',
  baseKey + 'fd',
  baseKey + 'fe',
  baseKey + 'ff'
];

console.log('🔍 Searching for the correct private key...');
console.log('Target address:', targetAddress);

for (const key of variations) {
  try {
    const address = getAddressFromPrivateKey(key, TransactionVersion.Testnet);
    if (address === targetAddress) {
      console.log('✅ FOUND IT!');
      console.log('Private key:', key);
      console.log('Address:', address);
      
      // Update the .env file
      const fs = require('fs');
      const envContent = `PRIVATE_KEY=${key}\nNETWORK=testnet`;
      fs.writeFileSync('.env', envContent);
      console.log('✅ .env file updated');
      break;
    }
  } catch (error) {
    // Skip invalid keys
    continue;
  }
}

console.log('Search complete.');
