// Simple test to check available imports from Clarinet SDK
console.log('Testing Clarinet SDK imports...');

try {
  const clarinet = require('@hirosystems/clarinet-sdk');
  console.log('Available exports:', Object.keys(clarinet));
} catch (error) {
  console.log('Error importing @hirosystems/clarinet-sdk:', error.message);
}

// Try alternative import
try {
  const { describe, it, beforeEach } = require('@hirosystems/clarinet-sdk');
  console.log('Alternative import successful');
} catch (error) {
  console.log('Alternative import failed:', error.message);
}
