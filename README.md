<div align="center">

# 🗳️ TokenVote

### Decentralized Voting & Governance on Stacks Blockchain

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Stacks](https://img.shields.io/badge/Stacks-Blockchain-5546FF)](https://stacks.co)
[![Clarity](https://img.shields.io/badge/Smart_Contracts-Clarity-FF6B35)](https://clarity-lang.org)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js-000000)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6)](https://typescriptlang.org)

[🚀 Live Demo](#) • [📖 Documentation](#documentation) • [🔧 Installation](#installation) • [🤝 Contributing](#contributing)

---

_A community-driven voting platform that enables secure, transparent, and decentralized decision-making using token-based governance on the Stacks blockchain._

</div>

## 📋 Table of Contents

- [🎯 Overview](#-overview)
- [✨ Features](#-features)
- [🛠️ Technology Stack](#️-technology-stack)
- [🏗️ Architecture](#️-architecture)
- [🚀 Getting Started](#-getting-started)
- [📖 Usage](#-usage)
- [📜 Smart Contracts](#-smart-contracts)
- [🔧 Development](#-development)
- [🧪 Testing](#-testing)
- [🚢 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [💬 Support](#-support)
- [🙏 Acknowledgments](#-acknowledgments)

## 🎯 Overview

TokenVote is a comprehensive decentralized voting system built on the Stacks blockchain that empowers communities to make decisions through secure, transparent, and immutable voting processes. The platform leverages token-based governance to ensure that stakeholders have proportional influence in the decision-making process.

### 🌟 Why TokenVote?

- **🔒 Security First**: All votes are cryptographically secured and stored on-chain
- **🌐 Decentralized**: No central authority can manipulate or censor votes
- **👥 Community Driven**: Token holders control the governance process
- **🔍 Transparent**: All voting data is publicly verifiable on the blockchain
- **⚡ Efficient**: Fast voting with real-time results and minimal gas fees

## ✨ Features

### 🗳️ Core Voting Features

- **📊 Multi-Option Polls**: Create polls with up to 5 different options
- **⏰ Time-Bounded Voting**: Set specific start and end times for each poll
- **🚫 Anti-Double Voting**: Cryptographic prevention of duplicate votes
- **📈 Real-Time Results**: Live vote counting with instant result updates
- **🏆 Weighted Voting**: Vote weight based on token holdings

### 🔐 Governance Features

- **🪙 Token-Based Access**: Only token holders can create polls and vote
- **👑 Creator Controls**: Poll creators can close their polls early
- **📋 Poll Management**: Complete lifecycle management of voting proposals
- **🔍 Vote Verification**: Public verification of all votes and results

### 💻 User Experience

- **🔗 Wallet Integration**: Seamless connection with Hiro Wallet and Xverse
- **📱 Responsive Design**: Works perfectly on desktop and mobile devices
- **🎨 Modern UI**: Clean, intuitive interface built with Tailwind CSS
- **⚡ Fast Loading**: Optimized performance with Next.js

## 🛠️ Technology Stack

### Blockchain & Smart Contracts

- **[Stacks Blockchain](https://stacks.co)** - Layer-1 blockchain secured by Bitcoin
- **[Clarity](https://clarity-lang.org)** - Predictable smart contract language
- **[Clarinet](https://github.com/hirosystems/clarinet)** - Development environment and testing framework

### Frontend & UI

- **[Next.js 13](https://nextjs.org)** - React framework with app directory
- **[TypeScript](https://typescriptlang.org)** - Type-safe JavaScript
- **[Tailwind CSS](https://tailwindcss.com)** - Utility-first CSS framework
- **[Lucide React](https://lucide.dev)** - Beautiful icons

### Web3 Integration

- **[Stacks.js](https://stacks.js.org)** - JavaScript library for Stacks blockchain
- **[Stacks Connect](https://connect.stacks.js.org)** - Wallet connection library

### Development Tools

- **[Node.js](https://nodejs.org)** - JavaScript runtime
- **[npm](https://npmjs.com)** - Package manager
- **[ESLint](https://eslint.org)** - Code linting
- **[Prettier](https://prettier.io)** - Code formatting

## 🏗️ Architecture

### Smart Contract Layer

```
┌─────────────────────────────────────┐
│           TokenVote.clar            │
│  ┌─────────────────────────────────┐│
│  │     Poll Management             ││
│  │   • create-poll                 ││
│  │   • close-poll                  ││
│  │   • get-poll                    ││
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │     Voting System               ││
│  │   • vote                        ││
│  │   • get-user-vote               ││
│  │   • get-poll-results            ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│        GovernanceToken.clar         │
│  • Token holder verification       │
│  • Balance checking                │
│  • Transfer functionality          │
└─────────────────────────────────────┘
```

### Frontend Architecture

```
┌─────────────────────────────────────┐
│            Next.js App              │
│  ┌─────────────────────────────────┐│
│  │         Components              ││
│  │   • WalletConnect               ││
│  │   • CreatePoll                  ││
│  │   • PollList                    ││
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │           Libraries             ││
│  │   • auth.ts                     ││
│  │   • contracts.ts                ││
│  │   • StacksProvider.tsx          ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **[Node.js](https://nodejs.org/)** (v16.0.0 or higher)
- **[npm](https://www.npmjs.com/)** (v7.0.0 or higher)
- **[Clarinet](https://github.com/hirosystems/clarinet)** (v1.0.0 or higher)
- **[Git](https://git-scm.com/)**
- A **Stacks wallet** ([Hiro Wallet](https://wallet.hiro.so/) or [Xverse](https://xverse.app/))

### 🔧 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/MerveAltnsk/TokenVote.git
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
   # Root project
   cp .env.example .env

   # Frontend
   cd frontend
   cp .env.local.example .env.local
   cd ..
   ```

5. **Edit environment files with your configuration**

   ```bash
   # .env (for deployment)
   PRIVATE_KEY=your_private_key_here
   NETWORK=testnet

   # frontend/.env.local
   NEXT_PUBLIC_NETWORK=testnet
   NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address
   ```

### ⚡ Quick Start

1. **Check smart contracts**

   ```bash
   npm run check
   ```

2. **Start the frontend development server**

   ```bash
   npm run dev:frontend
   ```

3. **Open your browser and navigate to**
   ```
   http://localhost:3000
   ```

## 📖 Usage

### 🔗 Connecting Your Wallet

1. Click the **"Connect Wallet"** button in the top right corner
2. Choose your preferred wallet (Hiro Wallet or Xverse)
3. Approve the connection request
4. Your wallet address will be displayed once connected

### 🗳️ Creating a Poll

1. **Ensure you have governance tokens** (required to create polls)
2. Click **"Create New Poll"**
3. Fill in the poll details:
   - **Question**: What you want to ask the community
   - **Options**: 2-5 different choices (maximum 64 characters each)
   - **Duration**: How long the poll should run (1-30 days)
4. Click **"Create Poll"** and confirm the transaction in your wallet

### 🎯 Voting on Polls

1. **Browse active polls** in the main interface
2. **Read the question and options** carefully
3. Click **"Vote"** on your preferred option
4. **Confirm the transaction** in your wallet
5. Your vote will be recorded on-chain and displayed immediately

### 📊 Viewing Results

- **Real-time results** are displayed for all polls
- **Vote counts and percentages** are updated automatically
- **Your vote** is highlighted with a green checkmark
- **Poll status** shows if voting is active, upcoming, or ended

## 📜 Smart Contracts

### TokenVote.clar

The main voting contract that handles all poll creation, voting, and result tracking.

#### 📋 Public Functions

| Function      | Parameters                                        | Description                                  |
| ------------- | ------------------------------------------------- | -------------------------------------------- |
| `create-poll` | `question`, `options`, `start-block`, `end-block` | Creates a new poll with specified parameters |
| `vote`        | `poll-id`, `option-index`                         | Casts a vote for a specific option           |
| `close-poll`  | `poll-id`                                         | Closes a poll early (creator only)           |

#### 📖 Read-Only Functions

| Function           | Parameters         | Returns       | Description                          |
| ------------------ | ------------------ | ------------- | ------------------------------------ |
| `get-poll`         | `poll-id`          | Poll data     | Retrieves complete poll information  |
| `get-poll-results` | `poll-id`          | Results tuple | Gets vote counts and percentages     |
| `get-user-vote`    | `poll-id`, `voter` | Option index  | Checks user's vote for a poll        |
| `is-poll-active`   | `poll-id`          | Boolean       | Verifies if poll is currently active |
| `get-poll-count`   | -                  | Number        | Returns total number of polls        |

#### ⚠️ Error Codes

| Code   | Constant                 | Description                  |
| ------ | ------------------------ | ---------------------------- |
| `u401` | `ERR-NOT-AUTHORIZED`     | Not a token holder           |
| `u402` | `ERR-INVALID-TIME`       | Invalid time parameters      |
| `u403` | `ERR-VOTING-NOT-STARTED` | Voting period hasn't started |
| `u404` | `ERR-VOTING-ENDED`       | Voting period has ended      |
| `u405` | `ERR-INVALID-OPTION`     | Invalid option index         |
| `u406` | `ERR-ALREADY-VOTED`      | User has already voted       |
| `u407` | `ERR-POLL-NOT-FOUND`     | Poll doesn't exist           |

### GovernanceToken.clar

A test governance token contract for development and testing purposes.

#### 📋 Public Functions

| Function   | Parameters                              | Description                       |
| ---------- | --------------------------------------- | --------------------------------- |
| `transfer` | `amount`, `sender`, `recipient`, `memo` | Transfers tokens between accounts |
| `mint`     | `amount`, `recipient`                   | Mints new tokens (admin only)     |

#### 📖 Read-Only Functions

| Function           | Returns       | Description                |
| ------------------ | ------------- | -------------------------- |
| `get-balance`      | Token balance | Gets user's token balance  |
| `get-total-supply` | Total supply  | Gets total token supply    |
| `get-name`         | Token name    | Returns "Governance Token" |
| `get-symbol`       | Token symbol  | Returns "GOV"              |

## 🔧 Development

### 🏃‍♂️ Running Locally

1. **Start the development server**

   ```bash
   npm run dev:frontend
   ```

2. **Open Clarinet console for contract testing**

   ```bash
   npm run console
   ```

3. **Check contract syntax**
   ```bash
   npm run check
   ```

### 🛠️ Development Commands

```bash
# Contract development
npm run check              # Validate contract syntax
npm run console           # Open Clarinet REPL
npm run test              # Run contract tests

# Frontend development
npm run dev:frontend      # Start development server
npm run build:frontend    # Build for production
npm run install:frontend  # Install frontend dependencies

# Deployment
npm run deploy:testnet    # Deploy to testnet
npm run deploy:mainnet    # Deploy to mainnet
```

### 📁 Project Structure

```
TokenVote/
├── 📄 contracts/                 # Smart contracts
│   ├── TokenVote.clar           # Main voting contract
│   └── GovernanceToken.clar     # Test governance token
├── 🖥️ frontend/                  # Next.js application
│   ├── components/              # React components
│   │   ├── WalletConnect.tsx    # Wallet connection
│   │   ├── CreatePoll.tsx       # Poll creation form
│   │   └── PollList.tsx         # Poll display and voting
│   ├── lib/                     # Utility libraries
│   │   ├── auth.ts              # Authentication helpers
│   │   ├── contracts.ts         # Contract interactions
│   │   └── StacksProvider.tsx   # Stacks Connect provider
│   ├── pages/                   # Next.js pages
│   │   ├── _app.tsx             # App wrapper
│   │   └── index.tsx            # Main page
│   └── styles/                  # CSS styles
│       └── globals.css          # Global styles
├── 🚀 scripts/                   # Deployment scripts
│   └── deploy.ts                # Contract deployment
├── 🧪 tests/                     # Test files
│   └── tokenvote_test.ts        # Contract tests
├── ⚙️ Configuration files
│   ├── Clarinet.toml            # Clarinet configuration
│   ├── package.json             # Dependencies and scripts
│   └── tsconfig.json            # TypeScript configuration
└── 📚 Documentation
    ├── README.md                # This file
    └── TESTING.md               # Testing guide
```

## 🧪 Testing

### Smart Contract Testing

Run the comprehensive test suite:

```bash
npm run test
```

### Manual Testing with Clarinet Console

```bash
# Open Clarinet console
npm run console

# Create a test poll
(contract-call? .tokenvote create-poll
  "What is your favorite color?"
  (list "Red" "Blue" "Green")
  u110
  u200)

# Vote on the poll (after mining blocks)
(contract-call? .tokenvote vote u0 u1)

# Check results
(contract-call? .tokenvote get-poll-results u0)
```

### Frontend Testing

```bash
cd frontend
npm run dev    # Start development server
npm run build  # Test production build
npm run lint   # Run linting
```

### Test Coverage

The test suite covers:

- ✅ Poll creation by token holders
- ✅ Voting functionality and restrictions
- ✅ Double voting prevention
- ✅ Time-based voting windows
- ✅ Result calculation accuracy
- ✅ Authorization checks
- ✅ Error handling

## 🚢 Deployment

### Testnet Deployment

1. **Get testnet STX** from the [Stacks Explorer Faucet](https://explorer.stacks.co/sandbox/faucet)

2. **Set your private key**

   ```bash
   # Windows
   set PRIVATE_KEY=your_private_key_here

   # macOS/Linux
   export PRIVATE_KEY=your_private_key_here
   ```

3. **Deploy to testnet**

   ```bash
   npm run deploy:testnet
   ```

4. **Update frontend configuration**
   ```bash
   # Edit frontend/.env.local
   NEXT_PUBLIC_CONTRACT_ADDRESS=ST1234...YOUR_DEPLOYED_CONTRACT
   ```

### Mainnet Deployment

⚠️ **Warning**: Mainnet deployment requires real STX tokens for transaction fees.

1. **Ensure you have sufficient STX** for deployment fees
2. **Set your private key with real STX**
3. **Deploy to mainnet**
   ```bash
   npm run deploy:mainnet
   ```

### Post-Deployment

1. **Verify contract on Stacks Explorer**
2. **Test all functions on deployed contract**
3. **Update frontend with production contract address**
4. **Deploy frontend to your hosting platform**

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### 🐛 Reporting Bugs

1. Check existing issues to avoid duplicates
2. Create a detailed bug report with:
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details

### 💡 Suggesting Features

1. Open an issue with the "enhancement" label
2. Describe the feature and its benefits
3. Provide mockups or examples if possible

### 🔧 Contributing Code

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Add tests** for new functionality
5. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
6. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### 📋 Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests for new features
- Update documentation for API changes
- Use conventional commit messages
- Ensure all tests pass before submitting

### 🎨 Code Style

- Use Prettier for formatting
- Follow ESLint rules
- Write meaningful variable and function names
- Add comments for complex logic

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 TokenVote Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 💬 Support

Need help with TokenVote? Here are your options:

### 📚 Documentation

- [Stacks Documentation](https://docs.stacks.co)
- [Clarity Language Reference](https://docs.stacks.co/clarity)
- [Stacks.js Documentation](https://stacks.js.org)

### 💭 Community Support

- [Stacks Discord](https://discord.gg/stacks) - Join the community
- [Stacks Forum](https://forum.stacks.org) - Ask questions and share ideas
- [GitHub Issues](https://github.com/MerveAltnsk/TokenVote/issues) - Report bugs and request features

### 🐛 Bug Reports

If you find a bug, please create an issue with:

- Detailed description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots or error messages
- Environment information

### 💡 Feature Requests

Have an idea for TokenVote? We'd love to hear it!

- Open a GitHub issue with the "enhancement" label
- Describe the feature and its benefits
- Provide examples or mockups if possible

## 🙏 Acknowledgments

TokenVote wouldn't be possible without the amazing work of:

### 🚀 Stacks Ecosystem

- **[Stacks Foundation](https://stacks.org)** - For building the Stacks blockchain
- **[Hiro Systems](https://hiro.so)** - For development tools and infrastructure
- **[Clarity Language](https://clarity-lang.org)** - For the predictable smart contract language

### 🛠️ Development Tools

- **[Clarinet](https://github.com/hirosystems/clarinet)** - Smart contract development environment
- **[Stacks.js](https://stacks.js.org)** - JavaScript libraries for Stacks
- **[Next.js](https://nextjs.org)** - React framework
- **[Tailwind CSS](https://tailwindcss.com)** - Utility-first CSS framework

### 🌟 Open Source Community

- All the contributors who have helped improve this project
- The Stacks community for feedback and support
- Open source projects that made this possible

---

<div align="center">

**Built with ❤️ on Stacks**

[🚀 Deploy Now](#deployment) • [⭐ Star on GitHub](https://github.com/MerveAltnsk/TokenVote) • [🐦 Follow Updates](https://twitter.com/StacksOrg)

---

_TokenVote - Empowering communities through decentralized decision-making_

</div>

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
