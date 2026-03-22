# CertiChain - Certificate Verification System

A modern, blockchain-based certificate verification system built with React, Vite, and Ethers.js. Verify certificates across multiple blockchain networks (Ganache & Sepolia) with MetaMask integration.

## Overview

CertiChain is a decentralized certificate verification platform that leverages blockchain technology to ensure certificate authenticity and immutability. Users can securely add, verify, and share certificates with tamper-proof QR codes.

## Features

### 🔐 **Security & Verification**
- Blockchain-based certificate storage and verification
- Smart contract integration using Ethers.js
- Admin-only certificate management
- Immutable record keeping
- Multi-network support (Ganache & Sepolia)

### 🎨 **User Experience**
- Premium glassmorphism design with modern aesthetics
- Dark and light mode support with smooth transitions
- Real-time feedback with toast notifications
- Mobile-optimized responsive layout
- Network selector for switching between blockchains

### 📱 **Functionality**
- **Add Certificates** - Admin-only feature to register new certificates on-chain
- **Verify Certificates** - Instantly verify certificate authenticity using blockchain
- **View All Certificates** - Browse all registered certificates with details
- **QR Codes** - Download or share certificates via QR code
- **Wallet Connection** - MetaMask integration for secure transactions

### 💼 **Technology Stack**
- React 18+ with Vite
- Ethers.js v6 for blockchain interaction
- Tailwind CSS for responsive styling
- React Hot Toast for notifications
- qrcode.react for QR code generation


## Getting Started

### Prerequisites
- Node.js 16+ and npm
- MetaMask browser extension
- Optional: Ganache CLI running locally on port 7545 (for local development)
- Optional: Access to Sepolia testnet (for testnet transactions)

### Installation

1. **Install dependencies:**
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Configure contract address:**
   Edit `src/utils/contract.js` and set `CONTRACT_ADDRESS` to your deployed contract address:
   ```javascript
   const CONTRACT_ADDRESS = '0x...' // Your contract address
   ```

3. **Configure networks (Optional):**
   The app supports both Ganache (local) and Sepolia (testnet) by default. To modify network settings, edit `src/utils/contract.js`:
   ```javascript
   const NETWORKS = {
     ganache: { chainId: '0x539', chainIdDecimal: 1337, ... },
     sepolia: { chainId: '0xaa36a7', chainIdDecimal: 11155111, ... }
   }
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   Navigate to `http://localhost:3000`


## Project Structure

```
SmartChain/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx              # Navigation & wallet connection
│   │   ├── AddCertificate.jsx      # Admin certificate submission form
│   │   ├── VerifyCertificate.jsx   # Certificate verification interface
│   │   └── AllCertificates.jsx     # Browse all certificates
│   ├── utils/
│   │   └── contract.js             # Ethers.js blockchain integration
│   ├── App.jsx                     # Main application component
│   ├── index.css                   # Global styles
│   └── main.jsx                    # React DOM entry point
├── contracts/
│   └── CertiChain.sol              # Smart contract source
├── vite.config.js                  # Vite configuration
├── tailwind.config.js              # Tailwind CSS configuration
└── package.json                    # Dependencies & scripts
```

## Smart Contract

The CertiChain smart contract (`contracts/CertiChain.sol`) provides:

- `addCertificate()` - Store certificate on blockchain (admin only)
- `verifyCertificate()` - Retrieve and verify certificate details
- `getAllHashes()` - Get all registered certificate hashes
- `getCertificateCount()` - Get total certificate count
- Admin access control using contract owner address

## Build & Deployment

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Deployment Checklist
- [ ] Smart contract deployed to target network
- [ ] `CONTRACT_ADDRESS` updated in `src/utils/contract.js`
- [ ] Network configuration correct in `src/utils/contract.js`
- [ ] Environment variables configured
- [ ] Build passes without errors
- [ ] All features tested on production network
- [ ] Security audit completed

## Usage

### Connecting Wallet
1. Click "Connect Wallet" button in the navbar
2. Accept MetaMask connection request
3. The app will automatically guide you to the selected network (default: Sepolia)

