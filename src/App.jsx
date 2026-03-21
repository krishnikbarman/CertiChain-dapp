import { useState, useEffect, useRef } from 'react'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import AddCertificate from './components/AddCertificate'
import VerifyCertificate from './components/VerifyCertificate'
import AllCertificates from './components/AllCertificates'
import {
  connectWallet,
  disconnectWallet,
  onAccountChanged,
  onNetworkChanged,
  getCurrentNetwork,
  checkIsAdmin,
} from './utils/contract'

function App() {
  const [account, setAccount] = useState(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [networkStatus, setNetworkStatus] = useState(null)
  const [selectedHash, setSelectedHash] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const verifyRef = useRef(null)

  // Initialize wallet connection on component mount
  useEffect(() => {
    initializeWallet()
    setupListeners()
  }, [])

  /**
   * Handle certificate selection from AllCertificates
   * Scrolls to verify section and sets the hash
   */
  const handleCertificateSelect = (hash) => {
    setSelectedHash(hash)
    // Scroll to verify section
    if (verifyRef.current) {
      setTimeout(() => {
        verifyRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }

  /**
   * Fetch and update network status
   */
  const updateNetworkStatus = async () => {
    try {
      const network = await getCurrentNetwork()
      setNetworkStatus(network)
    } catch (error) {
      console.error('Error fetching network status:', error)
      setNetworkStatus(null)
    }
  }

  /**
   * Check if current account is the contract admin
   */
  const checkAdminStatus = async (currentAccount) => {
    try {
      if (!currentAccount) {
        setIsAdmin(false)
        return
      }
      const admin = await checkIsAdmin(currentAccount)
      setIsAdmin(admin)
    } catch (error) {
      console.error('Error checking admin status:', error)
      setIsAdmin(false)
    }
  }

  /**
   * Initialize wallet connection from localStorage
   */
  const initializeWallet = async () => {
    try {
      // Check if user was previously connected
      const savedAddress = localStorage.getItem('walletAddress')
      if (savedAddress && window.ethereum) {
        const accounts = await window.ethereum.request({
          method: 'eth_accounts',
        })
        if (accounts && accounts.length > 0) {
          setAccount(accounts[0])
          // Also fetch network status when wallet is detected
          await updateNetworkStatus()
          // Check admin status
          await checkAdminStatus(accounts[0])
        }
      }
    } catch (error) {
      console.error('Error initializing wallet:', error)
    }
  }

  /**
   * Setup MetaMask event listeners
   */
  const setupListeners = () => {
    if (!window.ethereum) return

    // Listen for account changes
    onAccountChanged((newAccount) => {
      if (newAccount) {
        setAccount(newAccount)
        localStorage.setItem('walletAddress', newAccount)
        // Check admin status when account changes
        checkAdminStatus(newAccount)
      } else {
        setAccount(null)
        setNetworkStatus(null)
        setIsAdmin(false)
        localStorage.removeItem('walletAddress')
      }
    })

    // Listen for network changes
    window.ethereum.on('chainChanged', async (chainId) => {
      // Update network status instead of reloading
      await updateNetworkStatus()
    })
  }

  /**
   * Handle wallet connection and reconnection
   * Works for both initial connection and reconnecting already-connected wallets
   */
  const handleConnect = async () => {
    try {
      setIsConnecting(true)
      
      const connectedAccount = await connectWallet()
      setAccount(connectedAccount)
      localStorage.setItem('walletAddress', connectedAccount)
      
      // Fetch network status after successful connection
      await updateNetworkStatus()
      
      // Check admin status after successful connection
      await checkAdminStatus(connectedAccount)
    } catch (error) {
      console.error('❌ Connection failed:', error.message)
      // More user-friendly error handling
      const errorMsg = error.message || 'Failed to connect wallet'
      alert(errorMsg)
    } finally {
      setIsConnecting(false)
    }
  }

  /**
   * Handle wallet disconnection
   * Clears all wallet state and storage
   */
  const handleDisconnect = () => {
    disconnectWallet()
    setAccount(null)
    setNetworkStatus(null)
    setIsAdmin(false)
    localStorage.removeItem('walletAddress')
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50">
      {/* Toast Notifications */}
      <Toaster position="top-right" />

      {/* Navbar */}
      <Navbar
        account={account}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        networkStatus={networkStatus}
        isAdmin={isAdmin}
      />

      {/* Network Warning Banner */}
      {account && networkStatus && !networkStatus.isCorrectNetwork && (
        <div className="bg-red-100 dark:bg-red-900/30 border-b-2 border-red-300 dark:border-red-700 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            <span className="text-red-600 dark:text-red-400">⚠️</span>
            <div className="flex-1">
              <p className="font-semibold text-red-900 dark:text-red-200">
                Wrong Network
              </p>
              <p className="text-sm text-red-800 dark:text-red-300">
                You are currently on <span className="font-mono">{networkStatus.networkName}</span>. 
                Please switch to <span className="font-mono">{networkStatus.expectedNetwork}</span> to use certificate features.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="min-h-[calc(100vh-64px)]">
        {/* Verify Certificate Section */}
        <div ref={verifyRef}>
          <VerifyCertificate selectedHash={selectedHash} onHashUsed={() => setSelectedHash(null)} />
        </div>

        {/* All Certificates Section */}
        <AllCertificates onSelectCertificate={handleCertificateSelect} />

        {/* Add Certificate Section */}
        {/* Disable if wrong network or not admin */}
        <AddCertificate 
          account={account}
          isAdmin={isAdmin}
          isNetworkCorrect={networkStatus?.isCorrectNetwork ?? false}
        />

        {/* Footer */}
        <footer className="bg-slate-100 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 py-8 px-4 mt-12">
          <div className="max-w-7xl mx-auto text-center text-slate-600 dark:text-slate-400 text-sm">
            <p>
              © 2024 CertiChain - Certificate Verification System on Blockchain
            </p>
            <p className="mt-2">
              Built with React, Vite, Tailwind CSS & Ethers.js
            </p>
          </div>
        </footer>
      </main>
    </div>
  )
}

export default App
