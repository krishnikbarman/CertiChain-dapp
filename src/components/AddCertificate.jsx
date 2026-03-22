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
    <section className="py-12 px-4 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="mb-8">
        <h2 className="heading-md mb-2">Add Certificate</h2>
        <p className="text-muted">Admin only - Add new certificates to the blockchain</p>
      </div>

      {/* Network Warning */}
      {!isNetworkCorrect && (
        <div className="mb-6 glass-card p-4 border-l-4 border-amber-500 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-bold text-amber-700 dark:text-amber-300 mb-1">Wrong Network</p>
              <p className="text-sm text-amber-600 dark:text-amber-400">
                Switch to Ganache network to add certificates.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Admin Access Warning */}
      {!isAdmin && account && (
        <div className="mb-6 glass-card p-4 border-l-4 border-red-500 animate-in fade-in slide-in-from-top-2 duration-300" style={{animationDelay: '0.1s'}}>
          <div className="flex items-start gap-3">
            <Lock size={24} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-700 dark:text-red-300 mb-1">Admin Access Required</p>
              <p className="text-sm text-red-600 dark:text-red-400">
                Only administrators can add certificates. Contact the system administrator.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Form Card */}
        <div className="lg:col-span-2">
          <div className="glass-card p-8 rounded-2xl">
            <form onSubmit={handleAddCertificate} className="space-y-6">
              {/* Certificate Hash */}
              <div>
                <label className="block text-sm font-semibold mb-3 text-slate-900 dark:text-slate-50">
                  Certificate Hash <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="certificateHash"
                  value={formData.certificateHash}
                  onChange={handleInputChange}
                  placeholder="0x742d35Cc6634C0532925a3b844Bc9e7595f..."
                  disabled={isLoading || !isNetworkCorrect || !isAdmin}
                  className="input-premium"
                />
              </div>

              {/* Student Name */}
              <div>
                <label className="block text-sm font-semibold mb-3 text-slate-900 dark:text-slate-50">
                  Student Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleInputChange}
                  placeholder="Enter student name"
                  disabled={isLoading || !isNetworkCorrect || !isAdmin}
                  className="input-premium"
                />
              </div>

              {/* Course Name */}
              <div>
                <label className="block text-sm font-semibold mb-3 text-slate-900 dark:text-slate-50">
                  Course Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="courseName"
                  value={formData.courseName}
                  onChange={handleInputChange}
                  placeholder="Enter course name"
                  disabled={isLoading || !isNetworkCorrect || !isAdmin}
                  className="input-premium"
                />
              </div>

              {/* Issue Date */}
              <div>
                <label className="block text-sm font-semibold mb-3 text-slate-900 dark:text-slate-50">
                  Issue Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="issueDate"
                  value={formData.issueDate}
                  onChange={handleInputChange}
                  disabled={isLoading || !isNetworkCorrect || !isAdmin}
                  className="input-premium"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !isNetworkCorrect || !isAdmin || !formData.certificateHash || !formData.studentName || !formData.courseName || !formData.issueDate}
                className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? (
                  <>
                    <Loader size={20} className="spinner" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Plus size={20} />
                    <span>Add Certificate</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Info Card */}
        <div className="glass-card p-8 rounded-2xl h-fit">
          <h3 className="heading-sm mb-6">Requirements</h3>
          <ul className="space-y-4 text-sm text-muted">
            <li className="flex gap-3">
              <span className="text-indigo-500 font-bold text-lg">✓</span>
              <span>Admin access required</span>
            </li>
            <li className="flex gap-3">
              <span className="text-purple-500 font-bold text-lg">✓</span>
              <span>Ganache network active</span>
            </li>
            <li className="flex gap-3">
              <span className="text-pink-500 font-bold text-lg">✓</span>
              <span>All fields mandatory</span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-500 font-bold text-lg">✓</span>
              <span>Permanent blockchain storage</span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-500 font-bold text-lg">✓</span>
              <span>Gas fees required</span>
            </li>
          </ul>

          {/* Transaction Result */}
          <div className="mt-6 space-y-3 pt-6 border-t border-white/20 dark:border-slate-700/30">
            {txHash && (
              <div className="badge-success p-4 rounded-lg flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="font-semibold">Success!</span>
                </div>
                <button
                  onClick={copyHashToClipboard}
                  className="text-left text-xs font-mono bg-white/20 dark:bg-slate-800/50 p-2 rounded hover:bg-white/30 dark:hover:bg-slate-800/70 transition-all truncate group"
                >
                  {shortenHash(txHash)}
                  <Copy size={12} className="inline ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                {isCopied && <span className="text-xs text-center opacity-75">Copied!</span>}
              </div>
            )}

            {txError && (
              <div className="badge-error p-4 rounded-lg">
                <p className="text-xs break-words">{txError}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