### Switching Networks
1. Click the network selector button (📡) in the navbar
2. Choose between "Ganache (Local)" or "Sepolia (Testnet)"
3. Your wallet will automatically switch to the selected network
4. The app persists your network preference

### Adding Certificates (Admin Only)
1. Connect wallet with admin privileges
2. Select the desired network using the network selector (📡)
3. Fill in certificate details with meaningful data:
   - Certificate Hash (0x format)
   - Student Name
   - Course Name (e.g., "Blockchain Fundamentals")
   - Issue Date
4. The "Add Certificate" button enables once all fields are filled
5. Click "Add Certificate"
6. Approve transaction in MetaMask
7. Wait for blockchain confirmation
8. Success message displays with transaction hash

### Verifying Certificates
1. Enter certificate hash in the verification form (submit button enables when hash is entered)
2. Click "Verify" button
3. View verified certificate details with glassmorphism cards:
   - Student Name
   - Course Name
   - Issue Date
   - Blockchain badge
4. **QR Code** - Interactive QR code for the certificate
   - **Download** - Save QR code as PNG image
   - **Share** - Share verification link via native share or copy URL
   - **Copy** - Copy certificate hash to clipboard

### Browsing All Certificates
1. Scroll to "All Certificates" section
2. View list of all registered certificates
3. Click on any certificate to verify details

## Configuration

### Network Settings
The application supports multiple networks configured in `src/utils/contract.js`:
```javascript
const NETWORKS = {
  ganache: {
    chainId: '0x539',                          // Chain ID (1337)
    chainIdDecimal: 1337,                      // Chain ID in decimal
    chainName: 'Ganache',                      // Display name
    rpcUrls: ['http://127.0.0.1:7545'],       // RPC endpoint
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 }
  },
  sepolia: {
    chainId: '0xaa36a7',                       // Chain ID (11155111)
    chainIdDecimal: 11155111,                  // Chain ID in decimal
    chainName: 'Sepolia',                      // Display name
    rpcUrls: ['https://sepolia.infura.io/v3/YOUR_INFURA_KEY'],
    blockExplorerUrls: ['https://sepolia.etherscan.io']
  }
}
```

### Switching Networks
Users can switch between available networks using the network selector dropdown in the navbar (📡 icon). The selected network is persisted in localStorage.

### Contract ABI
Update `CONTRACT_ABI` in `src/utils/contract.js` if contract functions change.

## API Reference

### Contract Functions

#### `addCertificate(hash, studentName, courseName, issueDate)`
Adds a new certificate to the blockchain (admin only).

**Parameters:**
- `hash` (string): Certificate hash (0x format)
- `studentName` (string): Student's full name
- `courseName` (string): Course or certificate name
- `issueDate` (uint256): Unix timestamp of issue date

**Returns:** Transaction receipt

**Throws:** Error if not admin or certificate exists

#### `verifyCertificate(hash)`
Retrieves certificate details from blockchain.

**Parameters:**
- `hash` (string): Certificate hash to verify

**Returns:**
```javascript
{
  exists: boolean,
  studentName: string,
  courseName: string,
  issueDate: uint256
}
```

#### `getAllHashes()`
Retrieves all certificate hashes from blockchain.

**Returns:** Array of certificate hashes (string[])

#### `getCertificateCount()`
Gets total number of registered certificates.

**Returns:** Certificate count (uint256)

#### `admin()`
Gets the contract admin's wallet address.

**Returns:** Admin address (address)

## Error Handling

The application handles multiple error scenarios:

- **MetaMask not installed** - Prompts user to install MetaMask
- **Wrong network** - Shows warning banner and switch network button
- **Transaction failed** - Displays error toast with details
- **Certificate not found** - Shows "Invalid Certificate" message
- **Invalid input** - Form validation prevents invalid submissions

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Security Considerations

- All transactions require MetaMask approval
- Admin-only functions protected by smart contract
- No private keys stored in frontend
- Certificate data immutable on blockchain
- Regular security audits recommended

## Performance

- Lazy loading of certificates
- Efficient blockchain queries
- Optimized React components
- Responsive design for all devices

## Troubleshooting

