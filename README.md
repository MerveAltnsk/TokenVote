# TokenVote - Decentralized Voting on Stacks

TokenVote is a decentralized voting application built on the Stacks blockchain using Clarity smart contracts. It enables token holders to create polls, vote on proposals, and participate in governance with complete transparency and security.

## Features

- **🔒 Secure Voting**: All votes are recorded on-chain and immutable
- **🪙 Token-Based Governance**: Only token holders can create polls and vote
- **⚡ Real-time Results**: Live vote counting with transparent results
- **🚫 Anti-Double Voting**: Prevents duplicate votes from the same address
- **⏰ Time-Bounded Polls**: Polls have defined start and end times
- **📊 Multiple Options**: Support for up to 5 options per poll
- **🔗 Wallet Integration**: Connect with Hiro Wallet or Xverse

## Technology Stack

- **Smart Contract**: Clarity (Stacks blockchain)
- **Frontend**: Next.js 13 with TypeScript
- **Styling**: Tailwind CSS
- **Wallet Integration**: Stacks Connect
- **Development**: Clarinet for local testing

## Project Structure

```
TokenVote/
├── contracts/
│   └── TokenVote.clar          # Main voting smart contract
├── frontend/
│   ├── components/
│   │   ├── WalletConnect.tsx   # Wallet connection component
│   │   ├── CreatePoll.tsx      # Poll creation form
│   │   └── PollList.tsx        # Display and voting interface
│   ├── lib/
│   │   ├── auth.ts             # Authentication utilities
│   │   ├── contracts.ts        # Contract interaction functions
│   │   └── StacksProvider.tsx  # Stacks Connect provider
│   ├── pages/
│   │   ├── index.tsx           # Main application page
│   │   └── _app.tsx            # Next.js app wrapper
│   └── styles/
│       └── globals.css         # Global styles with Tailwind
├── scripts/
│   └── deploy.ts               # Contract deployment script
├── tests/
│   └── tokenvote_test.ts       # Smart contract tests
├── Clarinet.toml               # Clarinet configuration
├── package.json                # Root package.json
└── README.md                   # This file
```

## Smart Contract Functions

### Public Functions

- `create-poll`: Create a new poll (token holders only)
- `vote`: Cast a vote on a poll option
- `close-poll`: Close a poll (creator only)

### Read-Only Functions

- `get-poll`: Get poll information
- `get-poll-results`: Get vote results for a poll
- `get-user-vote`: Get a user's vote for a specific poll
- `is-poll-active`: Check if a poll is currently active
- `get-poll-count`: Get total number of polls

## Prerequisites

Before you begin, ensure you have:

