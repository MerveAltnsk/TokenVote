# 🔐 Getting Your Stacks Private Key for Deployment

## Method 1: From Hiro Wallet (Recommended)

1. Open Hiro Wallet (browser extension or desktop app)
2. Go to Settings ⚙️
3. Click "View Secret Key" or "Show Secret Key"
4. Copy the private key (64 character hex string)

## Method 2: From Xverse Wallet

1. Open Xverse Wallet
2. Go to Settings → "Wallet Settings"
3. Select "Show Secret Key" or "Export Private Key"
4. Enter your password to reveal the key
5. Copy the private key

## Method 3: Generate New Key (For Development)

```bash
# Install Stacks CLI
npm install -g @stacks/cli

# Generate new key pair
stx make_keychain
```

## ⚠️ Security Notes:

- Use a SEPARATE wallet for development/testing
- NEVER use your main wallet's private key for deployment scripts
- Keep your private keys secure and never commit them to git

## Example Private Key Format:

```
edf9aee84d9b7abc145504dde6726c64f369d37ee34ded868fabd876c26570bc
```

- 64 characters long
- Hexadecimal (0-9, a-f)
- No spaces or special characters