### MetaMask Connection Issues
- Ensure MetaMask is installed
- Check MetaMask is unlocked
- Try disconnecting and reconnecting wallet

### Network Errors
- Verify Ganache is running on port 7545
- Check network configuration in contract.js
- Try switching network in MetaMask manually

### Transaction Failures
- Ensure sufficient gas in account
- Verify admin privileges for adding certificates
- Check transaction details in MetaMask

### QR Code Issues
- Ensure certificate is verified first
- Browser must support HTML5 Canvas
- Try downloading QR code directly

## Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Code Standards
- ESLint configuration included
- Prettier for code formatting
- React best practices followed
- Tailwind CSS for all styling

## Contributing

1. Follow existing code style
2. Test changes thoroughly
3. Update documentation
4. Keep commits focused
5. Test on multiple browsers

## License

MIT License - See LICENSE file for details

## Support

For issues and questions:
- Check the troubleshooting section
- Review smart contract documentation
- Verify Ganache network configuration

## Roadmap

Future enhancements:
- Multiple blockchain network support
- Certificate expiration dates
- Bulk certificate import
- Advanced search and filtering
- Certificate templates
- Multi-language support
- Email notifications

## Author & Developer

**Krishnik Barman**
- GitHub: [@krishnikbarman](https://github.com/krishnikbarman)
- Project Repository: [CertiChain_Smart_Contract](https://github.com/krishnikbarman/CertiChain_Smart_Contract)

---

**Version:** 2.0.0  
**Last Updated:** March 2026  
**Features:** Multi-Network Support, Premium UI Design, Smart Form Validation  
**Author:** Krishnik Barman

## Keyboard Shortcuts

- **Theme Toggle**: Click moon/sun icon in navbar
- **Connect Wallet**: Click wallet button in navbar

## Error Handling

The application includes comprehensive error handling for:
- MetaMask not installed
- No connected accounts
- Network errors
- Invalid certificate hashes
- Form validation errors

All errors display as toast notifications for better UX.

## Performance Optimizations

- Code splitting with Vite
- Fast HMR (Hot Module Replacement)
- Optimized Tailwind CSS builds
- Image optimization
- Smooth animations with CSS transitions

## Security Notes

- ⚠️ Contract address and ABI are placeholders
- Always verify smart contract addresses before interacting
- Use environment variables for sensitive data in production
- Keep MetaMask seed phrases secure
- Test thoroughly on testnet before mainnet

## Future Enhancements

- [ ] Admin role management
- [ ] Batch certificate uploads
- [ ] Search and filter history
- [ ] Export certificate as PDF
- [ ] Multi-chain support
- [ ] IPFS integration for document storage
- [ ] Certificate revocation mechanism
- [ ] Email verification notifications

## Troubleshooting

### "MetaMask is not installed"
- Install MetaMask from [metamask.io](https://metamask.io/)
- Refresh the page

### "Failed to connect wallet"
- Check MetaMask is unlocked
- Ensure you're on the correct network
- Check browser console for detailed errors

### "Certificate not found"
- Verify you're using the correct hash
- Ensure the certificate exists on the blockchain
- Check you're on the right network

### Dependency conflicts
- Use `npm install --legacy-peer-deps` to resolve
- Clear npm cache with `npm cache clean --force`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review browser console for errors
3. Check MetaMask network and account settings
4. Open an issue with detailed steps to reproduce

## Roadmap

- **v1.1**: Advanced filtering and search
- **v1.2**: Batch operations
- **v2.0**: ✅ **CURRENT** - Multi-network support (Ganache & Sepolia), Premium UI redesign, Smart form validation
- **v2.1**: Certificate expiration dates
- **v3.0**: Mobile app (React Native), Additional network support

## Disclaimer

This is a demonstration project. For production use:
- Conduct security audits
- Implement proper backend validation
- Use environment variables for sensitive data
- Follow blockchain best practices
- Test extensively on testnet first

## Authors

Built with ❤️ for blockchain certificate verification

---

**Last Updated**: March 2026  
**Version**: 2.0.0  
**Features**: Multi-Network Support ⭐, Premium Glassmorphism Design, Smart Form Validation
