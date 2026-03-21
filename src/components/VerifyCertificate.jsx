import { useState, useEffect, useRef } from 'react'
import { Search, Loader, CheckCircle, XCircle, Download, Share2, Copy, ExternalLink } from 'lucide-react'
import QRCode from 'qrcode.react'
import toast from 'react-hot-toast'
import { verifyCertificate } from '../utils/contract'

export default function VerifyCertificate({ selectedHash = null, onHashUsed = null }) {
  const [certificateHash, setCertificateHash] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [isCopied, setIsCopied] = useState(false)
  const qrCodeRef = useRef()

  // Auto-populate hash when selectedHash prop changes
  useEffect(() => {
    if (selectedHash) {
      setCertificateHash(selectedHash)
      // Automatically verify the selected certificate
      handleVerify(null, selectedHash)
      // Notify parent that we've used the hash
      onHashUsed?.()
    }
  }, [selectedHash, onHashUsed])

  // Read hash from URL query parameter on component mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const hashParam = params.get('hash')
    if (hashParam && !certificateHash) {
      setCertificateHash(hashParam)
      handleVerify(null, hashParam)
    }
  }, [])

  const handleVerify = async (e, hash = null) => {
    // Allow both form submission and programmatic calls
    if (e) {
      e.preventDefault()
    }

    const hashToVerify = hash || certificateHash

    if (!hashToVerify.trim()) {
      toast.error('Please enter a certificate hash')
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      const verificationResult = await verifyCertificate(hashToVerify)
      setResult(verificationResult)

      if (verificationResult.exists) {
        toast.success('Certificate verified successfully!')
      } else {
        toast.error('Certificate not found')
      }
    } catch (error) {
      console.error('Error verifying certificate:', error)
      toast.error(error.message || 'Error verifying certificate')
      setResult({
        exists: false,
        error: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateHash = async () => {
    // Simple SHA256 hash simulation (in production, use crypto library)
    const text = `${Date.now()}-${Math.random()}`
    const hash = await hashString(text)
    setCertificateHash(hash)
    toast.success('Sample hash generated!')
  }

  // Simple hash function (not cryptographically secure, for demo purposes)
  const hashString = async (str) => {
    const encoder = new TextEncoder()
    const data = encoder.encode(str)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
    return '0x' + hashHex
  }

  // Download QR code as PNG
  const handleDownloadQR = () => {
    try {
      if (!qrCodeRef.current) {
        toast.error('QR code not found')
        return
      }

      // Get the canvas element from the QR code component
      const canvas = qrCodeRef.current.querySelector('canvas')
      if (!canvas) {
        toast.error('Could not find QR code canvas')
        return
      }

      // Convert canvas to image data URL
      const image = canvas.toDataURL('image/png')

      // Create a download link and trigger download
      const link = document.createElement('a')
      link.href = image
      link.download = `certificate-${certificateHash.slice(0, 8)}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success('QR code downloaded successfully!')
    } catch (error) {
      console.error('Error downloading QR code:', error)
      toast.error('Failed to download QR code')
    }
  }

  // Share certificate with verification URL
  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}${window.location.pathname}?hash=${certificateHash}`
      
      // Check if Web Share API is available
      if (navigator.share) {
        await navigator.share({
          title: 'Certificate Verification',
          text: 'Verify this certificate on CertiChain',
          url: shareUrl,
        })
        toast.success('Certificate shared!')
      } else {
        // Fallback: Copy share URL to clipboard
        await navigator.clipboard.writeText(shareUrl)
        toast.success('Share URL copied to clipboard!')
      }
    } catch (error) {
      // User cancelled share dialog (not an error)
      if (error.name !== 'AbortError') {
        console.error('Error sharing certificate:', error)
        toast.error('Failed to share certificate')
      }
    }
  }

  // Copy certificate hash to clipboard
  const handleCopyHash = async () => {
    try {
      await navigator.clipboard.writeText(certificateHash)
      setIsCopied(true)
      toast.success('Hash copied to clipboard!')
      
      // Reset copied state after 2 seconds
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      console.error('Error copying hash:', error)
      toast.error('Failed to copy hash')
    }
  }

  return (
    <section className="py-8 px-4 bg-gradient-to-b from-transparent to-slate-50 dark:to-slate-900/50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Verify Certificate</h2>

        {/* Verify Form Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700 mb-8">
          <form onSubmit={handleVerify} className="flex gap-2 flex-col sm:flex-row">
            <div className="flex-1">
              <input
                type="text"
                value={certificateHash}
                onChange={(e) => setCertificateHash(e.target.value)}
                placeholder="Enter certificate hash (0x...)"
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="bg-sky-500 hover:bg-sky-600 disabled:bg-slate-400 text-white font-medium px-6 py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed sm:whitespace-nowrap"
            >
              {isLoading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Search size={18} />
                  Verify
                </>
              )}
            </button>
          </form>

          {/* Helper Button */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleGenerateHash}
              className="text-sm px-3 py-2 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition"
            >
              Generate Sample Hash
            </button>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="space-y-4">
            {result.exists ? (
              // Valid Certificate Card
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl shadow-lg p-6 border-2 border-green-200 dark:border-green-800">
                <div className="flex gap-4 mb-6">
                  <CheckCircle
                    size={32}
                    className="text-green-600 dark:text-green-400 flex-shrink-0"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-green-900 dark:text-green-100">
                      ✓ Certificate Valid
                    </h3>
                    <p className="text-green-700 dark:text-green-200 text-sm mt-1">
                      This certificate has been verified on the blockchain
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Certificate Details */}
                  <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                        Student Name
                      </p>
                      <p className="font-semibold text-lg text-slate-900 dark:text-white">
                        {result.studentName || 'N/A'}
                      </p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                        Course
                      </p>
                      <p className="font-semibold text-lg text-slate-900 dark:text-white">
                        {result.courseName || 'N/A'}
                      </p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                        Issue Date
                      </p>
                      <p className="font-semibold text-lg text-slate-900 dark:text-white">
                        {result.issueDate || 'N/A'}
                      </p>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 p-4 rounded-lg">
                      <p className="text-sm text-green-700 dark:text-green-300 mb-2 font-medium">
                        ✓ Verified on Blockchain
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400">
                        Certificate data is immutable and permanently stored
                      </p>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="flex flex-col items-center justify-center bg-white dark:bg-slate-800 p-4 rounded-lg">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      Certificate QR Code
                    </p>
                    <div ref={qrCodeRef}>
                      <QRCode
                        value={certificateHash}
                        size={200}
                        bgColor={
                          document.documentElement.classList.contains('dark')
                            ? '#1e293b'
                            : '#ffffff'
                        }
                        fgColor={
                          document.documentElement.classList.contains('dark')
                            ? '#ffffff'
                            : '#000000'
                        }
                      />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 text-center mb-4">
                      Scan to share certificate
                    </p>

                    {/* QR Code Action Buttons */}
                    <div className="w-full grid grid-cols-3 gap-2">
                      <button
                        onClick={handleDownloadQR}
                        className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors text-xs font-medium"
                        title="Download QR code as PNG"
                      >
                        <Download size={16} />
                        <span className="hidden sm:inline">Download</span>
                        <span className="sm:hidden">DL</span>
                      </button>

                      <button
                        onClick={handleShare}
                        className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors text-xs font-medium"
                        title="Share verification link"
                      >
                        <Share2 size={16} />
                        <span className="hidden sm:inline">Share</span>
                        <span className="sm:hidden">📤</span>
                      </button>

                      <button
                        onClick={handleCopyHash}
                        className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors text-xs font-medium ${
                          isCopied
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                        }`}
                        title="Copy hash to clipboard"
                      >
                        <Copy size={16} />
                        <span className="hidden sm:inline">
                          {isCopied ? 'Copied' : 'Copy'}
                        </span>
                        <span className="sm:hidden">{isCopied ? '✓' : '©'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Invalid Certificate Card
              <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-xl shadow-lg p-6 border-2 border-red-200 dark:border-red-800">
                <div className="flex gap-4">
                  <XCircle
                    size={32}
                    className="text-red-600 dark:text-red-400 flex-shrink-0"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-red-900 dark:text-red-100">
                      ✗ Certificate Invalid
                    </h3>
                    <p className="text-red-700 dark:text-red-200 text-sm mt-1">
                      {result.error || 'This certificate could not be found or verified on the blockchain'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-white dark:bg-slate-800 rounded-lg">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    Certificate Hash
                  </p>
                  <p className="font-mono text-xs text-slate-900 dark:text-white break-all">
                    {certificateHash}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!result && !isLoading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
              <Search size={32} className="text-slate-400" />
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Enter a certificate hash above to verify its authenticity
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
