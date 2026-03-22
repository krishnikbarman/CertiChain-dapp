import { ethers } from 'ethers'

// ===== CONFIGURATION =====
// Replace these with your actual contract address and ABI from Remix or deployment
// Set to '0x0000000000000000000000000000000000000000' for DEMO MODE (no blockchain required)
const CONTRACT_ADDRESS = '0x5357207c39DA5D64cBFa5588a81d42573ba5BcaC'

// DEFAULT NETWORK (can be switched at runtime)
let ACTIVE_NETWORK_KEY = localStorage.getItem('activeNetwork') || 'sepolia'

// GANACHE LOCAL NETWORK CONFIGURATION
const NETWORKS = {
  ganache: {
    chainId: '0x539', // 1337 in decimal
    chainIdDecimal: 1337,
    chainName: 'Ganache',
    key: 'ganache',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['http://127.0.0.1:7545'],
    blockExplorerUrls: [],
  },
  
  // SEPOLIA TESTNET NETWORK CONFIGURATION
  sepolia: {
    chainId: '0xaa36a7', // 11155111 in decimal
    chainIdDecimal: 11155111,
    chainName: 'Sepolia',
    key: 'sepolia',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://sepolia.infura.io/v3/YOUR_INFURA_KEY', 'https://sepolia-rpc.publicnode.com'],
    blockExplorerUrls: ['https://sepolia.etherscan.io'],
  },
}

// Get the currently active network
function getActiveNetwork() {
  return NETWORKS[ACTIVE_NETWORK_KEY] || NETWORKS.sepolia
}

// ===== NETWORK SWITCHING =====
/**
 * Get available networks
 * @returns {Array} List of available networks
 */
export function getAvailableNetworks() {
  return Object.values(NETWORKS)
}

/**
 * Get currently selected network key
 * @returns {string} Network key ('ganache' or 'sepolia')
 */
export function getActiveNetworkKey() {
  return ACTIVE_NETWORK_KEY
}

/**
 * Switch to a different network
 * @param {string} networkKey - 'ganache' or 'sepolia'
 * @returns {void}
 */
export function switchToNetwork(networkKey) {
  if (NETWORKS[networkKey]) {
    ACTIVE_NETWORK_KEY = networkKey
    localStorage.setItem('activeNetwork', networkKey)
    console.log(`✅ Switched to ${NETWORKS[networkKey].chainName}`)
  } else {
    throw new Error(`Unknown network: ${networkKey}`)
  }
}

const CONTRACT_ABI = [
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_hash",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_studentName",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_courseName",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "_issueDate",
				"type": "uint256"
			}
		],
		"name": "addCertificate",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [],
		"name": "admin",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "allHashes",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"name": "certificateExists",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"name": "certificates",
		"outputs": [
			{
				"internalType": "string",
				"name": "studentName",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "courseName",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "issueDate",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "exists",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getAllHashes",
		"outputs": [
			{
				"internalType": "string[]",
				"name": "",
				"type": "string[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getCertificateCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_hash",
				"type": "string"
			}
		],
		"name": "verifyCertificate",
		"outputs": [
			{
				"internalType": "bool",
				"name": "exists",
				"type": "bool"
			},
			{
				"internalType": "string",
				"name": "studentName",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "courseName",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "issueDate",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]

// ===== NETWORK MANAGEMENT =====
/**
 * Get current network information
 * @returns {Promise<Object>} Current network details { chainId, chainIdDecimal, isCorrectNetwork, networkName }
 */
export async function getCurrentNetwork() {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed')
    }

    const chainId = await window.ethereum.request({
      method: 'eth_chainId',
    })
    const chainIdDecimal = parseInt(chainId, 16)
    const activeNetwork = getActiveNetwork()
    const isCorrectNetwork = chainIdDecimal === activeNetwork.chainIdDecimal

    return {
      chainId: chainId,
      chainIdDecimal: chainIdDecimal,
      isCorrectNetwork: isCorrectNetwork,
      networkName: isCorrectNetwork ? activeNetwork.chainName : `Chain ${chainIdDecimal}`,
      expectedNetwork: `${activeNetwork.chainName} (${activeNetwork.chainIdDecimal})`,
      activeNetworkKey: ACTIVE_NETWORK_KEY,
    }
  } catch (error) {
    console.error('Error getting current network:', error.message)
    throw error
  }
}

/**
 * Internal helper: Get current chain ID as decimal
 * @returns {Promise<number>} Current chain ID as decimal
 */
async function getCurrentChainId() {
  const networkInfo = await getCurrentNetwork()
  return networkInfo.chainIdDecimal
}

/**
 * Request to switch to active network (programmatically)
 * @returns {Promise<boolean>} True if successfully switched
 */
export async function requestSwitchNetwork() {
  try {
    const activeNetwork = getActiveNetwork()
    try {
      // Try to switch to the network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: activeNetwork.chainId }],
      })
      return true
    } catch (switchError) {
      // Network doesn't exist, try to add it
      if (switchError.code === 4902) {

        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: activeNetwork.chainId,
              chainName: activeNetwork.chainName,
              rpcUrls: activeNetwork.rpcUrls,
              nativeCurrency: activeNetwork.nativeCurrency,
              blockExplorerUrls: activeNetwork.blockExplorerUrls,
            },
          ],
        })
        return true
      }
      throw switchError
    }
  } catch (error) {
    console.error('Error switching network:', error.message)
    throw new Error(error.message || 'Failed to switch network')
  }
}

