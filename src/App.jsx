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

  /**
   * Handle network change from network selector
   * Updates network status after switching networks
   */
  const handleNetworkChange = async (networkKey) => {
    console.log(`🔄 Network changed to: ${networkKey}`)
    // Update network status to reflect the new network
    await updateNetworkStatus()
    // If wallet is connected, check admin status on new network
    if (account) {
      await checkAdminStatus(account)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-indigo-950 dark:to-purple-950 text-slate-900 dark:text-slate-50 transition-colors duration-300" style={{backgroundAttachment: 'fixed'}}>
      {/* Toast Notifications */}
      <Toaster position="top-right" />

      {/* Navbar */}
      <Navbar
        account={account}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        networkStatus={networkStatus}
        isAdmin={isAdmin}
        onNetworkChange={handleNetworkChange}
      />

      {/* Network/Admin Status Badges - Top Right */}
      {account && networkStatus && (
        <div className="fixed top-20 right-4 z-40 space-y-3 md:space-y-2">
          {/* Network Status */}
          {networkStatus.isCorrectNetwork ? (
            <div className="badge-success animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span>{networkStatus.networkName || 'Connected'}</span>
            </div>
          ) : (
            <div className="badge-error animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span>Wrong Network</span>
            </div>
          )}

          {/* Admin Status */}
          {isAdmin ? (
            <div className="badge-info animate-in fade-in slide-in-from-top-4 duration-300" style={{animationDelay: '0.1s'}}>
              <span>👑 Admin</span>
            </div>
          ) : null}
        </div>
      )}

      {/* Network Warning Banner */}
      {account && networkStatus && !networkStatus.isCorrectNetwork && (
        <div className="relative mx-4 mt-4 p-4 rounded-xl glass-card border-l-4 border-red-500 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-4">
            <div className="text-2xl">⚠️</div>
            <div className="flex-1">
              <h3 className="font-bold text-red-600 dark:text-red-400 mb-1">Wrong Network Detected</h3>
              <p className="text-sm text-red-700 dark:text-red-300">
                You're on <span className="font-mono font-semibold">{networkStatus.networkName}</span>.
                Please switch to <span className="font-mono font-semibold">{networkStatus.expectedNetwork}</span>.
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
        <footer className="relative mt-16 py-12 px-4 border-t border-white/20 dark:border-slate-700/30">
          <div className="max-w-7xl mx-auto">
            <div className="glass-card p-8 text-center">
              <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-300 dark:to-purple-300 bg-clip-text text-transparent mb-2">
                CertiChain
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-3">
                Blockchain-based certificate verification system
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-500">
                © 2026 CertiChain - Built with React, Vite, Tailwind CSS & Ethers.js
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}

export default App
