import { useState } from 'react'
import { Plus, Loader, Copy, CheckCircle, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { addCertificate } from '../utils/contract'

export default function AddCertificate({ account, isAdmin = false, isNetworkCorrect = true }) {
  const [formData, setFormData] = useState({
    certificateHash: '',
    studentName: '',
    courseName: '',
    issueDate: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [txHash, setTxHash] = useState('')
  const [txError, setTxError] = useState('')
  const [isCopied, setIsCopied] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Helper function to shorten hash for display
  const shortenHash = (hash) => {
    if (!hash) return ''
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`
  }

  // Helper function to copy hash to clipboard
  const copyHashToClipboard = () => {
    if (txHash) {
      navigator.clipboard.writeText(txHash)
      setIsCopied(true)
      toast.success('Transaction hash copied!')
      setTimeout(() => setIsCopied(false), 2000)
    }
  }

  const handleAddCertificate = async (e) => {
    e.preventDefault()

    // Check admin status first
    if (!isAdmin) {
      console.warn('⚠️ Admin access required')
      alert('Only administrators can add certificates. Please contact the system administrator.')
      return
    }

    // Check network
    if (!isNetworkCorrect) {
      toast.error('Please switch to Ganache network first')
      return
    }

    // Validation
    if (!account) {
      toast.error('Please connect your wallet first')
      return
    }

    if (
      !formData.certificateHash ||
      !formData.studentName ||
      !formData.courseName ||
      !formData.issueDate
    ) {
      toast.error('Please fill in all fields')
      return
    }

    // Clear previous transaction data when starting new transaction
    setTxHash('')
    setTxError('')
    setIsLoading(true)

    try {
      console.log('📤 Submitting certificate with:', {
        hash: formData.certificateHash,
        student: formData.studentName,
        course: formData.courseName,
        date: formData.issueDate,
        account,
      })

      const result = await addCertificate(
        formData.certificateHash,
        formData.studentName,
        formData.courseName,
        formData.issueDate
      )

      if (result.success) {
        // Store the transaction hash from the result
        if (result.transactionHash) {
          setTxHash(result.transactionHash)
        }
        toast.success('Certificate added successfully!')
        // Reset form
        setFormData({
          certificateHash: '',
          studentName: '',
          courseName: '',
          issueDate: '',
        })
      } else {
        setTxError(result.message || 'Failed to add certificate')
        toast.error(result.message || 'Failed to add certificate')
      }
    } catch (error) {
      console.error('Exception during certificate submission:', error)
      setTxError(error.message || 'Error adding certificate')
      toast.error(error.message || 'Error adding certificate')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Add Certificate (Admin Only)</h2>

        {/* Network Warning */}
        {!isNetworkCorrect && (
          <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg p-4">
            <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              ⚠️ Wrong Network Detected
            </p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Please switch to Ganache network to add certificates. Contract interactions are disabled until you switch to the correct network.
            </p>
          </div>
        )}

        {/* Admin Access Warning */}
        {!isAdmin && account && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Lock size={18} className="text-red-600 dark:text-red-400" />
              <p className="text-sm font-semibold text-red-800 dark:text-red-200">
                Admin Access Required
              </p>
            </div>
            <p className="text-sm text-red-700 dark:text-red-300">
              This section is restricted to administrators only. Your current account is not authorized to add certificates. Please contact the system administrator if you believe this is an error.
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Form Card */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
            <form onSubmit={handleAddCertificate} className="space-y-4">
              {/* Certificate Hash */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Certificate Hash
                </label>
                <input
                  type="text"
                  name="certificateHash"
                  value={formData.certificateHash}
                  onChange={handleInputChange}
                  placeholder="0x..."
                  disabled={isLoading || !isNetworkCorrect || !isAdmin}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                />
              </div>

              {/* Student Name */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Student Name
                </label>
                <input
                  type="text"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  disabled={isLoading || !isNetworkCorrect || !isAdmin}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                />
              </div>

              {/* Course Name */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Course Name
                </label>
                <input
                  type="text"
                  name="courseName"
                  value={formData.courseName}
                  onChange={handleInputChange}
                  placeholder="Blockchain Basics"
                  disabled={isLoading || !isNetworkCorrect || !isAdmin}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                />
              </div>

              {/* Issue Date */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Issue Date
                </label>
                <input
                  type="date"
                  name="issueDate"
                  value={formData.issueDate}
                  onChange={handleInputChange}
                  disabled={isLoading || !isNetworkCorrect || !isAdmin}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !isNetworkCorrect || !isAdmin}
                className="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-slate-400 text-white font-medium py-2 rounded-lg transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                title={!isAdmin ? 'Only administrators can add certificates' : ''}
              >
                {isLoading ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    Add Certificate
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Info Card */}
          <div className="bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 rounded-xl shadow-lg p-6 border border-sky-200 dark:border-sky-800">
            <h3 className="text-lg font-semibold mb-4 text-sky-900 dark:text-sky-100">
              About Adding Certificates
            </h3>
            <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-300 mb-6">
              <li className="flex gap-3">
                <span className="text-sky-600 dark:text-sky-400 font-bold">✓</span>
                <span>This feature is restricted to administrators only</span>
              </li>
              <li className="flex gap-3">
                <span className="text-sky-600 dark:text-sky-400 font-bold">✓</span>
                <span>All information is stored permanently on the blockchain</span>
              </li>
              <li className="flex gap-3">
                <span className="text-sky-600 dark:text-sky-400 font-bold">✓</span>
                <span>The certificate hash ensures immutability</span>
              </li>
              <li className="flex gap-3">
                <span className="text-sky-600 dark:text-sky-400 font-bold">✓</span>
                <span>Transactions require gas fees (paid in network tokens)</span>
              </li>
            </ul>

            <div className="pt-6 border-t border-sky-200 dark:border-sky-800 space-y-4">
              {/* Transaction Hash Display */}
              {txHash && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle size={18} className="text-green-600 dark:text-green-400" />
                    <p className="text-sm font-semibold text-green-700 dark:text-green-300">
                      Transaction Confirmed
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-2 bg-white dark:bg-slate-800 p-3 rounded border border-green-200 dark:border-green-700">
                    <p className="font-mono text-xs text-slate-700 dark:text-slate-300 break-all">
                      {shortenHash(txHash)}
                    </p>
                    <button
                      onClick={copyHashToClipboard}
                      className="flex-shrink-0 p-2 hover:bg-green-100 dark:hover:bg-green-900/30 rounded transition"
                      title="Copy full transaction hash"
                    >
                      <Copy size={16} className={isCopied ? 'text-green-600 dark:text-green-400' : 'text-slate-600 dark:text-slate-400'} />
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                    Hash: <span className="font-mono break-all">{txHash}</span>
                  </p>
                </div>
              )}

              {/* Error Display */}
              {txError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-sm font-semibold text-red-700 dark:text-red-300 mb-2">
                    Transaction Error
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {txError}
                  </p>
                </div>
              )}

              {/* Connected Account */}
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                  📝 Connected Account:
                </p>
                <p className="font-mono text-xs bg-white dark:bg-slate-800 p-3 rounded border border-sky-200 dark:border-sky-700 break-all">
                  {account ? account : 'Not connected'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