/**
 * Add active network to MetaMask if it doesn't exist
 * @returns {Promise<boolean>} True if network was added or already exists
 */
async function addActiveNetwork() {
  try {
    const activeNetwork = getActiveNetwork()
    // Check if network already exists by trying to switch to it first
    try {
      const result = await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: activeNetwork.chainId }],
      })
      console.log(`✅ Already connected to ${activeNetwork.chainName}`)
      return true
    } catch (switchError) {
      // Network doesn't exist, add it
      if (switchError.code === 4902) {
        console.log(`📝 Adding ${activeNetwork.chainName} network to MetaMask...`)
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: activeNetwork.chainId,
              chainName: activeNetwork.chainName,
              rpcUrls: activeNetwork.rpcUrls,
              nativeCurrency: activeNetwork.nativeCurrency,
              blockExplorerUrls: activeNetwork.blockExplorerUrls,
            },
          ],
        })
        console.log(`✅ ${activeNetwork.chainName} network added successfully`)
        return true
      }
      // Other error, re-throw
      throw switchError
    }
  } catch (error) {
    console.error('Error adding network:', error.message)
    throw error
  }
}

/**
 * Force switch to active network
 * @returns {Promise<boolean>} True if successfully switched
 */
async function switchToActiveNetwork() {
  try {
    const activeNetwork = getActiveNetwork()
    console.log(`🔄 Switching to ${activeNetwork.chainName} network...`)
    
    // First try to add/ensure the network exists
    await addActiveNetwork()
    
    // Now switch to it
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: activeNetwork.chainId }],
    })
    
    console.log(`✅ Successfully switched to ${activeNetwork.chainName}`)
    return true
  } catch (error) {
    console.error('Error switching network:', error.message)
    throw error
  }
}

// ===== WALLET CONNECTION =====
/**
 * Connect to MetaMask wallet and switch to Ganache network
 * Can be used for initial connection or reconnecting to the wallet
 * @returns {Promise<string>} Connected account address
 */
export async function connectWallet() {
  try {
    // Check if MetaMask is installed
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed. Please install MetaMask to continue.')
    }

    // Request account access
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    })

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found in MetaMask')
    }

    const account = accounts[0]
    const activeNetwork = getActiveNetwork()

    // Force switch to active network
    await switchToActiveNetwork()

    // Verify we're on the correct chain
    const currentChainId = await getCurrentChainId()
    if (currentChainId !== activeNetwork.chainIdDecimal) {
      throw new Error(
        `Failed to switch to ${activeNetwork.chainName}. Currently on chain ${currentChainId}. ` +
        `Expected chain ${activeNetwork.chainIdDecimal}.`
      )
    }

    console.log(`✅ Successfully connected and on ${activeNetwork.chainName} network`)
    localStorage.setItem('walletAddress', account)
    return account
  } catch (error) {
    console.error('Wallet connection error:', error.message)
    throw new Error(error.message || 'Failed to connect wallet')
  }
}

/**
 * Check if wallet is currently connected
 * @returns {Promise<string|null>} Connected account address or null if not connected
 */
export async function getConnectedAccount() {
  try {
    if (!window.ethereum) {
      return null
    }

    const accounts = await window.ethereum.request({
      method: 'eth_accounts',
    })

    return accounts && accounts.length > 0 ? accounts[0] : null
  } catch (error) {
    console.error('Error getting connected account:', error.message)
    return null
  }
}

/**
 * Disconnect from wallet (clear local storage, etc.)
 */
export function disconnectWallet() {
  // Clear any stored wallet data
  localStorage.removeItem('walletAddress')
}

