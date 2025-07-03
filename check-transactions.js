const https = require('https');
const { getAddressFromPrivateKey, TransactionVersion } = require('@stacks/transactions');
require('dotenv').config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const senderAddress = getAddressFromPrivateKey(PRIVATE_KEY, TransactionVersion.Testnet);

console.log('📍 Checking recent transactions for:', senderAddress);

const url = `https://api.testnet.hiro.so/extended/v1/address/${senderAddress}/transactions?limit=10`;

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    try {
      const transactions = JSON.parse(data);
      console.log('📊 Found', transactions.total, 'transactions');
      
      if (transactions.results && transactions.results.length > 0) {
        console.log('\n📋 Recent transactions:');
        transactions.results.forEach((tx, index) => {
          console.log(`${index + 1}. ${tx.tx_type} - ${tx.tx_status} - ${tx.tx_id}`);
          if (tx.tx_type === 'smart_contract' && tx.smart_contract) {
            console.log(`   Contract: ${tx.smart_contract.contract_id}`);
          }
        });
      } else {
        console.log('No transactions found');
      }
    } catch (error) {
      console.error('❌ Error parsing transactions:', error);
      console.log('Raw response:', data);
    }
  });
}).on('error', (error) => {
  console.error('❌ Error fetching transactions:', error);
});
