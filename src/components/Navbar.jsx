import { useState, useEffect } from 'react'
import { Moon, Sun, Wallet, AlertCircle, CheckCircle, Loader, Shield } from 'lucide-react'
import { getCurrentNetwork, requestSwitchNetwork } from '../utils/contract'

export default function Navbar({ account, onConnect, onDisconnect, networkStatus, isAdmin }) {
  const [isDark, setIsDark] = useState(false)
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false)

  // Initialize dark mode from localStorage
  useEffect(() => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true'
    setIsDark(isDarkMode)
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    }
  }, [])

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

  // Handle network switch
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

  // Shorten wallet address for display
  const shortAddress = account
    ? `${account.slice(0, 6)}...${account.slice(-4)}`
    : null

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Title */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">⛓</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 dark:from-sky-400 dark:to-blue-400 bg-clip-text text-transparent">
              CertiChain
            </h1>
          </div>

          {/* Network Status Badge */}
          {account && networkStatus && (
            <div className="hidden md:flex items-center gap-3">
              {networkStatus.isCorrectNetwork ? (
                <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700">
                  <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                    Ganache Connected
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700">
                  <AlertCircle size={16} className="text-red-600 dark:text-red-400" />
                  <span className="text-sm font-medium text-red-700 dark:text-red-300">
                    Wrong Network
                  </span>
                  <button
                    onClick={handleSwitchNetwork}
                    disabled={isSwitchingNetwork}
                    className="ml-2 px-2 py-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-xs rounded font-medium transition-colors disabled:cursor-not-allowed"
                  >
                    {isSwitchingNetwork ? (
                      <Loader size={14} className="animate-spin" />
                    ) : (
                      'Switch'
                    )}
                  </button>
                </div>
              )}

              {/* Admin Status Badge */}
              {isAdmin ? (
                <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-purple-100 dark:bg-purple-900/30 border border-purple-300 dark:border-purple-700">
                  <Shield size={16} className="text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                    Admin Access
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-900/30 border border-gray-300 dark:border-gray-700">
                  <AlertCircle size={16} className="text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Not Admin
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle dark mode"
            >
              {isDark ? (
                <Sun size={20} className="text-yellow-500" />
              ) : (
                <Moon size={20} className="text-slate-600" />
              )}
            </button>

            {/* Wallet Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={onConnect}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  account
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-sky-500 hover:bg-sky-600 text-white'
                }`}
                title={account ? 'Reconnect or switch account' : 'Connect MetaMask'}
              >
                <Wallet size={18} />
                <span className="hidden sm:inline">
                  {account ? `${shortAddress} (Reconnect)` : 'Connect Wallet'}
                </span>
                <span className="sm:hidden">
                  {account ? '↻' : 'Connect'}
                </span>
              </button>
              {account && (
                <button
                  onClick={onDisconnect}
                  className="px-3 py-2 rounded-lg text-sm font-medium bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
                  title="Disconnect wallet"
                >
                  <span className="hidden sm:inline">Disconnect</span>
                  <span className="sm:hidden">✕</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