/**
 * Get the ethers provider
 * @returns {ethers.BrowserProvider} Ethers provider instance
 */
function getProvider() {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed')
  }
  return new ethers.BrowserProvider(window.ethereum)
}

/**
 * Get the contract instance with signer for transactions
 * IMPORTANT: This function is ASYNC because getSigner() returns a Promise in ethers v6
 * Uses signer to ensure contract runner supports sending transactions
 * @returns {Promise<ethers.Contract>} Contract instance with signer for write operations
 */
async function getContractInstance() {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed')
    }

    const activeNetwork = getActiveNetwork()
    // Verify we're on the correct network
    const currentChainId = await getCurrentChainId()
    if (currentChainId !== activeNetwork.chainIdDecimal) {
      console.warn(`⚠️ Not on ${activeNetwork.chainName} network. Current chain: ${currentChainId}. Switching...`)
      await switchToActiveNetwork()
    }

    // Create provider from MetaMask
    const provider = new ethers.BrowserProvider(window.ethereum)
    console.log('✅ BrowserProvider created')

    // Get the signer (MUST AWAIT in ethers v6)
    // This signer is required for write operations
    const signer = await provider.getSigner()
    const signerAddress = await signer.getAddress()
    console.log('✅ Signer obtained:', signerAddress)

    // Create contract with signer (required for write operations)
    // The signer enables the contract to send transactions
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
    console.log('✅ Contract instance created with signer for write operations')

    return contract
  } catch (error) {
    console.error('Error creating contract instance:', error.message)
    const activeNetwork = getActiveNetwork()
    throw new Error(
      error.message || 
      `Failed to create contract instance. Ensure MetaMask is connected to ${activeNetwork.chainName}.`
    )
  }
}

// ===== ADMIN CHECK =====
/**
 * Check if the current connected wallet is the contract admin
 * @param {string} currentAccount - Current connected account address
 * @returns {Promise<boolean>} True if account is admin, false otherwise
 */
export async function checkIsAdmin(currentAccount) {
  try {
    if (!currentAccount) {
      return false
    }

    // Create provider from MetaMask (read-only, no signer needed for view functions)
    const provider = new ethers.BrowserProvider(window.ethereum)
    
    // Create contract instance with provider (view functions don't need signer)
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)

    // Call the admin() function from the contract
    const adminAddress = await contract.admin()

    // Compare addresses (normalize to lowercase for comparison)
    const isAdmin = adminAddress.toLowerCase() === currentAccount.toLowerCase()

    return isAdmin
  } catch (error) {
    console.error('Error checking admin status:', error.message)
    // Return false on error to be safe
    return false
  }
}

// ===== CERTIFICATE FUNCTIONS =====
/**
 * Add a new certificate to the blockchain
 * @param {string} certificateHash - The certificate hash (0x format)
 * @param {string} studentName - Name of the student
 * @param {string} courseName - Name of the course
 * @param {string} issueDate - Date in format YYYY-MM-DD
 * @returns {Promise<Object>} Transaction result
 */
export async function addCertificate(
  certificateHash,
  studentName,
  courseName,
  issueDate
) {
  try {
    // Validate inputs
    if (!certificateHash || !studentName || !courseName || !issueDate) {
      throw new Error('All fields are required')
    }

    // Verify wallet is connected
    const accounts = await window.ethereum.request({
      method: 'eth_accounts',
    })

    if (!accounts || accounts.length === 0) {
      throw new Error('No connected account. Please connect your wallet first.')
    }

    const activeNetwork = getActiveNetwork()
    // Verify we're on the correct network
    const currentChainId = await getCurrentChainId()
    if (currentChainId !== activeNetwork.chainIdDecimal) {
      throw new Error(
        `Wrong network. Currently on chain ${currentChainId}. ` +
        `Please switch to ${activeNetwork.chainName} (chain ${activeNetwork.chainIdDecimal}) in MetaMask.`
      )
    }

    const account = accounts[0]

    // Convert date string to Unix timestamp
    const dateObj = new Date(issueDate)
    const issueDateTimestamp = Math.floor(dateObj.getTime() / 1000)

    // Get contract instance with signer (MUST AWAIT - ethers v6)
    const contract = await getContractInstance()

    // Call the smart contract function
    // The contract uses a signer, which enables transaction sending
    let tx
    try {
      tx = await contract.addCertificate(
        certificateHash,          // _hash (string)
        studentName,              // _studentName (string)
        courseName,               // _courseName (string)
        issueDateTimestamp        // _issueDate (uint256)
      )
    } catch (txError) {
      if (txError.message.includes('contract runner does not support')) {
        throw new Error(
          'Contract runner does not support sending transactions. ' +
          'This typically means the contract is not initialized with a signer. ' +
          'Ensure MetaMask is connected to the correct Ganache network.'
        )
      }
      throw txError
    }

    // Wait for transaction to be mined (1 confirmation)
    const receipt = await tx.wait(1)

    if (!receipt) {
      throw new Error('Transaction failed - no receipt received')
    }

    return {
      success: true,
      message: 'Certificate added successfully!',
      transactionHash: receipt.hash,
    }
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Failed to add certificate',
    }
  }
}

