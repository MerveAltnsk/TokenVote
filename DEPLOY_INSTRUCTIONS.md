# 🚀 TokenVote Testnet Deployment Instructions

## Prerequisites Checklist ✅

- [x] Project dependencies installed
- [x] Clarinet installed and configured
- [ ] Stacks private key obtained
- [ ] Environment file configured
- [ ] STX testnet tokens acquired

## Step 1: Get a Stacks Private Key

### Option A: Create a New Development Wallet (Recommended for Testing)

1. **Install Hiro Wallet** (if not already installed):

   - Go to https://wallet.hiro.so/
   - Install the browser extension or download the desktop app

2. **Create a New Wallet** (separate from your main wallet):

   - Click "Create new wallet"
   - Save your seed phrase securely
   - Complete the setup

3. **Get Your Private Key**:
   - Go to Settings → "Show Secret Key"
   - Copy the 64-character hex private key
   - Example format: `753b7cc01a1a2e86221266a154af739463fce51219d97e4f856cd7200c3bd2a601`

### Option B: Generate Using Stacks CLI

```bash
npm install -g @stacks/cli
stx make_keychain
```

## Step 2: Get Testnet STX Tokens

1. Visit the **Stacks Testnet Faucet**: https://explorer.stacks.co/sandbox/faucet
2. Enter your wallet address (get it from your wallet)
3. Request testnet STX tokens (you'll need some for deployment fees)

## Step 3: Configure Environment

Edit the `.env` file in your project root:

```env
PRIVATE_KEY=your_64_character_private_key_here
NETWORK=testnet
```

## Step 4: Deploy to Testnet

Run the deployment command:

```bash
npm run deploy:testnet
```

## Expected Output

When successful, you'll see:

```
Deploying TokenVote contract to testnet...
Deployer address: ST1ABC123...
Broadcasting transaction...
✅ Contract deployed successfully!
Transaction ID: 0x123abc...
Contract Address: ST1ABC123.tokenvote
Explorer URL: https://explorer.stacks.co/txid/0x123abc...?chain=testnet
```

## Step 5: Update Frontend Configuration

After deployment, update `frontend/lib/contracts.ts` with your deployed contract address.

## Need Help?

- Check the DEPLOYMENT_GUIDE.md for more details
- Visit Stacks Discord: https://discord.gg/stacks
- Check Stacks documentation: https://docs.stacks.co/

⚠️ **Security Note**: Never use your main wallet's private key for development. Always use a separate test wallet.
