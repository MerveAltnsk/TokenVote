# TokenVote Testing Guide

## Testing with Clarinet

The TokenVote project includes comprehensive tests for the smart contracts. However, due to the complexity of the testing setup, here are several approaches to test the contracts:

### 1. Manual Testing with Clarinet Console

```bash
# Open the Clarinet console
clarinet console

# Test creating a poll
(contract-call? .tokenvote create-poll
  "What is your favorite color?"
  (list "Red" "Blue" "Green")
  u110
  u200)

# Test voting (after mining blocks to reach start time)
(contract-call? .tokenvote vote u0 u1)

# Check poll results
(contract-call? .tokenvote get-poll-results u0)
```

### 2. Contract Validation

The contracts can be validated using:

```bash
# Check contract syntax
clarinet check

# View contract analysis
clarinet analyze
```

### 3. Local Development Server

For frontend testing:

```bash
# Start the frontend development server
npm run dev:frontend

# The app will be available at http://localhost:3000
```

### 4. Deployment Testing

Test deployment to testnet:

```bash
# Set your private key
set PRIVATE_KEY=your_private_key_here

# Deploy to testnet
npm run deploy:testnet
```

## Contract Functions

### TokenVote Contract

**Public Functions:**

- `create-poll`: Create a new poll with options and timing
- `vote`: Cast a vote on a poll option
- `close-poll`: Close a poll (creator only)

**Read-Only Functions:**

- `get-poll`: Get poll details
- `get-poll-results`: Get voting results
- `get-user-vote`: Check user's vote
- `is-poll-active`: Check if poll is active
- `get-poll-count`: Get total poll count

**Error Codes:**

- u401: Not authorized (not a token holder)
- u402: Invalid time parameters
- u403: Voting hasn't started
- u404: Voting has ended
- u405: Invalid option index
- u406: Already voted
- u407: Poll not found

### Governance Token Contract

**Public Functions:**

- `transfer`: Transfer tokens between accounts
- `mint`: Mint new tokens (admin only)

**Read-Only Functions:**

- `get-balance`: Get token balance
- `get-total-supply`: Get total token supply
- `get-name`: Get token name
- `get-symbol`: Get token symbol

## Test Scenarios

1. **Poll Creation**: Test that only token holders can create polls
2. **Voting**: Test that users can vote once per poll
3. **Double Voting Prevention**: Test that users cannot vote twice
4. **Time Constraints**: Test that voting respects start/end times
5. **Results Calculation**: Test that vote counts are accurate
6. **Authorization**: Test that non-token holders cannot participate

## Frontend Integration

The frontend provides a complete interface for:

- Connecting Stacks wallets (Hiro, Xverse)
- Creating polls with multiple options
- Voting on active polls
- Viewing real-time results
- Managing poll lifecycle

## Production Considerations

Before deploying to mainnet:

1. Update governance token address in contracts
2. Conduct security audit
3. Test thoroughly on testnet
4. Set appropriate gas fees
5. Configure proper error handling
