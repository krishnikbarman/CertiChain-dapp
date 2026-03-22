import { useState, useEffect, useRef } from 'react'
import { Moon, Sun, Wallet, AlertCircle, CheckCircle, Loader, Shield, ChevronDown } from 'lucide-react'
import { getCurrentNetwork, requestSwitchNetwork, getAvailableNetworks, getActiveNetworkKey, switchToNetwork } from '../utils/contract'

export default function Navbar({ account, onConnect, onDisconnect, networkStatus, isAdmin, onNetworkChange }) {
  const [isDark, setIsDark] = useState(false)
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false)
  const [showNetworkDropdown, setShowNetworkDropdown] = useState(false)
  const [activeNetworkKey, setActiveNetworkKey] = useState('ganache')
  const [availableNetworks, setAvailableNetworks] = useState([])
  const dropdownRef = useRef(null)

  // Initialize dark mode from localStorage
  useEffect(() => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true'
    setIsDark(isDarkMode)
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    }
  }, [])

  // Load network data on mount
  useEffect(() => {
    const networks = getAvailableNetworks()
    const keys = Object.keys(networks.reduce((acc, net) => {
      if (net.chainId === '0x539') acc.ganache = true
      if (net.chainId === '0xaa36a7') acc.sepolia = true
      return acc
    }, {}))
    
    setActiveNetworkKey(getActiveNetworkKey())
    setAvailableNetworks(networks)
  }, [])

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNetworkDropdown(false)
      }
    }

    if (showNetworkDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [showNetworkDropdown])

  // Handle theme toggle
  const toggleDarkMode = () => {
    const newDarkMode = !isDark
    setIsDark(newDarkMode)
    localStorage.setItem('darkMode', newDarkMode)

    if (newDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // Handle network switch in wallet
  const handleSwitchNetwork = async () => {
    try {
      setIsSwitchingNetwork(true)
      await requestSwitchNetwork()
    } catch (error) {
      alert(`Failed to switch network: ${error.message}`)
    } finally {
      setIsSwitchingNetwork(false)
    }
  }

  // Handle network selection
  const handleNetworkSelect = (networkKey) => {
    switchToNetwork(networkKey)
    setActiveNetworkKey(networkKey)
    setShowNetworkDropdown(false)
    if (onNetworkChange) {
      onNetworkChange(networkKey)
    }
  }

  // Get network display name
  const getNetworkName = (net) => {
    if (net.chainId === '0x539') return 'Ganache'
    if (net.chainId === '0xaa36a7') return 'Sepolia'
    return net.chainName
  }

  // Shorten wallet address for display
  const shortAddress = account
    ? `${account.slice(0, 6)}...${account.slice(-4)}`
    : null

  return (
    <nav className="sticky top-0 z-50 glass-card m-4 rounded-2xl shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/50 hover:scale-110 transition-transform duration-300">
              <span className="text-white font-bold text-xl">⛓</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold heading-lg hidden sm:block">
                CertiChain
              </h1>
              <h1 className="text-xl font-bold heading-lg sm:hidden">
                Chain
              </h1>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-lg bg-white/50 dark:bg-slate-700/50 hover:bg-white/70 dark:hover:bg-slate-700/70 transition-all duration-300 hover:scale-110 active:scale-95"
              title="Toggle dark mode"
            >
              {isDark ? (
                <Sun size={20} className="text-yellow-400" />
              ) : (
                <Moon size={20} className="text-indigo-600" />
              )}
            </button>

            {/* Network Selector Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowNetworkDropdown(!showNetworkDropdown)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-blue-100 dark:bg-blue-900/40 hover:bg-blue-200 dark:hover:bg-blue-800/60 text-blue-700 dark:text-blue-300 font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
                title="Select network"
              >
                <span className="hidden sm:inline text-sm">📡 {activeNetworkKey === 'ganache' ? 'Ganache' : 'Sepolia'}</span>
                <span className="sm:hidden">📡</span>
                <ChevronDown size={16} className={`transition-transform ${showNetworkDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showNetworkDropdown && (
                <div className="absolute right-0 mt-2 w-48 glass-card rounded-lg shadow-xl z-50 py-2">
                  <button
                    onClick={() => handleNetworkSelect('ganache')}
                    className={`w-full text-left px-4 py-3 flex items-center gap-2 hover:bg-white/20 dark:hover:bg-white/10 transition-colors ${
                      activeNetworkKey === 'ganache' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'text-gray-900 dark:text-white'
                    }`}
                  >
                    {activeNetworkKey === 'ganache' && <CheckCircle size={16} className="text-emerald-500" />}
                    <span>🏠 Ganache (Local)</span>
                  </button>
                  <button
                    onClick={() => handleNetworkSelect('sepolia')}
                    className={`w-full text-left px-4 py-3 flex items-center gap-2 hover:bg-white/20 dark:hover:bg-white/10 transition-colors ${
                      activeNetworkKey === 'sepolia' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-white'
                    }`}
                  >
                    {activeNetworkKey === 'sepolia' && <CheckCircle size={16} className="text-blue-500" />}
                    <span>🌐 Sepolia (Testnet)</span>
                  </button>
                </div>
              )}
            </div>

            {/* Network Switch Button - Visible when on wrong network */}
            {account && networkStatus && !networkStatus.isCorrectNetwork && (
              <button
                onClick={handleSwitchNetwork}
                disabled={isSwitchingNetwork}
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-red-500/50 hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSwitchingNetwork ? (
                  <Loader size={16} className="spinner" />
                ) : (
                  <>
                    <AlertCircle size={16} />
                    <span>Switch Network</span>
                  </>
                )}
              </button>
            )}

            {/* Wallet Button */}
            <button
              onClick={onConnect}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all duration-300 hover:scale-105 active:scale-95 ${
                account
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white hover:shadow-lg hover:shadow-emerald-500/50'
                  : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/50'
              }`}
              title={account ? 'Reconnect or switch account' : 'Connect MetaMask'}
            >
              <Wallet size={18} />
              <span className="hidden sm:inline">
                {account ? `${shortAddress}` : 'Connect'}
              </span>
              <span className="sm:hidden">
                {account ? '↻' : '◎'}
              </span>
            </button>

            {/* Disconnect Button */}
            {account && (
              <button
                onClick={onDisconnect}
                className="px-3 py-2.5 rounded-lg text-sm font-semibold bg-white/50 dark:bg-slate-700/50 hover:bg-white/70 dark:hover:bg-slate-700/70 text-slate-900 dark:text-white transition-all duration-300 hover:scale-105 active:scale-95"
                title="Disconnect wallet"
              >
                <span className="hidden sm:inline">Disconnect</span>
                <span className="sm:hidden">✕</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
