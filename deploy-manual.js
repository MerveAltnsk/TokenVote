const { StacksTestnet } = require('@stacks/network');
const fs = require('fs');

async function deployWithClarinet() {
  try {
    console.log('🚀 Deploying TokenVote contract using Clarinet...');
    
    // Read the contract source
    const contractSource = fs.readFileSync('contracts/TokenVote.clar', 'utf8');
    console.log('📜 Contract source loaded, length:', contractSource.length);
    
    // Use Clarinet for deployment
    const { exec } = require('child_process');
    
    exec('clarinet contracts deploy --help', (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Clarinet deploy command not available');
        console.log('📝 Manual deployment instructions:');
        console.log('1. Copy the contract source from contracts/TokenVote.clar');
        console.log('2. Go to https://explorer.stacks.co/sandbox/deploy');
        console.log('3. Connect your wallet with the private key');
        console.log('4. Paste the contract source and deploy');
        console.log('5. Contract name: tokenvote');
        console.log('6. Your address: ST32GSWZ2A1QB5XX0J0KBM21QGBB72ZEYQMBXR8QW');
        return;
      }
      
      console.log('Clarinet deploy help:', stdout);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

deployWithClarinet();