/**
 * Verify a certificate on the blockchain
 * @param {string} certificateHash - The certificate hash to verify
 * @returns {Promise<Object>} Certificate data if valid
 */
export async function verifyCertificate(certificateHash) {
  try {
    // Validate input
    if (!certificateHash) {
      throw new Error('Certificate hash is required')
    }

    const provider = new ethers.BrowserProvider(window.ethereum)

    // Create contract with provider (for read-only calls)
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      provider
    )

    // Call the verification function (read-only)
    // Contract returns: [exists, studentName, courseName, issueDate]
    const result = await contract.verifyCertificate(
      certificateHash  // _hash (string)
    )

    // Destructure the return values
    const [exists, studentName, courseName, issueDate] = result

    // CHECK IF CERTIFICATE EXISTS BEFORE RETURNING DATA
    if (!exists) {
      return {
        exists: false,
        error: 'Certificate not found in blockchain',
      }
    }

    // Only process and return certificate data if it exists
    const dateObj = new Date(Number(issueDate) * 1000)
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    return {
      exists: true,
      studentName: studentName,
      courseName: courseName,
      issueDate: formattedDate,
    }
  } catch (error) {
    console.error('Error verifying certificate:', error.message)
    return {
      exists: false,
      error: error.message || 'Failed to verify certificate',
    }
  }
}

/**
 * Get all certificates from the blockchain
 * @returns {Promise<Array>} Array of all certificates with hash, name, course, and date
 */
export async function getAllCertificates() {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum)

    // Create contract with provider (read-only)
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      provider
    )

    // Get all certificate hashes
    const allHashes = await contract.getAllHashes()

    if (allHashes.length === 0) {
      return []
    }

    // Fetch details for each certificate
    const certificates = []

    for (let i = 0; i < allHashes.length; i++) {
      try {
        const hash = allHashes[i]

        // Get certificate details
        const result = await contract.verifyCertificate(hash)
        const [exists, studentName, courseName, issueDate] = result

        if (exists) {
          // Format the date from Unix timestamp
          const dateObj = new Date(Number(issueDate) * 1000)
          const formattedDate = dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })

          certificates.push({
            hash: hash,
            studentName: studentName,
            courseName: courseName,
            issueDate: formattedDate,
          })
        }
      } catch (error) {
        // Continue with next certificate
        continue
      }
    }

    return certificates
  } catch (error) {
    console.error('Error getting all certificates:', error.message)
    return {
      error: error.message || 'Failed to fetch certificates',
      certificates: [],
    }
  }
}

/**
 * Get certificate count from the blockchain
 * @returns {Promise<number>} Total number of certificates
 */
export async function getCertificateCount() {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum)
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      provider
    )

    const count = await contract.getCertificateCount()
    return Number(count)
  } catch (error) {
    console.error('Error getting certificate count:', error.message)
    return 0
  }
}

/**
 * Get the connected account's balance
 * @param {string} account - Account address
 * @returns {Promise<string>} Balance in ETH
 */
export async function getBalance(account) {
  try {
    const provider = getProvider()
    const balance = await provider.getBalance(account)
    return ethers.formatEther(balance)
  } catch (error) {
    console.error('Error getting balance:', error)
    throw error
  }
}

/**
 * Listen for account changes
 * @param {Function} callback - Callback function when account changes
 */
export function onAccountChanged(callback) {
  if (!window.ethereum) {
    console.error('MetaMask is not installed')
    return
  }

  window.ethereum.on('accountsChanged', (accounts) => {
    if (accounts.length > 0) {
      callback(accounts[0])
    } else {
      callback(null) // User disconnected
    }
  })
}

/**
 * Listen for network changes
 * @param {Function} callback - Callback function when network changes
 */
export function onNetworkChanged(callback) {
  if (!window.ethereum) {
    console.error('MetaMask is not installed')
    return
  }

  window.ethereum.on('chainChanged', (chainId) => {
    callback(chainId)
    // Reload the page to ensure consistency
    window.location.reload()
  })
}