- [Node.js](https://nodejs.org/) (v16 or higher)
- [Clarinet](https://github.com/hirosystems/clarinet) for smart contract development
- A Stacks wallet (Hiro Wallet or Xverse) for testing

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd TokenVote
   ```

2. **Install root dependencies**

   ```bash
   npm install
   ```

3. **Install frontend dependencies**

   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Set up environment variables**
   ```bash
   cd frontend
   cp .env.local.example .env.local
   # Edit .env.local with your configuration
   ```

## Development

### 1. Test Smart Contract

Run the Clarity tests:

```bash
clarinet test
```

Check contract syntax:

```bash
clarinet check
```

### 2. Deploy Smart Contract

For testnet deployment:

```bash
# Set your private key in environment
export PRIVATE_KEY=your_private_key_here
npm run deploy:testnet
```

For mainnet deployment:

```bash
export PRIVATE_KEY=your_private_key_here
npm run deploy:mainnet
```

### 3. Run Frontend

Start the development server:

```bash
npm run dev:frontend
```

The application will be available at `http://localhost:3000`

## Usage Guide

### For Users

1. **Connect Your Wallet**

   - Click "Connect Wallet" in the top right
   - Choose Hiro Wallet or Xverse
   - Approve the connection

2. **Create a Poll**

   - Click "Create New Poll"
   - Enter your question and options (2-5 options)
   - Set the duration (1-30 days)
   - Submit the transaction

3. **Vote on Polls**

   - Browse active polls
   - Click "Vote" on your preferred option
   - Confirm the transaction in your wallet

4. **View Results**
   - Results are displayed in real-time
   - See vote counts and percentages
   - Check if you've already voted

### For Developers

#### Contract Integration

```typescript
import { getPoll, votePoll, createPoll } from "./lib/contracts";

// Get poll information
const poll = await getPoll(0);

// Vote on a poll
const txid = await votePoll(pollId, optionIndex);

// Create a new poll
const txid = await createPoll(question, options, startBlock, endBlock);
```

#### Error Handling

The contract returns specific error codes:

- `u401`: Not authorized (not a token holder)
- `u402`: Invalid time parameters
- `u403`: Voting hasn't started
- `u404`: Voting has ended
- `u405`: Invalid option index
- `u406`: Already voted
- `u407`: Poll not found

## Configuration

### Contract Configuration

Update the governance token address in `contracts/TokenVote.clar`:

```clarity
(define-constant governance-token 'ST1234...YOUR-TOKEN-CONTRACT.TOKEN)
```

### Frontend Configuration

Update contract address in `frontend/lib/contracts.ts`:

```typescript
export const CONTRACT_ADDRESS = "ST1234...YOUR-DEPLOYED-CONTRACT";
export const CONTRACT_NAME = "tokenvote";
```

## Testing

### Smart Contract Tests

```bash
# Run all tests
clarinet test

# Run specific test file
clarinet test tests/tokenvote_test.ts
```

### Frontend Testing

```bash
cd frontend
npm run lint
npm run build
```

## Deployment

### Testnet Deployment

1. Get testnet STX from the [faucet](https://explorer.stacks.co/sandbox/faucet)
2. Set your private key: `export PRIVATE_KEY=your_key`
3. Deploy: `npm run deploy:testnet`
4. Update frontend configuration with deployed contract address

### Mainnet Deployment

1. Ensure you have STX for deployment fees
2. Set your private key: `export PRIVATE_KEY=your_key`
3. Deploy: `npm run deploy:mainnet`
4. Update frontend configuration

## Security Considerations

- **Token Verification**: The contract should integrate with a real governance token
- **Block Height**: Use actual block height for timing instead of hardcoded values
- **Private Keys**: Never commit private keys to version control
- **Rate Limiting**: Consider implementing rate limiting for poll creation
- **Validation**: Add comprehensive input validation

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and add tests
4. Commit your changes: `git commit -am 'Add feature'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

### Development Guidelines

- Follow TypeScript best practices
- Add tests for new functionality
- Update documentation for API changes
- Use conventional commit messages
- Ensure all tests pass before submitting PR

## Troubleshooting

### Common Issues

1. **Wallet Connection Failed**

   - Ensure you have a compatible wallet installed
   - Check that you're on the correct network (testnet/mainnet)
   - Clear browser cache and try again

2. **Transaction Failed**

   - Check you have sufficient STX for gas fees
   - Verify you're a token holder (for voting/creating polls)
   - Ensure poll is active and within voting window

3. **Contract Deployment Failed**
   - Verify your private key is correct
   - Check you have sufficient STX for deployment
   - Ensure contract name doesn't already exist

### Getting Help

- Check the [Stacks Documentation](https://docs.stacks.co)
- Join the [Stacks Discord](https://discord.gg/stacks)
- Review [Clarity Language Reference](https://docs.stacks.co/clarity)

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Stacks Foundation](https://stacks.org) for the blockchain platform
- [Hiro Systems](https://hiro.so) for development tools
- [Clarity Language](https://clarity-lang.org) for smart contract capabilities

---

**Note**: This is a demonstration project. For production use, implement additional security measures, comprehensive testing, and professional audit of smart contracts.
