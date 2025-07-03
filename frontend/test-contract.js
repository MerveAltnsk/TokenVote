// Test script to verify contract functions
import { getAllPolls, createPoll, votePoll } from '../lib/contracts.js';

async function testContractFunctions() {
  console.log('Testing contract functions...');
  
  try {
    // Test getting all polls
    console.log('Fetching polls...');
    const polls = await getAllPolls();
    console.log('Polls found:', polls.length);
    polls.forEach(poll => {
      console.log(`- Poll ${poll.id}: ${poll.question}`);
    });
    
  } catch (error) {
    console.error('Error testing contract functions:', error);
  }
}

testContractFunctions();
