# CertiChain - Certificate Verification System

A modern, blockchain-based certificate verification system built with React, Vite, and Ethers.js. Verify certificates on Ganache network with MetaMask integration.

## Overview

CertiChain is a decentralized certificate verification platform that leverages blockchain technology to ensure certificate authenticity and immutability. Users can securely add, verify, and share certificates with tamper-proof QR codes.

## Features

### 🔐 **Security & Verification**
- Blockchain-based certificate storage and verification
- Smart contract integration using Ethers.js
- Admin-only certificate management
- Immutable record keeping

### 🎨 **User Experience**
- Clean, modern, responsive interface
- Dark and light mode support
- Real-time feedback with toast notifications
- Mobile-optimized design

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
- Ganache CLI running locally on port 7545

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

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
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
1. Click "Connect Wallet" button
2. Accept MetaMask connection request
3. Ensure you're on the correct network (Ganache)

### Adding Certificates (Admin Only)
1. Connect wallet with admin privileges
2. Fill in certificate details:
   - Certificate Hash (0x...)
   - Student Name
   - Course Name
   - Issue Date
3. Click "Add Certificate"
4. Approve transaction in MetaMask
5. Wait for blockchain confirmation

### Verifying Certificates
1. Enter certificate hash in the verification form
2. Click "Verify"
3. View certificate details and QR code
4. **Download** - Save QR code as PNG
5. **Share** - Share verification link via native share or copy URL
6. **Copy** - Copy certificate hash to clipboard

### Browsing All Certificates
1. Scroll to "All Certificates" section
2. View list of all registered certificates
3. Click on any certificate to verify details

## Configuration

### Network Settings
Edit `GANACHE_NETWORK` in `src/utils/contract.js` to configure:
```javascript
const GANACHE_NETWORK = {
  chainId: '0x539',           // Chain ID (1337)
  chainIdDecimal: 1337,        // Chain ID in decimal
  chainName: 'Ganache',        // Display name
  nativeCurrency: { ... },     // Currency info
  rpcUrls: ['http://127.0.0.1:7545'],  // RPC endpoint
}
```

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

**Version:** 1.0.0  
**Last Updated:** March 2026  
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

- **v1.1**: Multiple smart contract support
- **v1.2**: Advanced filtering and search
- **v1.3**: Batch operations
- **v2.0**: Mobile app (React Native)

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
**Version**: 1.0.0
