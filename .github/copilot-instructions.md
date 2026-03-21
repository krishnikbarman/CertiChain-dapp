<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## CertiChain - Certificate Verification System

### Project Overview
A modern React + Vite frontend for blockchain-based certificate verification using MetaMask and Ethers.js.

### Code Structure Guidelines
- **Components**: Located in `src/components/`, each in its own file
- **Utils**: Blockchain logic in `src/utils/contract.js`
- **Styling**: Tailwind CSS exclusively (no inline styles)
- **State**: React hooks (useState, useEffect) for state management

### Key Implementation Details
1. **Dark Mode**: Class-based (`dark:`) using Tailwind, persists to localStorage
2. **Wallet Connection**: Uses window.ethereum with MetaMask
3. **Blockchain**: Ethers.js v6 for contract interaction
4. **Forms**: Controlled components with form validation
5. **Notifications**: react-hot-toast for user feedback

### Development Commands
- `npm run dev` - Start Vite dev server on port 3000
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm install --legacy-peer-deps` - Install dependencies (required due to qrcode.react peer dependency)

### Important Notes
- Smart contract address and ABI are placeholders in `src/utils/contract.js`
- Application runs in DEMO MODE by default (no blockchain required)
- MetaMask extension required for wallet functionality
- All components use Tailwind CSS responsive classes (sm:, md:, lg:)

### File Conventions
- Component files: PascalCase (e.g., `Navbar.jsx`)
- Utility files: camelCase (e.g., `contract.js`)
- CSS: Tailwind utility classes with dark: variants
- Comments: JSDoc style for functions and complex logic

### Common Modifications
1. Contract integration: Update `CONTRACT_ADDRESS` and `CONTRACT_ABI` in `src/utils/contract.js`
2. Styling changes: Use Tailwind classes, avoid hardcoded colors
3. New components: Add to `src/components/` and import in `App.jsx`
4. Environment variables: Use localStorage for client-side storage

### Testing Checklist
- Dark/light mode toggle works
- Wallet connect/disconnect functions
- Form validation prevents incomplete submissions
- Toast notifications display for success/error
- Responsive layout on mobile/tablet/desktop
- QR code generates correctly
- Hash generation produces valid format
